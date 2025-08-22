import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Filter, AlertCircle, Mic, Zap, MicOff, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
// SpeechRecognition 타입 확장
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// 확장된 SearchParams 인터페이스
interface ExtendedSearchParams {
  location?: string;
  chargerType?: string;
  useGPS: boolean;
  isNaturalLanguageQuery?: boolean;
  originalQuery?: string;
}

interface SearchSectionProps {
  onSearch: (params: ExtendedSearchParams) => void;
  loading: boolean;
  error?: string | null;
}

interface GeminiResponse {
  isNaturalLanguageQuery: boolean;
  extractedLocation: string;
  extractedChargerType?: string;
  searchIntent: string;
  confidence: number;
}

export const SearchSection = ({ onSearch, loading, error }: SearchSectionProps) => {
  const [location, setLocation] = useState("");
  const [chargerType, setChargerType] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<GeminiResponse | null>(null);
  const [searchCompleted, setSearchCompleted] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Gemini API 호출 함수
  const processWithGemini = async (query: string): Promise<GeminiResponse | null> => {
    try {
      setGeminiLoading(true);
      
      const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBbaSFTol8-NcwlBH0wPCG96rUPcOpGuLw';
      
      const prompt = `
당신은 전기차 충전소 검색 쿼리를 분석하는 AI입니다. 다음 사용자 입력을 분석하고 JSON 형식으로 응답해주세요:

입력: "${query}"

다음 정보를 추출해주세요:
1. isNaturalLanguageQuery: 자연어 질문인지 여부 (true/false)
2. extractedLocation: 추출된 지역명 (예: "강남구", "서울시 강남구", "부산광역시" 등)
3. extractedChargerType: 충전기 타입 ("DC콤보", "DC차데모", "AC3상", "B타입", "C타입", "BC타입" 중 하나, 없으면 null)
4. searchIntent: 검색 의도 설명
5. confidence: 분석 정확도 (0-1 사이의 숫자)

충전기 타입 매핑:
- "급속", "빠른", "고속" → "DC콤보"
- "완속", "느린" → "AC3상"
- 구체적인 타입명이 있으면 그대로 사용

응답은 반드시 유효한 JSON 형식이어야 합니다.

예시:
입력: "강남구 근처 급속 충전소를 알려줘"
응답: {
  "isNaturalLanguageQuery": true,
  "extractedLocation": "강남구",
  "extractedChargerType": "DC콤보",
  "searchIntent": "강남구 지역의 급속 충전소 검색",
  "confidence": 0.9
}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from Gemini');
      }

      // JSON 추출 (마크다운 코드 블록 제거)
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }

      const jsonString = jsonMatch[1] || jsonMatch[0];
      const parsedResponse = JSON.parse(jsonString.trim());
      
      return parsedResponse;

    } catch (error) {
      console.error('Gemini API Error:', error);
      return null;
    } finally {
      setGeminiLoading(false);
    }
  };

  // 음성인식 지원 여부 확인 및 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'ko-KR';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
          setAiAnalysis(null);
          setGeminiResponse(null);
          setSearchCompleted(false);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            const cleanTranscript = finalTranscript.trim();
            setLocation(cleanTranscript);
            setTranscript(cleanTranscript);
            analyzeVoiceInput(cleanTranscript);
            
            // 음성인식 완료 후 Gemini 분석 및 자동 검색 실행
            setTimeout(() => {
              handleIntelligentSearch(cleanTranscript);
            }, 500);
          } else {
            setLocation(interimTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          let errorMessage = "음성 인식 중 오류가 발생했습니다.";
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = "음성을 감지할 수 없습니다. 다시 시도해 주세요.";
              break;
            case 'audio-capture':
              errorMessage = "마이크에 접근할 수 없습니다. 마이크 연결을 확인해 주세요.";
              break;
            case 'not-allowed':
              errorMessage = "마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해 주세요.";
              break;
            case 'network':
              errorMessage = "네트워크 연결을 확인해 주세요.";
              break;
            case 'service-not-allowed':
              errorMessage = "음성인식 서비스를 사용할 수 없습니다. HTTPS 환경에서 시도해 주세요.";
              break;
          }
          
          setVoiceError(errorMessage);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // AI 음성 분석 시뮬레이션 (기존 유지)
  const analyzeVoiceInput = (input: string) => {
    const keywords = {
      urgent: ['지금', '당장', '급히', '빨리'],
      nearby: ['근처', '주변', '가까운', '인근'],
      fast: ['급속', '빠른', 'DC'],
      available: ['사용 가능한', '비어있는', '쓸 수 있는']
    };

    let analysis = [];
    
    if (keywords.urgent.some(word => input.includes(word))) {
      analysis.push('긴급 충전 필요');
    }
    if (keywords.nearby.some(word => input.includes(word))) {
      analysis.push('근거리 검색');
    }
    if (keywords.fast.some(word => input.includes(word))) {
      analysis.push('급속 충전기');
    }
    if (keywords.available.some(word => input.includes(word))) {
      analysis.push('사용 가능한 충전소만');
    }

    if (analysis.length > 0) {
      setAiAnalysis(analysis.join(', '));
    }
  };

  // 지능형 검색 처리
  const handleIntelligentSearch = async (query: string) => {
    const geminiResult = await processWithGemini(query);
    
    if (geminiResult) {
      setGeminiResponse(geminiResult);
      
      // Gemini 분석 결과를 바탕으로 검색 실행
      if (geminiResult.extractedLocation) {
        // 추출된 정보로 UI 업데이트
        setLocation(geminiResult.extractedLocation);
        
        if (geminiResult.extractedChargerType) {
          setChargerType(geminiResult.extractedChargerType);
        }
        
        // 검색 실행
        onSearch({
          location: geminiResult.extractedLocation,
          chargerType: geminiResult.extractedChargerType || (chargerType && chargerType !== "all" ? chargerType : undefined),
          useGPS: false,
          isNaturalLanguageQuery: geminiResult.isNaturalLanguageQuery,
          originalQuery: query
        } as ExtendedSearchParams);
      }
    } else {
      // Gemini 실패 시 기존 방식으로 폴백
      handleAutoSearch(query);
    }
  };

  const handleVoiceSearch = () => {
    if (!speechSupported) {
      setVoiceError("이 브라우저는 음성인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      setVoiceError(null);
      setTranscript("");
      setGeminiResponse(null);
      setSearchCompleted(false);
      recognitionRef.current?.start();
    } catch (error) {
      console.error('음성인식 시작 오류:', error);
      setVoiceError("음성인식을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  // 기존 자동 검색 (폴백용)
  const handleAutoSearch = (voiceLocation: string) => {
    if (voiceLocation.trim()) {
      onSearch({
        location: voiceLocation.trim(),
        chargerType: chargerType && chargerType !== "all" ? chargerType : undefined,
        useGPS: false
      } as ExtendedSearchParams);
    }
  };

  // 일반 검색 처리 (지능형 검색 포함)
  const handleSearch = async () => {
    const query = location.trim();
    if (!query) return;

    // 자연어 질문 패턴 감지
    const naturalLanguagePatterns = [
      /찾아줘|알려줘|알려주세요|찾아줘|찾아주세요|어디|있나요|보여줘/,
      /근처|주변|가까운|인근/,
      /급속|완속|빠른|느린/,
      /충전소|충전기|스테이션/
    ];

    const isLikelyNaturalLanguage = naturalLanguagePatterns.some(pattern => pattern.test(query));

    if (isLikelyNaturalLanguage) {
      // 자연어 쿼리로 판단되면 Gemini 처리
      await handleIntelligentSearch(query);
    } else {
      // 단순 지역명으로 판단되면 바로 검색
      onSearch({
        location: query,
        chargerType: chargerType && chargerType !== "all" ? chargerType : undefined,
        useGPS: false
      } as ExtendedSearchParams);
    }
  };

  const handleGPSSearch = () => {
    onSearch({
      useGPS: true,
      chargerType: chargerType && chargerType !== "all" ? chargerType : undefined
    } as ExtendedSearchParams);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-foreground">전기차 충전소 찾기</h1>
        <p className="text-muted-foreground text-m">
          빠르고 편리하게 충전소를 찾아보세요 - 자연어 질문도 가능합니다!
        </p>
      </div>

      {/* 에러 메시지 표시 */}
      {(error || voiceError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || voiceError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg p-6 shadow-lg border">
        <div className="space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={
                isListening 
                  ? "음성을 듣고 있습니다..." 
                  : "예: 강남구 근처 급속 충전소를 알려줘 / 서울시"
              }
              className="pr-20"
              onKeyPress={handleKeyPress}
              disabled={loading || isListening || geminiLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceSearch}
                disabled={loading || geminiLoading}
                className={`p-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-gray-700'}`}
                title={isListening ? '음성인식 중지' : '음성으로 검색'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSearch} 
                className="p-2"
                disabled={loading || geminiLoading || !location.trim()}
              >
                {geminiLoading ? (
                  <Brain className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 음성인식 상태 표시 */}
          {isListening && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-red-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">음성을 듣고 있습니다... 자연스럽게 말씀해 주세요</span>
              </div>
            </div>
          )}

          {/* Gemini 처리 중 상태 */}
          {geminiLoading && (
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <Brain className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI가 요청을 분석하고 있습니다...</span>
              </div>
            </div>
          )}

          {/* Gemini 분석 결과 */}
          {geminiResponse && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg">
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">AI 분석 결과</p>
                    <p className="text-xs text-purple-700 mt-1">
                      검색 의도: {geminiResponse.searchIntent}
                    </p>
                    <p className="text-xs text-purple-700">
                      추출된 지역: {geminiResponse.extractedLocation}
                    </p>
                    {geminiResponse.extractedChargerType && (
                      <p className="text-xs text-purple-700">
                        충전기 타입: {geminiResponse.extractedChargerType}
                      </p>
                    )}
                    <p className="text-xs text-purple-600">
                      분석 정확도: {Math.round(geminiResponse.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 기존 AI 분석 결과 (음성인식용) */}
          {aiAnalysis && transcript && !geminiResponse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">기본 AI 분석 결과</p>
                    <p className="text-xs text-blue-700 mt-1">
                      인식된 음성: "{transcript}"
                    </p>
                    <p className="text-xs text-blue-700">
                      요청사항: {aiAnalysis}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 필터 및 GPS 검색 */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Select value={chargerType} onValueChange={setChargerType} disabled={loading || geminiLoading}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-0" />
                  <SelectValue placeholder="충전기 종류" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="DC콤보">DC콤보</SelectItem>
                  <SelectItem value="DC차데모">DC차데모</SelectItem>
                  <SelectItem value="AC3상">AC3상</SelectItem>
                  <SelectItem value="B타입">B타입(5핀)</SelectItem>
                  <SelectItem value="C타입">C타입(5핀)</SelectItem>
                  <SelectItem value="BC타입">BC타입</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={handleGPSSearch}
              disabled={loading || geminiLoading}
              className="px-6"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {loading || geminiLoading ? "처리 중..." : "주변 찾기"}
            </Button>
          </div>

          {!speechSupported && (
            <div className="text-xs text-amber-600 text-center border-t pt-3">
              ⚠️ 음성인식이 지원되지 않는 브라우저입니다. Chrome 브라우저 사용을 권장합니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
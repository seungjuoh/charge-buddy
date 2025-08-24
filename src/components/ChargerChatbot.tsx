
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, MessageCircle, Camera, Loader2, X, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface AnalysisResult {
  extractedText: string;
  solution: string;
  location?: LocationData;
  captureDate?: string;
}

export const ChargerChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  // Get user location when component mounts
  useEffect(() => {
    if (isOpen && !location) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('GPS를 지원하지 않는 브라우저입니다.');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Try to get address from coordinates (reverse geocoding)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ko`
        );
        const data = await response.json();
        const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        setLocation({ latitude, longitude, address });
      } catch {
        setLocation({ latitude, longitude });
      }

      toast({
        title: "위치 확인 완료",
        description: "현재 위치를 확인했습니다.",
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "위치 확인 실패",
        description: "GPS 권한을 허용해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "파일 크기 오류",
          description: "이미지 파일 크기는 10MB 이하여야 합니다.",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      setResult(null);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    const captureDate = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    setIsAnalyzing(true);
    try {
      // Step 1: OCR - Extract text from image
      const ocrFormData = new FormData();
      ocrFormData.append('document', selectedImage);
      ocrFormData.append('model', 'ocr');

      const ocrResponse = await fetch('https://api.upstage.ai/v1/document-digitization', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer up_4RHT7fYWAXqFsrDFjXkFVD1HbaH6Z',
        },
        body: ocrFormData,
      });

      const ocrResult = await ocrResponse.json();
      const extractedText = ocrResult.text || '';

      // Step 2: AI Analysis using Solar Pro2
      const aiResponse = await fetch('https://api.upstage.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer up_4RHT7fYWAXqFsrDFjXkFVD1HbaH6Z',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'solar-pro2',
          messages: [
            {
              role: 'user',
              content: `You are an AI assistant that helps users solve electric vehicle (EV) charger issues. 
The following text was extracted from a photo of an EV charger error or manual:

"""${extractedText}"""

Identify the issue, summarize it, and suggest an actionable solution in Korean.
If possible, include the specific cause (if mentioned) and suggest the next steps.
Format your response in a clear, user-friendly way with:
1. 오류 요약 (Error Summary)
2. 원인 분석 (Cause Analysis) 
3. 해결 방법 (Solution Steps)
4. 추가 조치 (Additional Actions if needed)`
            }
          ],
          stream: false
        }),
      });

      const aiResult = await aiResponse.json();
      const solution = aiResult.choices?.[0]?.message?.content || '분석 결과를 가져올 수 없습니다.';

      setResult({
        extractedText,
        solution,
        location,
        captureDate,
      });
      
      toast({
        title: "분석 완료",
        description: "충전기 오류를 분석했습니다.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: "이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reportMalfunction = () => {
    if (!result) return;

    const reportData = {
      extractedText: result.extractedText,
      solution: result.solution,
      location: result.location,
      captureDate: result.captureDate,
    };

    console.log('고장 신고 데이터:', reportData);
    
    toast({
      title: "고장 신고 완료",
      description: "충전기 고장이 신고되었습니다.",
    });
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setLocation(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 transition-colors z-50"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              충전기 오류 해결 도우미
            </DialogTitle>
          </DialogHeader>

          {/* Location and Date Info */}
          <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">현재 위치:</span>
              {isGettingLocation ? (
                <span className="text-muted-foreground">위치 확인 중...</span>
              ) : location ? (
                <span className="text-foreground truncate">
                  {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                  위치 허용
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">촬영 시간:</span>
              <span className="text-foreground">
                {new Date().toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {!selectedImage && !result && (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">충전기 오류 화면 사진을 업로드하세요</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG 파일 (최대 10MB)
                    </p>
                  </div>
                  <Button variant="outline" onClick={triggerFileInput} className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    사진 선택
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    style={{ display: 'none' }}
                  />
                </CardContent>
              </Card>
            )}

            {selectedImage && !result && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">선택된 이미지</CardTitle>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedImage.name}
                  </div>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected charging error"
                    className="w-full rounded-md max-h-48 object-contain bg-muted"
                  />
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        오류 분석 중...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        오류 분석하기
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">분석 결과</h3>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <X className="h-4 w-4 mr-2" />
                    새로운 분석
                  </Button>
                </div>

                {result.extractedText && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">추출된 텍스트</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {result.extractedText}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">해결 방법</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm font-sans">
                        {result.solution}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Section */}
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      충전기 고장 신고
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.location && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>신고 위치: {result.location.address || `${result.location.latitude.toFixed(6)}, ${result.location.longitude.toFixed(6)}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>촬영 일시: {result.captureDate}</span>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={reportMalfunction}
                      className="w-full"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      충전기 고장 신고하기
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      고장 신고 시 현재 위치와 시간 정보가 함께 전송됩니다.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

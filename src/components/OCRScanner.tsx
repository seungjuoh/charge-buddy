import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Camera, Loader2, X, AlertTriangle, Car, Receipt, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalysisResult {
  extractedText: string;
  solution: string;
}

interface OCRResult {
  type: 'equipment' | 'vehicle' | 'receipt';
  data: any;
  confidence: number;
}

const mockOCRResults = {
  equipment: {
    chargerId: 'KEP-SC-001-234',
    errorCode: 'E-203',
    errorMessage: '통신 오류',
    location: '서울시 강남구 테헤란로 123',
    manufacturer: 'KEP 에너지',
    installDate: '2023-05-15'
  },
  vehicle: {
    plateNumber: '12가 3456',
    model: '현대 아이오닉 6',
    year: '2023',
    manufacturer: '현대자동차',
    batteryCapacity: '77.4kWh',
    vinNumber: 'KMHJ381GPNA123456'
  },
  receipt: {
    chargeAmount: 45300,
    energyCharged: '28.5kWh',
    chargeDuration: '45분',
    chargeStartTime: '2024-01-15 14:30',
    chargeEndTime: '2024-01-15 15:15',
    chargingRate: '292원/kWh',
    paymentMethod: '신용카드'
  }
};

export const OCRScanner = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('equipment');
  const [ocrResult, setOCRResult] = useState<OCRResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (type: 'equipment' | 'vehicle' | 'receipt') => {
    setIsScanning(true);
    setOCRResult(null);

    // OCR 처리 시뮬레이션
    setTimeout(() => {
      setOCRResult({
        type,
        data: mockOCRResults[type],
        confidence: 0.95
      });
      setIsScanning(false);
    }, 3000);
  };

  const handleFileUpload = (type: 'equipment' | 'vehicle' | 'receipt') => {
    // 파일 업로드 시뮬레이션
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files?.[0]) {
        handleScan(type);
      }
    };
    input.click();
  };

  const renderEquipmentResult = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          충전기 고장 신고
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">충전기 ID</span>
            <p className="font-medium">{ocrResult?.data.chargerId}</p>
          </div>
          <div>
            <span className="text-gray-600">에러 코드</span>
            <p className="font-medium text-red-600">{ocrResult?.data.errorCode}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">에러 메시지</span>
            <p className="font-medium">{ocrResult?.data.errorMessage}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">위치</span>
            <p className="font-medium">{ocrResult?.data.location}</p>
          </div>
        </div>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            고장 신고가 자동으로 접수되었습니다. 신고번호: R2024011501
          </AlertDescription>
        </Alert>
        <Button className="w-full">고객센터 연결</Button>
      </CardContent>
    </Card>
  );

  const renderVehicleResult = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <Car className="w-5 h-5" />
          차량 정보 자동 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">차량번호</span>
            <p className="font-medium">{ocrResult?.data.plateNumber}</p>
          </div>
          <div>
            <span className="text-gray-600">차량모델</span>
            <p className="font-medium">{ocrResult?.data.model}</p>
          </div>
          <div>
            <span className="text-gray-600">연식</span>
            <p className="font-medium">{ocrResult?.data.year}</p>
          </div>
          <div>
            <span className="text-gray-600">제조사</span>
            <p className="font-medium">{ocrResult?.data.manufacturer}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">배터리 용량</span>
            <p className="font-medium">{ocrResult?.data.batteryCapacity}</p>
          </div>
        </div>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            차량 정보가 프로필에 자동으로 저장되었습니다.
          </AlertDescription>
        </Alert>
        <Button className="w-full">프로필에서 확인</Button>
      </CardContent>
    </Card>
  );

  const renderReceiptResult = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <Receipt className="w-5 h-5" />
          충전 영수증 자동 기록
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">충전 금액</span>
            <p className="font-medium">{ocrResult?.data.chargeAmount?.toLocaleString()}원</p>
          </div>
          <div>
            <span className="text-gray-600">충전량</span>
            <p className="font-medium">{ocrResult?.data.energyCharged}</p>
          </div>
          <div>
            <span className="text-gray-600">충전 시간</span>
            <p className="font-medium">{ocrResult?.data.chargeDuration}</p>
          </div>
          <div>
            <span className="text-gray-600">요금</span>
            <p className="font-medium">{ocrResult?.data.chargingRate}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">충전 기간</span>
            <p className="font-medium">
              {ocrResult?.data.chargeStartTime} ~ {ocrResult?.data.chargeEndTime}
            </p>
          </div>
        </div>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            충전 기록이 가계부에 자동으로 저장되었습니다.
          </AlertDescription>
        </Alert>
        <Button className="w-full">가계부에서 확인</Button>
      </CardContent>
    </Card>
  );

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
    const fileInput = document.getElementById('ocr-image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

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

      const ocrResponseData = await ocrResponse.json();
      const extractedText = ocrResponseData.text || '';

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

"""
${extractedText}
"""

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

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">OCR 스캔</h2>
        <p className="text-sm text-gray-600">사진을 촬영하여 정보를 자동으로 인식합니다</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipment" className="text-xs">
            충전기 고장
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="text-xs">
            차량 정보
          </TabsTrigger>
          <TabsTrigger value="receipt" className="text-xs">
            영수증 인식
          </TabsTrigger>
          <TabsTrigger value="aiAnalysis" className="text-xs">
          충전기 고장2
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                충전기 고장 신고
              </CardTitle>
              <p className="text-sm text-gray-600">
                고장난 충전기나 파손된 시설물을 촬영하면 충전기 번호와 에러메시지를 자동으로 인식합니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleScan('equipment')}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  사진 촬영
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleFileUpload('equipment')}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  파일 업로드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scanning Status */}
          {isScanning && (
            <Card className="border-blue-200 bg-blue-50 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">OCR 인식 중...</p>
                    <p className="text-sm text-blue-700">이미지를 분석하고 있습니다</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OCR Results */}
          {ocrResult && ocrResult.type === 'equipment' && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  인식 정확도: {(ocrResult.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
              {renderEquipmentResult()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicle" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-500" />
                차량 정보 등록
              </CardTitle>
              <p className="text-sm text-gray-600">
                차량등록증, 번호판, 보험증을 촬영하면 차량 정보를 자동으로 입력합니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleScan('vehicle')}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  사진 촬영
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleFileUpload('vehicle')}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  파일 업로드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scanning Status */}
          {isScanning && (
            <Card className="border-blue-200 bg-blue-50 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">OCR 인식 중...</p>
                    <p className="text-sm text-blue-700">이미지를 분석하고 있습니다</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OCR Results */}
          {ocrResult && ocrResult.type === 'vehicle' && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  인식 정확도: {(ocrResult.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
              {renderVehicleResult()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="receipt" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-500" />
                영수증 자동 기록
              </CardTitle>
              <p className="text-sm text-gray-600">
                충전 영수증을 촬영하면 충전 정보를 자동으로 가계부에 기록합니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleScan('receipt')}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  사진 촬영
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleFileUpload('receipt')}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  파일 업로드
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scanning Status */}
          {isScanning && (
            <Card className="border-blue-200 bg-blue-50 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">OCR 인식 중...</p>
                    <p className="text-sm text-blue-700">이미지를 분석하고 있습니다</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OCR Results */}
          {ocrResult && ocrResult.type === 'receipt' && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  인식 정확도: {(ocrResult.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
              {renderReceiptResult()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aiAnalysis" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-500" />
                충전기 오류 해결 도우미
              </CardTitle>
              <p className="text-sm text-gray-600">
                충전기 오류 화면 사진을 업로드 하세요. 
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG 파일 (최대 10MB)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                id="ocr-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {!selectedImage ? (
                // <Button onClick={triggerFileInput} className="">
                //   <Upload className="w-4 h-4 mr-2" />
                //   이미지 선택
                // </Button>
                <Button variant="outline" onClick={triggerFileInput} className="w-full cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                파일 업로드
              </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedImage.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        이미지 분석
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>AI 분석 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">추출된 텍스트:</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {result.extractedText}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI 분석 결과:</h4>
                  <div className="text-sm whitespace-pre-line bg-muted p-3 rounded">
                    {result.solution}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
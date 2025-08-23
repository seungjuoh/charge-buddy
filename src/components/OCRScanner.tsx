import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertTriangle, Car, Receipt, CheckCircle } from "lucide-react";
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

  const handleFileUpload = (type: 'equipment' | 'vehicle' | 'receipt') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.[0]) {
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
        }, 2000);
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
            <span className="text-muted-foreground">충전기 ID</span>
            <p className="font-medium text-foreground">{ocrResult?.data.chargerId}</p>
          </div>
          <div>
            <span className="text-muted-foreground">에러 코드</span>
            <p className="font-medium text-destructive">{ocrResult?.data.errorCode}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">에러 메시지</span>
            <p className="font-medium text-foreground">{ocrResult?.data.errorMessage}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">위치</span>
            <p className="font-medium text-foreground">{ocrResult?.data.location}</p>
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

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">OCR 스캔</h2>
        <p className="text-sm text-muted-foreground">사진을 업로드하여 정보를 자동으로 인식합니다</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipment">충전기 고장 신고</TabsTrigger>
          <TabsTrigger value="vehicle">차량 정보</TabsTrigger>
          <TabsTrigger value="receipt">영수증 인식</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                충전기 고장 신고
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                고장난 충전기나 파손된 시설물의 이미지를 업로드하면 충전기 번호와 에러메시지를 자동으로 인식합니다.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                onClick={() => handleFileUpload('equipment')}
                disabled={isScanning}
                className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-black border-transparent"
              >
                <Upload className="w-4 h-4" />
                파일 업로드
              </Button>
            </CardContent>
          </Card>

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
              </CardContent>
            </Card>
          )}

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
              <p className="text-sm text-muted-foreground">
                차량등록증, 번호판, 보험증을 업로드하면 차량 정보를 자동으로 입력합니다.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                onClick={() => handleFileUpload('vehicle')}
                disabled={isScanning}
                className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-black border-transparent"
              >
                <Upload className="w-4 h-4" />
                파일 업로드
              </Button>
            </CardContent>
          </Card>

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
              </CardContent>
            </Card>
          )}

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
              <p className="text-sm text-muted-foreground">
                충전 영수증을 업로드하면 충전 정보를 자동으로 가계부에 기록합니다.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                onClick={() => handleFileUpload('receipt')}
                disabled={isScanning}
                className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-black border-transparent"
              >
                <Upload className="w-4 h-4" />
                파일 업로드
              </Button>
            </CardContent>
          </Card>

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
              </CardContent>
            </Card>
          )}

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
      </Tabs>
    </div>
  );
};
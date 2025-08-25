import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertTriangle, Car, Receipt, CheckCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Tesseract from 'tesseract.js';

interface AnalysisResult {
  extractedText: string;
  solution: string;
}

interface OCRResult {
  type: 'equipment' | 'vehicle' | 'receipt';
  data: any;
  confidence: number;
}

interface VehicleModel {
  name: string;
  year: string[];
  batteryCapacity: string;
  range: string;
}

interface VehicleManufacturer {
  name: string;
  models: { [key: string]: VehicleModel };
}

interface ReceiptData {
  chargeAmount?: number;
  energyCharged?: string;
  chargeDuration?: string;
  chargeStartTime?: string;
  chargeEndTime?: string;
  chargingRate?: string;
  paymentMethod?: string;
  location?: string;
  chargerType?: string;
}

// 전기차 데이터베이스
const electricVehicles: { [key: string]: VehicleManufacturer } = {
  "현대자동차": {
    name: "현대자동차",
    models: {
      "아이오닉 5": { name: "아이오닉 5", year: ["2021", "2022", "2023", "2024"], batteryCapacity: "77.4kWh", range: "429km" },
      "아이오닉 6": { name: "아이오닉 6", year: ["2022", "2023", "2024"], batteryCapacity: "77.4kWh", range: "524km" },
      "코나 일렉트릭": { name: "코나 일렉트릭", year: ["2019", "2020", "2021", "2022", "2023"], batteryCapacity: "64kWh", range: "406km" },
      "넥쏘": { name: "넥쏘", year: ["2018", "2019", "2020", "2021", "2022", "2023"], batteryCapacity: "수소연료전지", range: "609km" }
    }
  },
  "기아자동차": {
    name: "기아자동차",
    models: {
      "EV6": { name: "EV6", year: ["2021", "2022", "2023", "2024"], batteryCapacity: "77.4kWh", range: "475km" },
      "EV9": { name: "EV9", year: ["2023", "2024"], batteryCapacity: "99.8kWh", range: "501km" },
      "니로 EV": { name: "니로 EV", year: ["2019", "2020", "2021", "2022", "2023"], batteryCapacity: "64.8kWh", range: "385km" },
      "레이 EV": { name: "레이 EV", year: ["2022", "2023", "2024"], batteryCapacity: "35.2kWh", range: "205km" }
    }
  },
  "제네시스": {
    name: "제네시스",
    models: {
      "GV60": { name: "GV60", year: ["2022", "2023", "2024"], batteryCapacity: "77.4kWh", range: "429km" },
      "GV70 일렉트리파이드": { name: "GV70 일렉트리파이드", year: ["2022", "2023", "2024"], batteryCapacity: "77.4kWh", range: "400km" },
      "G80 일렉트리파이드": { name: "G80 일렉트리파이드", year: ["2022", "2023", "2024"], batteryCapacity: "87.2kWh", range: "427km" }
    }
  },
  "테슬라": {
    name: "테슬라",
    models: {
      "모델 3": { name: "모델 3", year: ["2019", "2020", "2021", "2022", "2023", "2024"], batteryCapacity: "75kWh", range: "528km" },
      "모델 Y": { name: "모델 Y", year: ["2022", "2023", "2024"], batteryCapacity: "75kWh", range: "511km" },
      "모델 S": { name: "모델 S", year: ["2021", "2022", "2023", "2024"], batteryCapacity: "100kWh", range: "652km" },
      "모델 X": { name: "모델 X", year: ["2021", "2022", "2023", "2024"], batteryCapacity: "100kWh", range: "543km" }
    }
  },
  "BMW": {
    name: "BMW",
    models: {
      "i3": { name: "i3", year: ["2019", "2020", "2021", "2022"], batteryCapacity: "42.2kWh", range: "359km" },
      "i4": { name: "i4", year: ["2022", "2023", "2024"], batteryCapacity: "83.9kWh", range: "590km" },
      "iX3": { name: "iX3", year: ["2021", "2022", "2023"], batteryCapacity: "74kWh", range: "440km" },
      "iX": { name: "iX", year: ["2022", "2023", "2024"], batteryCapacity: "111.5kWh", range: "630km" }
    }
  },
  "메르세데스-벤츠": {
    name: "메르세데스-벤츠",
    models: {
      "EQC": { name: "EQC", year: ["2020", "2021", "2022", "2023"], batteryCapacity: "80kWh", range: "423km" },
      "EQS": { name: "EQS", year: ["2022", "2023", "2024"], batteryCapacity: "107.8kWh", range: "700km" },
      "EQE": { name: "EQE", year: ["2023", "2024"], batteryCapacity: "90.6kWh", range: "550km" }
    }
  },
  "볼보": {
    name: "볼보",
    models: {
      "XC40 리차지": { name: "XC40 리차지", year: ["2021", "2022", "2023"], batteryCapacity: "78kWh", range: "423km" },
      "C40 리차지": { name: "C40 리차지", year: ["2022", "2023", "2024"], batteryCapacity: "78kWh", range: "434km" }
    }
  }
};

const mockOCRResults = {
  equipment: {
    chargerId: 'KEP-SC-001-234',
    errorCode: 'E-203',
    errorMessage: '통신 오류',
    location: '서울시 강남구 테헤란로 123',
    manufacturer: 'KEP 에너지',
    installDate: '2023-05-15'
  }
};

// OCR에서 영수증 정보 추출하는 함수
const extractReceiptData = (text: string): ReceiptData => {
  const data: ReceiptData = {};
  
  // 충전 금액 추출 (원 단위)
  const amountMatch = text.match(/(\d{1,3}(?:,\d{3})*)\s*원/);
  if (amountMatch) {
    data.chargeAmount = parseInt(amountMatch[1].replace(/,/g, ''));
  }
  
  // 충전량 추출 (kWh 단위)
  const energyMatch = text.match(/(\d+(?:\.\d+)?)\s*kWh/i);
  if (energyMatch) {
    data.energyCharged = energyMatch[1] + 'kWh';
  }
  
  // 충전 시간 추출
  const durationMatch = text.match(/(\d+)\s*시간?\s*(\d+)?\s*분?/);
  if (durationMatch) {
    const hours = durationMatch[1];
    const minutes = durationMatch[2] || '0';
    data.chargeDuration = `${hours}시간 ${minutes}분`;
  }
  
  // 결제 방법 추출
  if (text.includes('카드') || text.includes('신용카드') || text.includes('체크카드')) {
    data.paymentMethod = '카드';
  } else if (text.includes('현금')) {
    data.paymentMethod = '현금';
  }
  
  // 충전기 타입 추출
  if (text.includes('급속') || text.includes('DC')) {
    data.chargerType = 'DC 급속충전';
  } else if (text.includes('완속') || text.includes('AC')) {
    data.chargerType = 'AC 완속충전';
  }
  
  // 충전 요금 (원/kWh) 추출
  const rateMatch = text.match(/(\d+(?:\.\d+)?)\s*원\s*\/\s*kWh/i);
  if (rateMatch) {
    data.chargingRate = rateMatch[1] + '원/kWh';
  }
  
  // 위치/충전소명 추출 (보통 상단에 위치)
  const lines = text.split('\n').filter(line => line.trim());
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && !line.match(/^\d+$/) && line.includes('충전')) {
      data.location = line;
      break;
    }
  }
  
  // 시간 정보 추출 (시작/종료)
  const timePattern = /(\d{4}[-\/]\d{2}[-\/]\d{2}\s+\d{2}:\d{2})/g;
  const timeMatches = text.match(timePattern);
  if (timeMatches && timeMatches.length >= 2) {
    data.chargeStartTime = timeMatches[0];
    data.chargeEndTime = timeMatches[1];
  }
  
  return data;
};

export const OCRScanner = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('equipment');
  const [ocrResult, setOCRResult] = useState<OCRResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // 차량 선택 관련 상태
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const handleFileUpload = (type: 'equipment' | 'receipt') => {
    // 파일 업로드 input 생성 (equipment, receipt 전용)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.[0]) {
        setIsScanning(true);
        setOCRResult(null);

        if (type === 'receipt') {
          // OCR 엔진으로 실제 분석
          try {
            const { data } = await Tesseract.recognize(input.files[0], 'kor+eng', {
              logger: m => console.log(m) // OCR 진행상황 로그
            });
            
            console.log('OCR 원본 텍스트:', data.text);
            
            const extractedData = extractReceiptData(data.text);
            console.log('추출된 데이터:', extractedData);
            
            setOCRResult({
              type: 'receipt',
              data: {
                rawText: data.text,
                ...extractedData
              },
              confidence: data.confidence / 100,
            });
            
            toast({
              title: "영수증 인식 완료",
              description: "영수증 정보가 성공적으로 추출되었습니다.",
            });
            
          } catch (err) {
            console.error('OCR 오류:', err);
            toast({
              title: "인식 실패",
              description: "영수증을 인식하지 못했습니다. 다시 시도해주세요.",
              variant: "destructive"
            });
          } finally {
            setIsScanning(false);
          }
        } else {
          // equipment → 기존 mock 데이터
          setTimeout(() => {
            setOCRResult({
              type,
              data: mockOCRResults[type],
              confidence: 0.95,
            });
            setIsScanning(false);
          }, 2000);
        }
      }
    };
    input.click();
  };

  const handleVehicleSelection = () => {
    if (!selectedManufacturer || !selectedModel || !selectedYear || !plateNumber.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 정보를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const manufacturerData = electricVehicles[selectedManufacturer];
    const modelData = manufacturerData.models[selectedModel];

    const vehicleData = {
      plateNumber: plateNumber.trim(),
      manufacturer: selectedManufacturer,
      model: selectedModel,
      year: selectedYear,
      batteryCapacity: modelData.batteryCapacity,
      range: modelData.range,
      vinNumber: `VIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    setOCRResult({
      type: 'vehicle',
      data: vehicleData,
      confidence: 1.0 // 수동 선택이므로 100% 정확도
    });

    setShowVehicleSelector(false);
    
    toast({
      title: "차량 정보 등록 완료",
      description: `${selectedManufacturer} ${selectedModel}이(가) 등록되었습니다.`,
    });
  };

  const resetVehicleSelector = () => {
    setSelectedManufacturer('');
    setSelectedModel('');
    setSelectedYear('');
    setPlateNumber('');
    setShowVehicleSelector(false);
  };

  // 차량 선택기 컴포넌트
  const renderVehicleSelector = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          차량 정보 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 차량번호 입력 */}
        <div className="space-y-2">
          <Label htmlFor="plateNumber">차량번호</Label>
          <Input
            id="plateNumber"
            placeholder="예: 12가3456"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
        </div>

        {/* 제조사 선택 */}
        <div className="space-y-2">
          <Label>제조사</Label>
          <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
            <SelectTrigger>
              <SelectValue placeholder="제조사를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(electricVehicles).map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 모델 선택 */}
        {selectedManufacturer && (
          <div className="space-y-2">
            <Label>모델</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="모델을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(electricVehicles[selectedManufacturer].models).map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 연식 선택 */}
        {selectedModel && (
          <div className="space-y-2">
            <Label>연식</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="연식을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {electricVehicles[selectedManufacturer].models[selectedModel].year.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 선택된 모델의 상세 정보 미리보기 */}
        {selectedModel && (
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-medium text-sm text-gray-700 mb-2">선택한 차량 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">배터리 용량:</span>
                <p className="font-medium">{electricVehicles[selectedManufacturer].models[selectedModel].batteryCapacity}</p>
              </div>
              <div>
                <span className="text-gray-500">주행 거리:</span>
                <p className="font-medium">{electricVehicles[selectedManufacturer].models[selectedModel].range}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleVehicleSelection}
            className="flex-1"
            disabled={!selectedManufacturer || !selectedModel || !selectedYear || !plateNumber.trim()}
          >
            차량 등록
          </Button>
          <Button 
            variant="outline" 
            onClick={resetVehicleSelector}
            className="flex-1"
          >
            취소
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          차량 정보 등록 완료
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">차량번호</span>
            <p className="font-medium text-lg text-blue-600">{ocrResult?.data.plateNumber}</p>
          </div>
          <div>
            <span className="text-gray-600">제조사</span>
            <p className="font-medium">{ocrResult?.data.manufacturer}</p>
          </div>
          <div>
            <span className="text-gray-600">모델</span>
            <p className="font-medium">{ocrResult?.data.model}</p>
          </div>
          <div>
            <span className="text-gray-600">연식</span>
            <p className="font-medium">{ocrResult?.data.year}년</p>
          </div>
          <div>
            <span className="text-gray-600">배터리 용량</span>
            <p className="font-medium">{ocrResult?.data.batteryCapacity}</p>
          </div>
          <div>
            <span className="text-gray-600">주행 거리</span>
            <p className="font-medium">{ocrResult?.data.range}</p>
          </div>
        </div>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            차량 정보가 프로필에 자동으로 저장되었습니다.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button className="flex-1">프로필에서 확인</Button>
          <Button variant="outline" className="flex-1" onClick={() => setOCRResult(null)}>
            다른 차량 등록
          </Button>
        </div>
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
            <p className="font-medium">
              {ocrResult?.data.chargeAmount 
                ? `${ocrResult.data.chargeAmount.toLocaleString()}원` 
                : '정보 없음'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">충전량</span>
            <p className="font-medium">{ocrResult?.data.energyCharged || '정보 없음'}</p>
          </div>
          <div>
            <span className="text-gray-600">충전 시간</span>
            <p className="font-medium">{ocrResult?.data.chargeDuration || '정보 없음'}</p>
          </div>
          <div>
            <span className="text-gray-600">요금</span>
            <p className="font-medium">{ocrResult?.data.chargingRate || '정보 없음'}</p>
          </div>
          <div>
            <span className="text-gray-600">결제 방법</span>
            <p className="font-medium">{ocrResult?.data.paymentMethod || '미확인'}</p>
          </div>
          <div>
            <span className="text-gray-600">충전기 타입</span>
            <p className="font-medium">{ocrResult?.data.chargerType || '미확인'}</p>
          </div>
          {ocrResult?.data.location && (
            <div className="col-span-2">
              <span className="text-gray-600">충전소</span>
              <p className="font-medium text-xs">{ocrResult.data.location}</p>
            </div>
          )}
          {(ocrResult?.data.chargeStartTime || ocrResult?.data.chargeEndTime) && (
            <div className="col-span-2">
              <span className="text-gray-600">충전 기간</span>
              <p className="font-medium text-xs">
                {ocrResult?.data.chargeStartTime || '미확인'} ~ {ocrResult?.data.chargeEndTime || '미확인'}
              </p>
            </div>
          )}
        </div>
        
        {/* OCR 원본 텍스트 (디버깅용 - 필요시 제거 가능) */}
        {ocrResult?.data.rawText && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <details>
              <summary className="cursor-pointer text-gray-600">OCR 원본 텍스트 보기</summary>
              <pre className="mt-2 whitespace-pre-wrap text-gray-700">{ocrResult.data.rawText}</pre>
            </details>
          </div>
        )}
        
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            영수증 정보가 가계부에 자동으로 저장되었습니다.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button className="flex-1">가계부에서 확인</Button>
          <Button variant="outline" className="flex-1" onClick={() => setOCRResult(null)}>
            다른 영수증 스캔
          </Button>
        </div>
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

          {isScanning && activeTab === 'equipment' && (
            <Card className="border-blue-200 bg-blue-50 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">충전기 정보 인식 중...</p>
                    <p className="text-sm text-blue-700">충전기 ID와 오류 정보를 분석하고 있습니다</p>
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
                차량 정보를 직접 입력하세요.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                onClick={handleVehicleInput}
                disabled={isScanning || showVehicleSelector}
                className="w-full flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-black border-transparent"
              >
                <Car className="w-4 h-4" />
                차량 정보 입력
              </Button>
            </CardContent>
          </Card>

          {showVehicleSelector && renderVehicleSelector()}

          {ocrResult && ocrResult.type === 'vehicle' && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  등록 완료: {(ocrResult.confidence * 100).toFixed(1)}%
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
                {isScanning ? '영수증 인식 중...' : '영수증 업로드'}
              </Button>
            </CardContent>
          </Card>

          {isScanning && activeTab === 'receipt' && (
            <Card className="border-blue-200 bg-blue-50 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">영수증 OCR 인식 중...</p>
                    <p className="text-sm text-blue-700">Tesseract.js로 영수증 정보를 추출하고 있습니다</p>
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

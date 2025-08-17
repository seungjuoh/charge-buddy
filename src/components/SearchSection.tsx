import { useState } from "react";
import { Search, MapPin, Filter, AlertCircle, Mic, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchParams } from "@/types/station";

interface SearchSectionProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
  error?: string | null;
}

export const SearchSection = ({ onSearch, loading, error }: SearchSectionProps) => {
  const [location, setLocation] = useState("");
  const [chargerType, setChargerType] = useState("");

  const handleSearch = () => {
    onSearch({
      location: location.trim() || undefined,
      chargerType: chargerType && chargerType !== "all" ? chargerType : undefined,
      useGPS: false
    });
  };

  const handleGPSSearch = () => {
    onSearch({
      useGPS: true,
      chargerType: chargerType && chargerType !== "all" ? chargerType : undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 테스트
  const mockStations = [
    // {
    //   id: 1,
    //   name: '롯데마트 서초점',
    //   address: '서울 서초구 서초동 123-45',
    //   distance: '0.3km',
    //   available: 2,
    //   total: 4,
    //   type: '급속',
    //   price: '292원/kWh',
    //   rating: 4.5,
    //   status: 'available'
    // }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [stations, setStations] = useState(mockStations);

  const handleVoiceSearch = () => {
    setIsListening(true);
    // 음성 인식 시뮬레이션
    setTimeout(() => {
      setIsListening(false);
      // AI가 의도를 파악하여 필터링한 결과 시뮬레이션
      setStations(mockStations.filter(station => station.status === 'available'));
    }, 2000);
  };

  // 테스트트

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-foreground">전기차 충전소 찾기</h1>
        <p className="text-muted-foreground text-m">
          빠르고 편리하게 충전소를 찾아보세요
        </p>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-lg p-6 shadow-lg border">
        <div className="space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 집근처에 지금당장 쓸 수 있는 급속 충전소"
              className="pr-20"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
            />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`p-2 ${isListening ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSearch} className="p-2">
              <Search className="w-4 h-4" />
            </Button>



          </div>
          </div>

        {isListening && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">음성을 듣고 있습니다...</span>
            </div>
          </div>
        )}

        {/* AI 분석 결과 */}
        {searchQuery && (
          <div className="bg-blue-50 border-blue-200">
            <div className="p-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">AI 분석 결과</p>
                  <p className="text-xs text-blue-700 mt-1">
                    요청사항: 근거리, 사용 가능한 급속 충전소 검색
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* 필터 및 GPS 검색 */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Select value={chargerType} onValueChange={setChargerType} disabled={loading}>
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
              disabled={loading}
              className="px-6"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {loading ? "위치 확인 중..." : "주변 찾기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
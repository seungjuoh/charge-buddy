import { useState } from "react";
import { Search, MapPin, Filter, AlertCircle } from "lucide-react";
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">전기차 충전소 찾기</h1>
        <p className="text-muted-foreground text-lg">
          빠르고 편리한 충전소를 찾아보세요
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
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="서울교대, 강남구, 서초구 등 지역명을 입력하세요"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !location.trim()}
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "검색 중..." : "검색"}
            </Button>
          </div>

          {/* 필터 및 GPS 검색 */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Select value={chargerType} onValueChange={setChargerType} disabled={loading}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="충전기 종류 선택" />
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
              {loading ? "위치 확인 중..." : "내 주변 찾기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
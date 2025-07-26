import { useState } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchParams } from "@/types/station";

interface SearchSectionProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export const SearchSection = ({ onSearch, loading }: SearchSectionProps) => {
  const [location, setLocation] = useState("");
  const [chargerType, setChargerType] = useState("");

  const handleSearch = () => {
    onSearch({
      location: location.trim() || undefined,
      chargerType: chargerType || undefined,
      useGPS: false
    });
  };

  const handleGPSSearch = () => {
    onSearch({
      useGPS: true,
      chargerType: chargerType || undefined
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

      <div className="bg-card rounded-lg p-6 shadow-lg border">
        <div className="space-y-4">
          {/* 검색창 */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="서울 강남구에 급속 충전소 있어?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>

          {/* 필터 및 GPS 검색 */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Select value={chargerType} onValueChange={setChargerType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="충전기 종류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="DC콤보">DC콤보 (급속)</SelectItem>
                  <SelectItem value="AC완속">AC완속</SelectItem>
                  <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                  <SelectItem value="Tesla">Tesla 슈퍼차저</SelectItem>
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
              내 주변 찾기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
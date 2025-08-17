import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Clock, DollarSign, Filter } from "lucide-react";
import { ChargingRateWidget } from "@/components/ChargingRateWidget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const PriceChart = () => {
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSpeed, setSelectedSpeed] = useState("all");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">충전 요금 시세</h2>
        <p className="text-muted-foreground">전기차 충전 요금 정보를 확인해보세요</p>
      </div>
      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>필터 옵션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[120px]">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="사업자명" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="kep">한전 KDN</SelectItem>
                  <SelectItem value="gs">GS칼텍스</SelectItem>
                  <SelectItem value="sk">SK엔카</SelectItem>
                  <SelectItem value="hyundai">현대오일뱅크</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 지역</SelectItem>
                  <SelectItem value="seoul">서울시</SelectItem>
                  <SelectItem value="busan">부산시</SelectItem>
                  <SelectItem value="incheon">인천시</SelectItem>
                  <SelectItem value="daegu">대구시</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <Select value={selectedSpeed} onValueChange={setSelectedSpeed}>
                <SelectTrigger className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="충전 속도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="fast">급속</SelectItem>
                  <SelectItem value="slow">완속</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 요금 비교 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 요금 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <ChargingRateWidget />
        </CardContent>
      </Card>

      {/* 요약 정보 카드들 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 충전 요금</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩350/kWh</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최적 충전 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23:00-06:00</div>
            <p className="text-xs text-muted-foreground">
              야간 할인 요금 적용
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DC 고속충전</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩450/kWh</div>
            <p className="text-xs text-muted-foreground">
              고속충전 프리미엄
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AC 완속충전</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩250/kWh</div>
            <p className="text-xs text-muted-foreground">
              경제적인 충전 옵션
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 요금 정보 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>요금 정보 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm">야간 할인: 23:00-06:00 (20% 할인)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">주말 할인: 토요일, 일요일 (10% 할인)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm">정부 보조: 전기차 소유자 추가 할인</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm">피크 시간: 14:00-18:00 (20% 추가 요금)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
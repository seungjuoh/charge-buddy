import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, Clock } from "lucide-react";

interface ChargingRate {
  provider: string;
  fastCharging: number;
  slowCharging: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

const MOCK_CHARGING_RATES: ChargingRate[] = [
  {
    provider: "한국전력공사",
    fastCharging: 173.8,
    slowCharging: 120.5,
    trend: "stable",
    lastUpdated: "2시간 전"
  },
  {
    provider: "SK에너지",
    fastCharging: 295.0,
    slowCharging: 240.0,
    trend: "up",
    lastUpdated: "1시간 전"
  },
  {
    provider: "GS칼텍스",
    fastCharging: 289.0,
    slowCharging: 235.0,
    trend: "down",
    lastUpdated: "30분 전"
  },
  {
    provider: "현대오일뱅크",
    fastCharging: 310.0,
    slowCharging: 250.0,
    trend: "up",
    lastUpdated: "1시간 전"
  }
];

export const ChargingRateWidget = () => {
  const [rates, setRates] = useState<ChargingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출 시뮬레이션
    const timer = setTimeout(() => {
      setRates(MOCK_CHARGING_RATES);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <span className="h-4 w-4 text-muted-foreground">—</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600";
      case "down":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            전기차 충전 요금 시세
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          전기차 충전 요금 시세
        </CardTitle>
        <p className="text-sm text-muted-foreground">실시간 충전 요금 비교 (원/kWh)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rates.map((rate, index) => (
            <div
              key={rate.provider}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{rate.provider}</span>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      최저가
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    급속: {rate.fastCharging}원
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    완속: {rate.slowCharging}원
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${getTrendColor(rate.trend)}`}>
                  {getTrendIcon(rate.trend)}
                  <span className="text-xs">{rate.lastUpdated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            * 요금은 사업자별로 상이할 수 있으며, 실시간으로 업데이트됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChargingRateWidget } from "@/components/ChargingRateWidget";

const Rates = () => {
  useEffect(() => {
    document.title = "충전요금 비교 | EV 충전소";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "전기차 충전 요금 시세를 비교하고 가장 합리적인 요금을 확인하세요.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">충전요금 비교</h1>
          <p className="text-muted-foreground">전기차 충전 시세를 한눈에 확인해보세요</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
          <ChargingRateWidget />
      </main>
    </div>
  );
};

export default Rates;

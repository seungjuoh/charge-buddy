import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Thermometer, Wind, Droplets, CloudLightning } from "lucide-react";

// Simple Weather page using OpenWeatherMap API
// Note: Replace YOUR_OPENWEATHERMAP_API_KEY with a real key when deploying

interface WeatherData {
  name: string;
  weather: { main: string; description: string }[];
  main: { temp: number; humidity: number };
  wind: { speed: number };
}

const OWM_BASE = "https://api.openweathermap.org/data/2.5/weather";

const getScoresFromStorage = (): number[] => {
  try {
    const raw = localStorage.getItem("lightning_pop_scores");
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

const saveScoreToStorage = (score: number) => {
  const current = getScoresFromStorage();
  const updated = [...current, score].sort((a, b) => b - a).slice(0, 50);
  localStorage.setItem("lightning_pop_scores", JSON.stringify(updated));
  const rank = updated.indexOf(score) + 1;
  return { updated, rank };
};

const Weather = () => {
  const [city, setCity] = useState("Seoul");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Easter Egg / Game states
  const [boltClicks, setBoltClicks] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [gameOverInfo, setGameOverInfo] = useState<{ score: number; rank: number } | null>(null);

  const intervalRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = "날씨 대시보드 | EV 충전소"; // SEO title
  }, []);

  const fetchByCity = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${OWM_BASE}?q=${encodeURIComponent(q)}&appid=YOUR_OPENWEATHERMAP_API_KEY&units=metric&lang=kr`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("날씨 정보를 가져오지 못했습니다.");
      const json: WeatherData = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "오류가 발생했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchByGPS = async () => {
    if (!navigator.geolocation) {
      setError("GPS가 지원되지 않습니다.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      const url = `${OWM_BASE}?lat=${latitude}&lon=${longitude}&appid=YOUR_OPENWEATHERMAP_API_KEY&units=metric&lang=kr`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("날씨 정보를 가져오지 못했습니다.");
      const json: WeatherData = await res.json();
      setData(json);
      setCity(json.name);
    } catch (e: any) {
      setError(e.message || "위치 정보를 가져오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchByCity(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conditionMain = data?.weather?.[0]?.main || "";
  const temp = data?.main?.temp ?? null;

  const advisory = useMemo(() => {
    if (!temp && conditionMain !== "") return null;
    if (["Rain", "Snow"].includes(conditionMain)) return "안전 운전하세요! 🚗";
    if (typeof temp === "number" && temp >= 32) return "폭염 조심하세요! 🔥";
    if (typeof temp === "number" && temp <= -5) return "한파 조심하세요! ❄️";
    return null;
  }, [conditionMain, temp]);

  // Thunderstorm Easter Egg
  const showBolts = conditionMain === "Thunderstorm";
  const boltCount = 8;

  const randomPositions = useMemo(
    () => Array.from({ length: boltCount }).map(() => ({
      top: Math.random() * 70 + 10, // 10% ~ 80%
      left: Math.random() * 80 + 10, // 10% ~ 90%
      scale: Math.random() * 0.6 + 0.8,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showBolts, gameActive]
  );

  const handleBoltClick = () => {
    const next = boltClicks + 1;
    setBoltClicks(next);
    if (next >= 5) {
      setBoltClicks(0);
      setConfirmOpen(true);
    }
  };

  const startGame = () => {
    setConfirmOpen(false);
    setGameActive(true);
    setScore(0);
    setTimeLeft(15);

    // countdown timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setGameActive(false);
          const { rank } = saveScoreToStorage(score);
          setGameOverInfo({ score, rank });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // spawn bolts rapidly
    intervalRef.current = window.setInterval(() => {
      // We simply force re-render by toggling state
      setBoltClicks((n) => n); // noop to refresh positions if needed
    }, 400);
  };

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setGameActive(false);
  };

  useEffect(() => () => stopGame(), []);

  const leaderboard = useMemo(() => getScoresFromStorage().slice(0, 10), [gameOverInfo]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">날씨</h1>
          <p className="text-muted-foreground">현재 기상 정보를 확인하세요</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>현재 날씨 {data?.name ? `- ${data.name}` : ""}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="도시명을 입력하세요 (예: Seoul)" />
                <Button onClick={() => fetchByCity(city)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "검색"}
                </Button>
                <Button variant="outline" onClick={fetchByGPS} disabled={loading}>
                  <MapPin className="h-4 w-4 mr-2" /> 내 주변
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!data && !error && (
                <p className="text-muted-foreground">도시를 검색하거나 GPS로 위치를 가져오세요.</p>
              )}

              {data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">기온</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <Thermometer className="h-6 w-6" />
                      <span className="text-2xl font-bold">{Math.round(data.main.temp)}°C</span>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">상태</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <CloudLightning className="h-6 w-6" />
                      <span className="text-lg font-medium">{data.weather[0].description}</span>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">습도</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <Droplets className="h-6 w-6" />
                      <span className="text-lg font-medium">{data.main.humidity}%</span>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">풍속</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <Wind className="h-6 w-6" />
                      <span className="text-lg font-medium">{data.wind.speed} m/s</span>
                    </CardContent>
                  </Card>
                </div>
              )}

              {advisory && (
                <Alert>
                  <AlertDescription>{advisory}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>명예의 전당</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-muted-foreground">아직 등록된 점수가 없습니다.</p>
              ) : (
                <ol className="list-decimal list-inside space-y-1">
                  {leaderboard.map((s, i) => (
                    <li key={i} className="flex justify-between"><span>{i + 1}위</span><span className="font-medium">{s}점</span></li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Thunderstorm Easter Egg */}
        {showBolts && (
          <section className="relative min-h-[200px] rounded-lg border bg-card p-4 overflow-hidden">
            <p className="text-sm text-muted-foreground mb-2">번개가 칩니다! ⚡ 이모지를 5번 연속 클릭하면 게임이 시작됩니다.</p>
            {randomPositions.map((pos, idx) => (
              <button
                key={idx}
                onClick={gameActive ? () => setScore((s) => s + 1) : handleBoltClick}
                className={`absolute select-none hover-scale ${gameActive ? "" : "pulse"}`}
                style={{ top: `${pos.top}%`, left: `${pos.left}%`, transform: `scale(${pos.scale})` }}
                aria-label="lightning-bolt"
              >
                ⚡
              </button>
            ))}

            {gameActive && (
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1 text-sm font-medium">
                남은 시간: {timeLeft}s · 점수: {score}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lightning Pop 게임을 시작할까요?</AlertDialogTitle>
            <AlertDialogDescription>15초 동안 번개를 최대한 많이 클릭해보세요!</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={startGame}>시작하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Game Over Dialog */}
      {gameOverInfo && (
        <AlertDialog open={!!gameOverInfo} onOpenChange={(open) => !open && setGameOverInfo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>게임 종료!</AlertDialogTitle>
              <AlertDialogDescription>
                최종 점수: <b>{gameOverInfo.score}</b>점<br />
                현재 순위: <b>{gameOverInfo.rank}</b>위
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setGameOverInfo(null)}>닫기</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Weather;

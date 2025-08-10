// src/pages/Weather.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Thermometer, Wind, Droplets, CloudLightning, Cloud, CloudRain, Snowflake, Sun } from "lucide-react";

// 중요: 실제 서비스 시에는 본인의 유효한 API 키로 교체해야 합니다.
const API_KEY = "007c18845252dd0bb2c2777507fd2941";

// ## 1. 한글-영문 도시 이름 변환을 위한 객체 추가 ##
// 여기에 원하는 도시를 계속 추가할 수 있습니다.
const KOREAN_CITY_MAP: { [key: string]: string } = {
  "서울": "Seoul",
  "부산": "Busan",
  "인천": "Incheon",
  "대구": "Daegu",
  "광주": "Gwangju",
  "대전": "Daejeon",
  "울산": "Ulsan",
  "수원": "Suwon",
  "성남": "Seongnam",
  "고양": "Goyang",
  "용인": "Yongin",
  "제주": "Jeju",
  "세종": "Sejong",
};


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
  const [city, setCity] = useState("서울"); // 기본값을 한글로 변경
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ... (Game states and other hooks remain the same) ...
  const [boltClicks, setBoltClicks] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [gameOverInfo, setGameOverInfo] = useState<{ score: number; rank: number } | null>(null);
  const [renderTicker, setRenderTicker] = useState(0);
  const [explodingBolt, setExplodingBolt] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = "날씨 대시보드 | EV 충전소";
  }, []);

  // ## 2. fetchByCity 함수에 한글 변환 로직 추가 ##
  const fetchByCity = async (q: string) => {
    // 입력값의 양쪽 공백을 제거합니다.
    const trimmedQuery = q.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);
    try {
      // 한글 도시명인지 확인하고, 맞다면 영문으로 변환합니다. 아니면 원래 입력값을 사용합니다.
      const cityToFetch = KOREAN_CITY_MAP[trimmedQuery] || trimmedQuery;
      
      const url = `${OWM_BASE}?q=${encodeURIComponent(cityToFetch)}&appid=${API_KEY}&units=metric&lang=kr`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) throw new Error("API 키가 유효하지 않습니다. 키를 확인해주세요.");
        if (res.status === 404) throw new Error(`'${trimmedQuery}' 도시를 찾을 수 없습니다.`);
        throw new Error("날씨 정보를 가져오지 못했습니다.");
      }
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
      const url = `${OWM_BASE}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) throw new Error("API 키가 유효하지 않습니다. 키를 확인해주세요.");
        throw new Error("날씨 정보를 가져오지 못했습니다.");
      }
      const json: WeatherData = await res.json();
      setData(json);
      setCity(json.name);
    } catch (e: any) {
      setError(e.message || "위치 정보를 가져오지 못했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchByCity(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ... (The rest of the component code is the same as the last version) ...
  const conditionMain = data?.weather?.[0]?.main || "";
  const temp = data?.main?.temp ?? null;

  const advisory = useMemo(() => {
    if (!temp && conditionMain !== "") return null;
    if (["Rain", "Snow"].includes(conditionMain)) return "안전 운전하세요! 🚗";
    if (typeof temp === "number" && temp >= 32) return "폭염 조심하세요! 🔥";
    if (typeof temp === "number" && temp <= -5) return "한파 조심하세요! ❄️";
    return null;
  }, [conditionMain, temp]);
  
  const WeatherIcon = useMemo(() => {
    switch (conditionMain) {
      case "Clear":
        return <Sun className="h-8 w-8 text-yellow-400" />;
      case "Clouds":
        return <Cloud className="h-8 w-8 text-slate-400" />;
      case "Rain":
      case "Drizzle":
        return <CloudRain className="h-8 w-8 text-blue-400" />;
      case "Snow":
        return <Snowflake className="h-8 w-8 text-sky-300" />;
      case "Thunderstorm":
        return <CloudLightning className="h-8 w-8 text-yellow-400" />;
      default:
        return <Wind className="h-8 w-8 text-gray-500" />;
    }
  }, [conditionMain]);

  const showBolts = ["Rain", "Drizzle"].includes(conditionMain);
  const boltCount = 8;

  const randomPositions = useMemo(
    () => Array.from({ length: boltCount }).map(() => ({
      top: Math.random() * 70 + 10,
      left: Math.random() * 80 + 10,
      scale: Math.random() * 0.6 + 0.8,
    })),
    [renderTicker]
  );
  
  useEffect(() => {
    let intervalId: number | null = null;
    if (showBolts && !gameOverInfo) {
      intervalId = window.setInterval(() => {
        setRenderTicker(t => t + 1);
      }, 800);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showBolts, gameOverInfo]);

  const handleBoltClick = () => {
    const next = boltClicks + 1;
    setBoltClicks(next);
    if (next >= 5) {
      setBoltClicks(0);
      setConfirmOpen(true);
    }
  };
  
  const handleGameBoltClick = (index: number) => {
    if (!gameActive) return;
    setScore(s => s + 1);
    setExplodingBolt(index);
    setTimeout(() => setExplodingBolt(null), 300);
  };

  const startGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setConfirmOpen(false);
    setGameActive(true);
    setScore(0);
    setTimeLeft(15);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameActive(false);
          const { rank } = saveScoreToStorage(score);
          setGameOverInfo({ score, rank });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const retryGame = () => {
    setGameOverInfo(null);
    setBoltClicks(0);
    startGame();
  };

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
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="도시명을 입력하세요 (예: 서울, Busan)" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchByCity(city);
                    }
                  }}
                />
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

              {loading && !error && (
                <div className="flex items-center justify-center p-6">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!loading && !data && !error && (
                <p className="text-muted-foreground">도시를 검색하거나 GPS로 위치를 가져오세요.</p>
              )}

              {data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card><CardHeader><CardTitle className="text-base">기온</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><Thermometer className="h-6 w-6" /><span className="text-2xl font-bold">{Math.round(data.main.temp)}°C</span></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">상태</CardTitle></CardHeader><CardContent className="flex items-center gap-3">{WeatherIcon}<span className="text-lg font-medium">{data.weather[0].description}</span></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">습도</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><Droplets className="h-6 w-6" /><span className="text-lg font-medium">{data.main.humidity}%</span></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">풍속</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><Wind className="h-6 w-6" /><span className="text-lg font-medium">{data.wind.speed} m/s</span></CardContent></Card>
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
            <CardHeader><CardTitle>명예의 전당</CardTitle></CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? <p className="text-muted-foreground">아직 등록된 점수가 없습니다.</p> : <ol className="list-decimal list-inside space-y-1">{leaderboard.map((s, i) => (<li key={i} className="flex justify-between"><span>{i + 1}위</span><span className="font-medium">{s}점</span></li>))}</ol>}
            </CardContent>
          </Card>
        </section>

        {showBolts && (
          <section className="relative min-h-[200px] rounded-lg border bg-card p-4 overflow-hidden">
            {!gameActive && !gameOverInfo && <p className="text-sm text-muted-foreground mb-2">비가 오면 번개가 칩니다! ⚡ 번개를 5번 연속 클릭하면 게임이 시작됩니다.</p>}
            {randomPositions.map((pos, idx) => (
              <button key={idx} onClick={gameActive ? () => handleGameBoltClick(idx) : handleBoltClick} className={`absolute select-none text-2xl transition-transform ${explodingBolt === idx ? 'explode' : 'hover:scale-125'}`} style={{ top: `${pos.top}%`, left: `${pos.left}%`, transform: `scale(${pos.scale})` }} aria-label="lightning-bolt" disabled={!!explodingBolt}>⚡</button>
            ))}
            {gameActive && (<div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1 text-sm font-medium">남은 시간: {timeLeft}s · 점수: {score}</div>)}
            {gameOverInfo && (
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center rounded-lg">
                <h2 className="text-4xl font-bold text-white">게임 종료!</h2>
                <p className="text-2xl text-white mt-4">최종 점수: {gameOverInfo.score}</p>
                <p className="text-sm text-slate-300 mt-1">당신의 순위: {gameOverInfo.rank}위</p>
                <Button onClick={retryGame} className="mt-6">다시하기</Button>
              </div>
            )}
          </section>
        )}
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Lightning Pop 게임을 시작할까요?</AlertDialogTitle><AlertDialogDescription>15초 동안 번개를 최대한 많이 클릭해보세요!</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction onClick={startGame}>시작하기</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Weather;
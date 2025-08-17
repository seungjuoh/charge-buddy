import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, MessageCircle, Camera, TrendingUp, Zap, Menu, Heart} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChargingStationSearch } from "@/components/ChargingStationSearch";
import { ChatBot } from "@/components/ChatBot";
import { OCRScanner } from "@/components/OCRScanner";
import { PriceChart } from "@/components/PriceChart";
import { ChargerChatbot } from "@/components/ChargerChatbot";
import { UserProfile } from "@/components/UserProfile";
import { Separator } from "@/components/ui/separator";

// ## 모든 페이지 컴포넌트를 여기에 import 합니다. ##
import Index from "@/pages/Index";
import Favorites from "@/components/Favorites";
import Weather from "@/pages/Weather";
import Rates from "@/pages/Rates";
import NotFound from "@/pages/NotFound";

// ## ErrorBoundary 컴포넌트를 import 합니다. ##
import ErrorBoundary from "@/components/ErrorBoundary";

const Lnb = () => {
  return (
    <div className="p-4 space-y-3 max-h-screen overflow-y-auto">
      <UserProfile />
      <Separator />
    </div>
  );
};

// QueryClient 인스턴스는 컴포넌트 외부에 한 번만 생성합니다.
const queryClient = new QueryClient();

// ## 두 개로 나뉘었던 App 컴포넌트를 하나로 합쳤습니다. ##
const App = () => {
  const [activeTab, setActiveTab] = useState("search");
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* ErrorBoundary로 전체 라우팅 영역을 감싸서 모든 페이지의 에러를 처리합니다. */}
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <div className="min-h-screen bg-background">
                    {/* Header */}
                    <header className="bg-background shadow-sm border-b px-4 py-3">
                      <div className="flex items-center justify-between max-w-md mx-auto">
                        <div className="flex items-center gap-2">
                          <Zap className="w-6 h-6 text-blue-600" />
                          <span className="font-semibold text-foreground">전기차 충전 AI 비서</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThemeToggle />
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Menu className="w-5 h-5" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 p-0">
                              <Lnb />
                            </SheetContent>
                           </Sheet>
                        </div>
                      </div>
                    </header>
                    
                    {/* Main Content */}
                    <main className="max-w-md mx-auto pb-20">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsContent value="search" className="mt-0 p-4">
                          <ChargingStationSearch />
                        </TabsContent>
                        
                        <TabsContent value="favorites" className="mt-0 p-4">
                          <Favorites />
                        </TabsContent>
                        
                        <TabsContent value="ocr" className="mt-0 p-4">
                          <OCRScanner />
                        </TabsContent>
                        
                        <TabsContent value="chart" className="mt-0 p-4">
                          <PriceChart />
                        </TabsContent>

                        {/* Bottom Navigation */}
                        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200">
                          <div className="max-w-md mx-auto">
                            <TabsList className="grid w-full grid-cols-4 bg-transparent h-16">
                              <TabsTrigger 
                                value="search" 
                                className="flex flex-col gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                              >
                                <MapPin className="w-5 h-5" />
                                <span className="text-xs">충전소 검색</span>
                              </TabsTrigger>
                              
                              <TabsTrigger 
                                value="favorites" 
                                className="flex flex-col gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                              >
                                <Heart className="h-6 w-6 text-500" />
                                <span className="text-xs">즐겨찾기</span>
                              </TabsTrigger>
                              
                              <TabsTrigger 
                                value="ocr" 
                                className="flex flex-col gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                              >
                                <Camera className="w-5 h-5" />
                                <span className="text-xs">OCR 스캔</span>
                              </TabsTrigger>
                              
                              <TabsTrigger 
                                value="chart" 
                                className="flex flex-col gap-1 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
                              >
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-xs">시세 정보</span>
                              </TabsTrigger>
                            </TabsList>
                          </div>
                        </nav>
                      </Tabs>
                    </main>
                  </div>
                } />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/rates" element={<Rates />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <div className="mb-21">
                <ChargerChatbot />
              </div>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
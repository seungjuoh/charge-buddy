import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ## 모든 페이지 컴포넌트를 여기에 import 합니다. ##
import Index from "@/pages/Index";
import Favorites from "@/pages/Favorites";
import Weather from "@/pages/Weather";
import NotFound from "@/pages/NotFound";

// ## ErrorBoundary 컴포넌트를 import 합니다. ##
import ErrorBoundary from "@/components/ErrorBoundary";

// QueryClient 인스턴스는 컴포넌트 외부에 한 번만 생성합니다.
const queryClient = new QueryClient();

// ## 두 개로 나뉘었던 App 컴포넌트를 하나로 합쳤습니다. ##
const App = () => {
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
                <Route path="/" element={<Index />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/weather" element={<Weather />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
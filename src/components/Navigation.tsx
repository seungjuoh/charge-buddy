import { Link, useLocation } from "react-router-dom";
import { Search, Heart, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EV</span>
            </div>
            <span className="font-bold text-lg">충전소 찾기</span>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm"
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                검색
              </Button>
            </Link>
            
            <Link to="/favorites">
              <Button 
                variant={isActive('/favorites') ? "default" : "ghost"} 
                size="sm"
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                즐겨찾기
              </Button>
            </Link>

            {/* 다크 모드 토글 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-2"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">테마 변경</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
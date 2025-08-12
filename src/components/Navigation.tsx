import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Navigation = () => {
  return (
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-start h-16">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="메뉴 열기">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/weather" aria-label="날씨 페이지로 이동">
                  <Badge className="cursor-pointer px-3 py-1">날씨</Badge>
                </Link>
                <Link to="/favorites" aria-label="즐겨찾기 페이지로 이동">
                  <Badge className="cursor-pointer px-3 py-1">즐겨찾기</Badge>
                </Link>
                <Link to="/rates" aria-label="충전요금 비교 페이지로 이동">
                  <Badge className="cursor-pointer px-3 py-1">충전요금 비교</Badge>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
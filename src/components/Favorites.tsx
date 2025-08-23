import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StationCard } from "@/components/StationCard";
import { useStations } from "@/hooks/useStations";
import { Link } from "react-router-dom";

const Favorites = () => {
  const { favorites, toggleFavorite } = useStations();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-3xl font-bold">즐겨찾기</h1>
          </div>
        </div>

        {/* 즐겨찾기 목록 */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <h2 className="text-xl font-semibold mb-2">즐겨찾기가 비어있습니다</h2>
              <p className="text-muted-foreground mb-4">
                자주 이용하는 충전소를 즐겨찾기에 추가해보세요.
              </p>
              <Link to="/">
                <Button className="bg-theme-button-light dark:bg-theme-button-dark hover:bg-theme-button-light-hover dark:hover:bg-theme-button-dark-hover text-white">
                  충전소 찾기
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              총 {favorites.length}개의 충전소가 즐겨찾기에 등록되어 있습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
import { useState } from "react";
import { MapPin, Clock, Car, Heart, Star, ExternalLink, MessageSquare, Navigation, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChargingStation } from "@/types/station";
import { ReviewModal } from "./ReviewModal";
import { useToast } from "@/hooks/use-toast";

interface StationCardProps {
  station: ChargingStation;
  onToggleFavorite: (station: ChargingStation) => void;
}

export const StationCard = ({ station, onToggleFavorite }: StationCardProps) => {
  const [showReviews, setShowReviews] = useState(false);
  const { toast } = useToast();

  const handleFavoriteClick = () => {
    onToggleFavorite(station);
    toast({
      title: station.isFavorite ? "즐겨찾기에서 제거됨" : "즐겨찾기에 추가됨",
      description: station.name,
      duration: 2000,
    });
  };

  const handleMapClick = () => {
    const googleMapsUrl = `https://maps.google.com/?q=${station.latitude},${station.longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  const getChargerTypeBadgeVariant = (type: string) => {
    if (type.includes("DC") || type.includes("급속")) return "default";
    if (type.includes("Tesla")) return "secondary";
    return "outline";
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("충전가능")) return "default";
    if (status.includes("충전중")) return "secondary";
    if (status.includes("고장") || status.includes("점검")) return "destructive";
    return "outline";
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">{station.name}</CardTitle>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{station.address}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="text-muted-foreground hover:text-red-500"
            >
              <Heart 
                className={`h-5 w-5 ${station.isFavorite ? "fill-red-500 text-red-500" : ""}`} 
              />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 거리 정보 */}
          {station.distance !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">거리:</span>
              <span className="font-medium">{station.distance.toFixed(1)}km</span>
            </div>
          )}

          {/* 상태 정보 */}
          {station.status && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium">
                <Activity className="h-4 w-4 mr-1" />
                <span>상태</span>
              </div>
              <Badge 
                variant={getStatusBadgeVariant(station.status)}
                className="text-xs"
              >
                {station.status}
              </Badge>
            </div>
          )}

          {/* 충전기 종류 */}
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium">
              <span>충전기 종류</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {station.chargerTypes.map((type) => (
                <Badge 
                  key={type} 
                  variant={getChargerTypeBadgeVariant(type)}
                  className="text-xs"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* 운영 시간 */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">운영시간:</span>
            <span className="font-medium">{station.operatingHours}</span>
          </div>

          {/* 주차 정보 */}
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">주차:</span>
            <span className="font-medium">
              {station.parkingAvailable 
                ? `가능 ${station.parkingSpaces ? `(${station.parkingSpaces}대)` : ""}`
                : "불가"
              }
            </span>
          </div>

          {/* 운영기관 */}
          {station.businessName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">운영기관:</span>
              <span className="font-medium">{station.businessName}</span>
            </div>
          )}

          {/* 후기 */}
          {station.reviews && station.reviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">후기:</span>
              <span className="font-medium">{station.reviews.length}개</span>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleMapClick}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              지도 보기
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowReviews(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              후기 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      <ReviewModal
        station={station}
        open={showReviews}
        onOpenChange={setShowReviews}
      />
    </>
  );
};
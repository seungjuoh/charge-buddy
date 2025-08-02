import { ChargingStation } from "@/types/station";
import { StationCard } from "./StationCard";
import { Loader2, MapPin } from "lucide-react";

interface StationListProps {
  stations: ChargingStation[];
  loading: boolean;
  onToggleFavorite: (station: ChargingStation) => void;
}

export const StationList = ({ stations, loading, onToggleFavorite }: StationListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">충전소를 검색하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <div>
          <h3 className="text-lg font-semibold mb-1">검색 결과가 없습니다</h3>
          <p className="text-muted-foreground">
            다른 지역이나 충전기 종류로 검색해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          검색 결과 ({stations.length}개)
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station, index) => (
          <StationCard
            key={`${station.id}-${station.latitude}-${station.longitude}-${index}`}
            station={station}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
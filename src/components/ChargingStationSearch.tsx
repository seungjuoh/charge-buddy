import { useState } from "react";
import { SearchSection } from "@/components/SearchSection";
import { StationList } from "@/components/StationList";
import { useStations } from "@/hooks/useStations";
import { SearchParams } from "@/types/station";

export const ChargingStationSearch = () => {
  const { stations, setStations, loading, error, searchStations, toggleFavorite } = useStations();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params: SearchParams) => {
    setHasSearched(true);
    const results = await searchStations(params);
    setStations(results);
  };

  return (
    <div className="space-y-6">
      <SearchSection onSearch={handleSearch} loading={loading} error={error} />
      
      {hasSearched && (
        <StationList 
          stations={stations} 
          loading={loading} 
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
};


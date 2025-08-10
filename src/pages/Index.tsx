import { useState } from "react";
import { SearchSection } from "@/components/SearchSection";
import { StationList } from "@/components/StationList";
import { Navigation } from "@/components/Navigation";
import { ChargerChatbot } from "@/components/ChargerChatbot";
import { ChargingRateWidget } from "@/components/ChargingRateWidget";
import { useStations } from "@/hooks/useStations";
import { SearchParams } from "@/types/station";

const Index = () => {
  const { stations, setStations, loading, error, searchStations, toggleFavorite } = useStations();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params: SearchParams) => {
    setHasSearched(true);
    const results = await searchStations(params);
    setStations(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <SearchSection onSearch={handleSearch} loading={loading} error={error} />
        
        {/* 충전 요금 비교 위젯 */}
        <div className="max-w-2xl">
          <ChargingRateWidget />
        </div>
        
        {hasSearched && (
          <StationList 
            stations={stations} 
            loading={loading} 
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>

      <ChargerChatbot />
    </div>
  );
};

export default Index;

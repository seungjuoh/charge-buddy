import { useState, useEffect } from "react";
import { ChargingStation, SearchParams } from "@/types/station";
import { mockStations } from "@/data/mockStations";

export const useStations = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [favorites, setFavorites] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock API simulation
  const searchStations = async (params: SearchParams): Promise<ChargingStation[]> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredStations = [...mockStations];
    
    // Simple filtering based on location (mock implementation)
    if (params.location) {
      const searchTerm = params.location.toLowerCase();
      filteredStations = filteredStations.filter(station => 
        station.address.toLowerCase().includes(searchTerm) ||
        station.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by charger type
    if (params.chargerType) {
      filteredStations = filteredStations.filter(station =>
        station.chargerTypes.some(type => 
          type.toLowerCase().includes(params.chargerType!.toLowerCase())
        )
      );
    }
    
    setLoading(false);
    return filteredStations;
  };

  const addToFavorites = (station: ChargingStation) => {
    const updatedStation = { ...station, isFavorite: true };
    setFavorites(prev => {
      if (prev.find(fav => fav.id === station.id)) {
        return prev;
      }
      return [...prev, updatedStation];
    });
    
    // Update stations list to reflect favorite status
    setStations(prev => 
      prev.map(s => s.id === station.id ? updatedStation : s)
    );
  };

  const removeFromFavorites = (stationId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== stationId));
    setStations(prev => 
      prev.map(s => s.id === stationId ? { ...s, isFavorite: false } : s)
    );
  };

  const toggleFavorite = (station: ChargingStation) => {
    if (station.isFavorite || favorites.find(fav => fav.id === station.id)) {
      removeFromFavorites(station.id);
    } else {
      addToFavorites(station);
    }
  };

  return {
    stations,
    setStations,
    favorites,
    loading,
    searchStations,
    toggleFavorite
  };
};
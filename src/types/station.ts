export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  chargerTypes: string[];
  operatingHours: string;
  parkingAvailable: boolean;
  parkingSpaces?: number;
  latitude: number;
  longitude: number;
  isFavorite?: boolean;
  reviews?: Review[];
  // API 데이터 추가 필드
  distance?: number;
  status?: string;
  businessName?: string;
}

export interface Review {
  id: string;
  stationId: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export interface SearchParams {
  location?: string;
  chargerType?: string;
  useGPS?: boolean;
}
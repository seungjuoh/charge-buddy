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
  // 요금 정보 추가
  operator?: string;
  memberPrice?: number;
  regularPrice?: number;
  fastChargingRate?: number;
  slowChargingRate?: number;
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
  isNaturalLanguageQuery?: boolean;  // 추가
  originalQuery?: string;           // 추가     
}

// 시세정보 관련 타입 추가
export interface ChargingRate {
  provider: string;
  fastCharging: number;
  slowCharging: number;
  memberFast: number;
  memberSlow: number;
  nonMemberFast: number;
  nonMemberSlow: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface PriceFilterState {
  speed: 'all' | 'fast' | 'slow';
  membership: 'member' | 'nonmember';
  sortBy: 'provider' | 'price_asc' | 'price_desc';
  provider: string;
  searchTerm: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// 다크 모드 관련 타입
export interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 충전속도 옵션
export const CHARGING_SPEED_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'fast', label: '급속' },
  { value: 'slow', label: '완속' }
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: 'price_asc', label: '낮은 가격 순' },
  { value: 'price_desc', label: '높은 가격 순' },
  { value: 'provider', label: '이름순' }
] as const;

// 페이지당 아이템 수 옵션
export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 10, label: '10개씩' },
  { value: 20, label: '20개씩' },
  { value: 50, label: '50개씩' }
] as const;
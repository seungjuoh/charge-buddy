import { ChargingStation, Review } from "@/types/station";

export const mockReviews: Review[] = [
  {
    id: "1",
    stationId: "1",
    rating: 5,
    comment: "충전 속도가 빠르고 주차가 편리해요!",
    authorName: "김전기",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    stationId: "1",
    rating: 4,
    comment: "깨끗하고 안전한 충전소입니다.",
    authorName: "이차충",
    createdAt: "2024-01-10"
  }
];

export const mockStations: ChargingStation[] = [
  {
    id: "1",
    name: "강남EV충전소",
    address: "서울특별시 강남구 테헤란로 123",
    chargerTypes: ["DC콤보", "AC완속"],
    operatingHours: "24시간",
    parkingAvailable: true,
    parkingSpaces: 4,
    latitude: 37.4979,
    longitude: 127.0276,
    reviews: mockReviews.filter(r => r.stationId === "1")
  },
  {
    id: "2",
    name: "서초 급속충전센터",
    address: "서울특별시 서초구 강남대로 456",
    chargerTypes: ["DC콤보", "CHAdeMO"],
    operatingHours: "06:00-22:00",
    parkingAvailable: true,
    parkingSpaces: 8,
    latitude: 37.4836,
    longitude: 127.0327
  },
  {
    id: "3", 
    name: "역삼역 EV스테이션",
    address: "서울특별시 강남구 역삼로 789",
    chargerTypes: ["DC콤보", "AC완속", "Tesla SC"],
    operatingHours: "24시간",
    parkingAvailable: true,
    parkingSpaces: 6,
    latitude: 37.5007,
    longitude: 127.0364
  },
  {
    id: "4",
    name: "선릉 친환경충전소",
    address: "서울특별시 강남구 선릉로 321",
    chargerTypes: ["DC콤보"],
    operatingHours: "05:00-23:00",
    parkingAvailable: false,
    latitude: 37.5045,
    longitude: 127.0493
  },
  {
    id: "5",
    name: "코엑스 전기차충전소",
    address: "서울특별시 강남구 영동대로 513",
    chargerTypes: ["DC콤보", "AC완속"],
    operatingHours: "24시간",
    parkingAvailable: true,
    parkingSpaces: 12,
    latitude: 37.5115,
    longitude: 127.0595
  }
];
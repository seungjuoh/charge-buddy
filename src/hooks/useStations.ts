import { useState, useEffect } from "react";
import { ChargingStation, SearchParams } from "@/types/station";

// API 키 설정
const KAKAO_REST_API_KEY = "f2aab493310b284ccda1ce4cc86ed634";
const KEPCO_API_KEY = "yF6MPqmGet7SZolLlt1rTZ30u%2F%2FIqC4ZWxdZWCtMuX4z8lkww5Nz6%2FXZ%2FBXjEQm0hcJaEt0fZh6U5G3ejGqAxw%3D%3D";

// API 엔드포인트
const KAKAO_ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json";
const KAKAO_KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const KEMCO_INFO_API_URL = "http://apis.data.go.kr/B552584/EvCharger/getChargerInfo?serviceKey=yF6MPqmGet7SZolLlt1rTZ30u%2F%2FIqC4ZWxdZWCtMuX4z8lkww5Nz6%2FXZ%2FBXjEQm0hcJaEt0fZh6U5G3ejGqAxw%3D%3D&numOfRows=10&pageNo=1&dataType=XML";

// 거리 계산 함수
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371.0; // 지구 반지름 (킬로미터)
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  const dlon = lon2Rad - lon1Rad;
  const dlat = lat2Rad - lat1Rad;

  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 좌표 및 장소명 가져오기
const getCoordinatesAndName = async (query: string) => {
  const headers = { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` };

  console.log(`[카카오 API] 검색 쿼리: ${query}`);

  try {
    // 주소 검색 시도
    console.log(`[카카오 API] 주소 검색 시도...`);
    const addressResponse = await fetch(`${KAKAO_ADDRESS_SEARCH_URL}?query=${encodeURIComponent(query)}`, {
      headers
    });
    const addressData = await addressResponse.json();
    
    console.log(`[카카오 API] 주소 검색 결과:`, addressData);
    
    if (addressData.documents && addressData.documents.length > 0) {
      const firstResult = addressData.documents[0];
      const addressInfo = firstResult.address || firstResult.road_address;
      if (addressInfo) {
        const result = {
          latitude: parseFloat(addressInfo.y),
          longitude: parseFloat(addressInfo.x),
          name: addressInfo.address_name
        };
        console.log(`[카카오 API] 주소 검색 성공:`, result);
        return result;
      }
    }

    // 키워드 검색 시도
    console.log(`[카카오 API] 키워드 검색 시도...`);
    const keywordResponse = await fetch(`${KAKAO_KEYWORD_SEARCH_URL}?query=${encodeURIComponent(query)}`, {
      headers
    });
    const keywordData = await keywordResponse.json();
    
    console.log(`[카카오 API] 키워드 검색 결과:`, keywordData);
    
    if (keywordData.documents && keywordData.documents.length > 0) {
      const firstResult = keywordData.documents[0];
      const result = {
        latitude: parseFloat(firstResult.y),
        longitude: parseFloat(firstResult.x),
        name: firstResult.place_name
      };
      console.log(`[카카오 API] 키워드 검색 성공:`, result);
      return result;
    }

    console.log(`[카카오 API] 검색 결과 없음`);
    return null;
  } catch (error) {
    console.error("카카오 API 오류:", error);
    return null;
  }
};

// 좌표에서 행정구역 코드 가져오기
const getAdminCodesFromCoords = async (latitude: number, longitude: number) => {
  const headers = { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` };
  const params = new URLSearchParams({
    x: longitude.toString(),
    y: latitude.toString()
  });

  console.log(`[카카오 API] 좌표 (${latitude}, ${longitude})의 행정구역 코드 조회 중...`);

  try {
    const response = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?${params.toString()}`, {
      headers
    });
    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      // 법정동 코드 찾기
      let regionInfo = null;
      for (const doc of data.documents) {
        if (doc.region_type === "B") { // 법정동
          regionInfo = doc;
          break;
        }
      }

      if (!regionInfo) {
        regionInfo = data.documents[0];
      }

      const kakaoLegalDongCode = regionInfo.code;

      if (kakaoLegalDongCode && kakaoLegalDongCode.length >= 5) {
        const zcode = kakaoLegalDongCode.substring(0, 2);   // 시도 코드
        const zscode = kakaoLegalDongCode.substring(0, 5);  // 시군구 코드
        console.log(`[카카오 API] 행정구역 코드: zcode=${zcode}, zscode=${zscode}`);
        return { zcode, zscode };
      } else {
        console.log(`[카카오 API] 유효한 법정동 코드를 얻을 수 없습니다.`);
        return null;
      }
    } else {
      console.log(`[카카오 API] 행정구역 정보를 찾을 수 없습니다.`);
      return null;
    }
  } catch (error) {
    console.error("카카오 좌표-행정구역 API 오류:", error);
    return null;
  }
};

// 한국환경공단 API에서 충전소 정보 가져오기
const getChargersFromKemco = async (zcode: string, zscode: string, pageNo: number = 1, numOfRows: number = 9999) => {
  const params = new URLSearchParams({
    serviceKey: KEPCO_API_KEY,
    pageNo: pageNo.toString(),
    numOfRows: numOfRows.toString(),
    zcode: zcode,
    zscode: zscode,
    dataType: "XML"
  });

  console.log(`[한국환경공단 API] 시도 '${zcode}', 시군구 '${zscode}'의 충전소 정보 조회 중...`);
  console.log(`[한국환경공단 API] 요청 URL: ${KEMCO_INFO_API_URL}?${params.toString()}`);

  try {
    const response = await fetch(`${KEMCO_INFO_API_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`[한국환경공단 API] HTTP 오류: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const xmlText = await response.text();
    console.log(`[한국환경공단 API] XML 응답:`, xmlText);

    // XML 파싱 (간단한 파싱)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const resultCode = xmlDoc.querySelector("resultCode")?.textContent || "N/A";
    const resultMsg = xmlDoc.querySelector("resultMsg")?.textContent || "알 수 없는 오류";

    if (resultCode === "00") {
      const items = xmlDoc.querySelectorAll("item");
      if (items.length === 0) {
        console.log(`[한국환경공단 API] 해당 지역에 충전소가 없습니다.`);
        return [];
      }

      const mappedData = Array.from(items).map((item: any) => ({
        statId: item.querySelector("statId")?.textContent || "N/A",
        statNm: item.querySelector("statNm")?.textContent || "이름 없음",
        addr: item.querySelector("addr")?.textContent || "주소 없음",
        addrDetail: item.querySelector("addrDetail")?.textContent || "",
        location: item.querySelector("location")?.textContent || "",
        lat: item.querySelector("lat")?.textContent || "N/A",
        lng: item.querySelector("lng")?.textContent || "N/A",
        useTime: item.querySelector("useTime")?.textContent || "정보 없음",
        busiNm: item.querySelector("busiNm")?.textContent || "운영기관 없음",
        output: item.querySelector("output")?.textContent || "N/A",
        chgerType: item.querySelector("chgerType")?.textContent || "N/A",
        stat: item.querySelector("stat")?.textContent || "N/A"
      }));
      
      console.log(`[한국환경공단 API] 충전소 ${mappedData.length}개 조회 성공`);
      return mappedData;
    } else {
      console.error(`[한국환경공단 API] 응답 오류: 코드 ${resultCode}, 메시지: ${resultMsg}`);
      return [];
    }
  } catch (error) {
    console.error("한국환경공단 API 오류:", error);
    return [];
  }
};

// 충전기 타입 매핑 (한국환경공단 API)
const chgerTypeMap: { [key: string]: string } = {
  "01": "DC차데모", "02": "AC완속", "03": "DC차데모+AC3상", "04": "DC콤보",
  "05": "DC차데모+DC콤보", "06": "DC차데모+AC3상+DC콤보", "07": "AC3상",
  "08": "DC콤보(완속)", "09": "교류", "10": "수소", "99": "기타"
};

// 충전기 상태 매핑 (한국환경공단 API)
const statMap: { [key: string]: string } = {
  "1": "충전가능", "2": "충전중", "3": "고장", "4": "통신이상",
  "5": "점검중", "9": "충전예약"
};

export const useStations = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [favorites, setFavorites] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 실제 API를 사용한 검색
  const searchStations = async (params: SearchParams): Promise<ChargingStation[]> => {
    setLoading(true);
    setError(null);
    
    console.log(`[검색 시작] 파라미터:`, params);
    
    try {
      let userLocation = null;
      
      // 위치 기반 검색인 경우
      if (params.location) {
        console.log(`[검색] 위치 기반 검색: ${params.location}`);
        userLocation = await getCoordinatesAndName(params.location);
        if (!userLocation) {
          console.log(`[검색] 좌표 변환 실패`);
          setError("입력하신 위치를 찾을 수 없습니다. 다른 키워드로 검색해보세요.");
          setLoading(false);
          return [];
        }
        console.log(`[검색] 좌표 변환 성공:`, userLocation);
      }

      // GPS 기반 검색인 경우
      if (params.useGPS) {
        console.log(`[검색] GPS 기반 검색`);
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: true
              });
            });
            
            userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: "현재 위치"
            };
            console.log(`[검색] GPS 위치:`, userLocation);
          } catch (gpsError) {
            console.error("GPS 오류:", gpsError);
            setError("현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
            setLoading(false);
            return [];
          }
        } else {
          setError("GPS가 지원되지 않는 브라우저입니다.");
          setLoading(false);
          return [];
        }
      }

      if (!userLocation) {
        console.log(`[검색] 사용자 위치 정보 없음`);
        setError("위치 정보를 가져올 수 없습니다.");
        setLoading(false);
        return [];
      }

      // 충전소 데이터 가져오기
      const searchKeywords = [params.location || "서울"];
      if (params.location) {
        // 원본 검색어 추가
        searchKeywords.push(params.location);
        
        // 지역명 추출
        const parts = params.location.split(" ");
        for (const part of parts) {
          if (part.includes("시") || part.includes("구") || part.includes("도") || 
              part.includes("동") || part.includes("읍") || part.includes("면")) {
            searchKeywords.push(part);
          }
        }
        
        // 특정 키워드에 대한 추가 검색어
        if (params.location.includes("서울교대")) {
          searchKeywords.push("서울");
          searchKeywords.push("강남구");
          searchKeywords.push("서초구");
        } else if (params.location.includes("강남")) {
          searchKeywords.push("서울");
          searchKeywords.push("강남구");
        } else if (params.location.includes("서초")) {
          searchKeywords.push("서울");
          searchKeywords.push("서초구");
        }
      }
      
      // 중복 제거
      const uniqueKeywords = [...new Set(searchKeywords)];
      console.log(`[검색] 검색 키워드:`, uniqueKeywords);

      // 행정구역 코드 가져오기
      const adminCodes = await getAdminCodesFromCoords(userLocation.latitude, userLocation.longitude);
      if (!adminCodes) {
        console.log(`[검색] 행정구역 코드를 가져올 수 없습니다.`);
        setError("행정구역 정보를 가져올 수 없습니다.");
        setLoading(false);
        return [];
      }

      // 한국환경공단 API로 충전소 정보 가져오기
      console.log(`[검색] 행정구역 코드로 충전소 검색: ${adminCodes.zcode}, ${adminCodes.zscode}`);
      const chargersData = await getChargersFromKemco(adminCodes.zcode, adminCodes.zscode);

      if (!chargersData || chargersData.length === 0) {
        console.log(`[검색] 충전소 데이터 없음`);
        setError("해당 지역에서 충전소를 찾을 수 없습니다. 다른 지역으로 검색해보세요.");
        setLoading(false);
        return [];
      }

      console.log(`[검색] 거리 계산 및 필터링 시작`);
      
      // 거리 계산 및 필터링
      const stationsWithDistance = chargersData
        .filter((charger: any) => charger.lat !== "N/A" && charger.lng !== "N/A")
        .map((charger: any) => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(charger.lat),
            parseFloat(charger.lng)
          );

          // 충전기 타입 필터링
          const chargerType = chgerTypeMap[charger.chgerType] || "N/A";
          const shouldInclude = !params.chargerType || 
            chargerType.toLowerCase().includes(params.chargerType.toLowerCase());

          return {
            id: charger.statId,
            name: charger.statNm,
            address: charger.addr,
            chargerTypes: [chargerType],
            operatingHours: charger.useTime || "정보 없음",
            parkingAvailable: true, // 기본값
            parkingSpaces: undefined,
            latitude: parseFloat(charger.lat),
            longitude: parseFloat(charger.lng),
            distance: distance,
            status: statMap[charger.stat] || "상태확인불가",
            businessName: charger.busiNm,
            shouldInclude
          };
        })
        .filter((station: any) => station.shouldInclude)
        .sort((a: any, b: any) => a.distance - b.distance);

      console.log(`[검색] 거리 계산 완료: ${stationsWithDistance.length}개`);

      // 10km 이내만 필터링
      const filteredStations = stationsWithDistance
        .filter((station: any) => station.distance <= 10)
        .map((station: any) => ({
          ...station,
          reviews: [] // 실제 API에서는 후기 데이터가 없으므로 빈 배열
        }));

      console.log(`[검색] 10km 이내 필터링 완료: ${filteredStations.length}개`);
      console.log(`[검색] 최종 결과:`, filteredStations);

      if (filteredStations.length === 0) {
        setError("10km 이내에 충전소가 없습니다. 검색 범위를 넓혀보세요.");
      }

      setLoading(false);
      return filteredStations;
    } catch (error) {
      console.error("검색 오류:", error);
      setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      return [];
    }
  };

  const addToFavorites = (station: ChargingStation) => {
    const updatedStation = { ...station, isFavorite: true };
    setFavorites(prev => {
      if (prev.find(fav => fav.id === station.id)) {
        return prev;
      }
      return [...prev, updatedStation];
    });
    
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
    error,
    searchStations,
    toggleFavorite
  };
};
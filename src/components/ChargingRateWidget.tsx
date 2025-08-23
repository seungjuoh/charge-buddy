import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, Clock, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Papa from 'papaparse';

interface ChargingRate {
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

export const ChargingRateWidget = () => {
  const [rates, setRates] = useState<ChargingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberPrice, setShowMemberPrice] = useState(true);
  const [sortBy, setSortBy] = useState<"provider" | "price_asc" | "price_desc">("price_asc");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedSpeed, setSelectedSpeed] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        // CSV 파일 읽기
        const response = await fetch('전기차 충전 요금.csv');
        const csvContent = await response.text();
        
        // Papa.parse로 CSV 파싱
        Papa.parse(csvContent, {
          complete: (result) => {
            const data = result.data;
            
            // 헤더 찾기 (순번이 있는 행)
            let headerIndex = -1;
            for (let i = 0; i < Math.min(10, data.length); i++) {
              if (data[i][0] === '순번') {
                headerIndex = i;
                break;
              }
            }
            
            if (headerIndex === -1) {
              console.error('헤더를 찾을 수 없습니다');
              setIsLoading(false);
              return;
            }
            
            // 데이터 처리
            const processedRates: ChargingRate[] = [];
            const providerMap = new Map<string, {
              fastMember: number[];
              slowMember: number[];
              fastNonMember: number[];
              slowNonMember: number[];
              lastUpdated: string;
            }>();
            
            // 데이터 행 처리 (헤더 다음 행부터)
            for (let i = headerIndex + 1; i < data.length; i++) {
              const row = data[i];
              if (!row[1] || row[1].toString().trim() === '') continue;
              
              const provider = row[1].toString().trim();
              const type = row[2] ? row[2].toString().trim() : '';
              const memberPrice = parseFloat(row[3]) || 0;
              const nonMemberPrice = parseFloat(row[4]) || 0;
              const lastUpdated = row[5] || '';
              
              if (!providerMap.has(provider)) {
                providerMap.set(provider, {
                  fastMember: [],
                  slowMember: [],
                  fastNonMember: [],
                  slowNonMember: [],
                  lastUpdated: lastUpdated
                });
              }
              
              const providerData = providerMap.get(provider)!;
              
              if (type.includes('급속') || type.includes('100kW')) {
                providerData.fastMember.push(memberPrice);
                providerData.fastNonMember.push(nonMemberPrice);
              } else if (type.includes('완속')) {
                providerData.slowMember.push(memberPrice);
                providerData.slowNonMember.push(nonMemberPrice);
              }
              
              // 최신 날짜 업데이트
              if (lastUpdated && lastUpdated > providerData.lastUpdated) {
                providerData.lastUpdated = lastUpdated;
              }
            }
            
            // 날짜를 상대적인 시간으로 변환하는 함수
            const getRelativeTime = (dateStr: string) => {
              if (!dateStr) return '정보 없음';
              
              const date = new Date(dateStr);
              const now = new Date('2025-08-12');
              const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays === 0) return '오늘';
              if (diffDays === 1) return '1일 전';
              if (diffDays < 7) return `${diffDays}일 전`;
              if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
              if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
              return '1년 이상 전';
            };

            // 평균 계산 및 ChargingRate 객체 생성
            const tempRates: ChargingRate[] = [];
            providerMap.forEach((data, provider) => {
              const avgFastMember = data.fastMember.length > 0 
                ? data.fastMember.reduce((a, b) => a + b, 0) / data.fastMember.length 
                : 0;
              const avgSlowMember = data.slowMember.length > 0 
                ? data.slowMember.reduce((a, b) => a + b, 0) / data.slowMember.length 
                : 0;
              const avgFastNonMember = data.fastNonMember.length > 0 
                ? data.fastNonMember.reduce((a, b) => a + b, 0) / data.fastNonMember.length 
                : 0;
              const avgSlowNonMember = data.slowNonMember.length > 0 
                ? data.slowNonMember.reduce((a, b) => a + b, 0) / data.slowNonMember.length 
                : 0;
              
              tempRates.push({
                provider,
                fastCharging: showMemberPrice ? avgFastMember : avgFastNonMember,
                slowCharging: showMemberPrice ? avgSlowMember : avgSlowNonMember,
                memberFast: avgFastMember,
                memberSlow: avgSlowMember,
                nonMemberFast: avgFastNonMember,
                nonMemberSlow: avgSlowNonMember,
                trend: "stable", // 임시값, 아래에서 계산
                lastUpdated: getRelativeTime(data.lastUpdated)
              });
            });

            // 전체 평균 계산 (회원가/비회원가별)
            const validMemberFastRates = tempRates.filter(r => r.memberFast > 0).map(r => r.memberFast);
            const validMemberSlowRates = tempRates.filter(r => r.memberSlow > 0).map(r => r.memberSlow);
            const validNonMemberFastRates = tempRates.filter(r => r.nonMemberFast > 0).map(r => r.nonMemberFast);
            const validNonMemberSlowRates = tempRates.filter(r => r.nonMemberSlow > 0).map(r => r.nonMemberSlow);
            
            const avgMemberFast = validMemberFastRates.length > 0 
              ? validMemberFastRates.reduce((a, b) => a + b, 0) / validMemberFastRates.length 
              : 0;
            const avgMemberSlow = validMemberSlowRates.length > 0 
              ? validMemberSlowRates.reduce((a, b) => a + b, 0) / validMemberSlowRates.length 
              : 0;
            const avgNonMemberFast = validNonMemberFastRates.length > 0 
              ? validNonMemberFastRates.reduce((a, b) => a + b, 0) / validNonMemberFastRates.length 
              : 0;
            const avgNonMemberSlow = validNonMemberSlowRates.length > 0 
              ? validNonMemberSlowRates.reduce((a, b) => a + b, 0) / validNonMemberSlowRates.length 
              : 0;

            // 트렌드 계산하여 최종 배열에 추가 (가격 정보가 있는 충전소만)
            tempRates.forEach(rate => {
              // 현재 선택된 가격 타입에 따라 유효한 가격이 있는지 확인
              const hasMemberPrice = rate.memberFast > 0 || rate.memberSlow > 0;
              const hasNonMemberPrice = rate.nonMemberFast > 0 || rate.nonMemberSlow > 0;
              
              // 선택된 가격 타입에 대해 유효한 가격이 있는 경우만 처리
              if ((showMemberPrice && hasMemberPrice) || (!showMemberPrice && hasNonMemberPrice)) {
                let trend: "up" | "down" | "stable" = "stable";
                
                if (showMemberPrice) {
                  // 회원가 기준 트렌드 계산
                  const currentRate = rate.memberFast > 0 ? rate.memberFast : rate.memberSlow;
                  const avgRate = rate.memberFast > 0 ? avgMemberFast : avgMemberSlow;
                  
                  if (currentRate > 0 && avgRate > 0) {
                    if (currentRate > avgRate) {
                      trend = "up";
                    } else if (currentRate < avgRate) {
                      trend = "down";
                    }
                  }
                } else {
                  // 비회원가 기준 트렌드 계산
                  const currentRate = rate.nonMemberFast > 0 ? rate.nonMemberFast : rate.nonMemberSlow;
                  const avgRate = rate.nonMemberFast > 0 ? avgNonMemberFast : avgNonMemberSlow;
                  
                  if (currentRate > 0 && avgRate > 0) {
                    if (currentRate > avgRate) {
                      trend = "up";
                    } else if (currentRate < avgRate) {
                      trend = "down";
                    }
                  }
                }
                
                processedRates.push({
                  ...rate,
                  trend
                });
              }
            });
            
            // 정렬
            processedRates.sort((a, b) => {
              switch (sortBy) {
                case 'price_asc':
                  return a.fastCharging - b.fastCharging;
                
                case 'price_desc':
                  return b.fastCharging - a.fastCharging;
                  
                case 'provider':
                  return a.provider.localeCompare(b.provider);
                default:
                  return 0; // 정렬하지 않음
              }
            });
            
            setRates(processedRates);
            setIsLoading(false);
          },
          skipEmptyLines: true,
          dynamicTyping: false
        });
      } catch (error) {
        console.error('CSV 파일 읽기 오류:', error);
        setIsLoading(false);
      }
    };
    
    loadCSVData();
  }, [showMemberPrice, sortBy]);

  // 검색이나 필터 변경시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showMemberPrice, sortBy, selectedProvider, selectedSpeed, itemsPerPage]);

  const getTrendIcon = (trend: string) => {
    const baseClasses = "h-4 w-4";
    switch (trend) {
      case "up":
        return <TrendingUp className={`${baseClasses} text-red-500 dark:text-red-500`} />;
      case "down":
        return <TrendingDown className={`${baseClasses} text-blue-500 dark:text-green-500`} />;
      default:
        return <span className={`${baseClasses} text-blue-500 dark:text-green-500`}>—</span>;
  }
};

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return isDarkMode ? "text-red-400" : "text-red-600";
      case "down":
        return isDarkMode ? "text-green-400" : "text-blue-600";
      default:
        return isDarkMode ? "text-gray-400" : "text-muted-foreground";
    }
  };

  // 필터링 로직
  const filteredRates = rates.filter(rate => {
    // 검색어 필터
    if (!rate.provider.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // 사업자명 필터
    if (selectedProvider !== "all" && rate.provider !== selectedProvider) {
      return false;
    }
    
    // 충전속도 필터
    if (selectedSpeed !== "all") {
      if (selectedSpeed === "fast" && rate.fastCharging <= 0) {
        return false;
      }
      if (selectedSpeed === "slow" && rate.slowCharging <= 0) {
        return false;
      }
    }
    
    return true;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayRates = filteredRates.slice(startIndex, endIndex);

  // 사업자 목록 생성 (동적)
  const availableProviders = Array.from(new Set(rates.map(r => r.provider))).sort();

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-400' : 'text-blue-500'}`}>
            <Zap className="h-5 w-5" />
            실시간 충전 요금 비교
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`h-16 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-muted'}`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-xl md:text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-500'}`}>
          <Zap className="h-6 w-6 md:h-7 md:w-7" />
          실시간 충전 요금 비교
        </CardTitle>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>(원/kWh)</p>
        
        {/* 통합된 필터 섹션 - 반응형 */}
        <div className="mt-6 space-y-4">
          {/* 검색창 */}
          <div className="relative">
            <Search className={`absolute left-3 top-2.5 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`} />
            <input
              type="text"
              placeholder="사업자명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 text-sm rounded-md transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600 focus:border-green-400' 
                  : 'bg-background border-border focus:border-primary'
              }`}
            />
          </div>
          
          {/* 필터 옵션들 - 반응형 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 충전속도 */}
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                충전속도
              </label>
              <select
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
                className={`w-full px-2 py-2 text-xs md:text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-background border-border hover:bg-accent/50'
                }`}
              >
                <option value="all">전체</option>
                <option value="fast">급속</option>
                <option value="slow">완속</option>
              </select>
            </div>

            {/* 회원가 */}
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                회원가
              </label>
              <select
                value={showMemberPrice ? "member" : "nonmember"}
                onChange={(e) => setShowMemberPrice(e.target.value === "member")}
                className={`w-full px-2 py-2 text-xs md:text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-background border-border hover:bg-accent/50'
                }`}
              >
                <option value="member">회원가</option>
                <option value="nonmember">비회원가</option>
              </select>
            </div>

            {/* 사업자명 (새로 추가) */}
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                사업자명
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className={`w-full px-2 py-2 text-xs md:text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-background border-border hover:bg-accent/50'
                }`}
              >
                <option value="all">전체</option>
                {availableProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            {/* 가격 순 */}
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                가격 순
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "provider" | "price_asc" | "price_desc")}
                className={`w-full px-2 py-2 text-xs md:text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-background border-border hover:bg-accent/50'
                }`}
              >
                <option value="price_asc">낮은 가격 순</option>
                <option value="price_desc">높은 가격 순</option>
                <option value="provider">이름순</option>
              </select>
            </div>
          </div>

          {/* 결과 정보 및 표시 개수 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
              <Filter className="h-3 w-3" />
              <span>총 {filteredRates.length}개 사업자</span>
              {filteredRates.length > 0 && (
                <span>• {startIndex + 1}-{Math.min(endIndex, filteredRates.length)} 표시</span>
              )}
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`w-fit px-2 py-1 text-xs rounded-md transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-background border-border hover:bg-accent/50'
              }`}
            >
              <option value={10}>10개씩</option>
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {displayRates.map((rate, index) => (
            <div
              key={`${rate.provider}-${index}`}
              className={`flex items-center justify-between p-3 md:p-4 rounded-lg border transition-all hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                  : 'bg-card hover:bg-accent/50 border-border'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                    {rate.provider}
                  </span>
                  {startIndex + index === 0 && sortBy === "price_asc" && (
                    <Badge variant="secondary" className={`text-xs ${isDarkMode ? 'bg-green-600 text-white' : 'bg-blue-500 text-white'}`}>
                      최저가
                    </Badge>
                  )}
                  {startIndex + index === 0 && sortBy === "price_desc" && (
                    <Badge variant="secondary" className={`text-xs ${isDarkMode ? 'bg-red-600 text-white' : ''}`}>
                      최고가
                    </Badge>
                  )}
                </div>
                <div className={`flex flex-wrap items-center gap-3 text-xs md:text-sm ${isDarkMode ? 'text-gray-200' : 'text-muted-foreground'}`}>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    급속: {rate.fastCharging > 0 ? `${rate.fastCharging.toFixed(1)}원` : '정보없음'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    완속: {rate.slowCharging > 0 ? `${rate.slowCharging.toFixed(1)}원` : '정보없음'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${getTrendColor(rate.trend)}`}>
                  {getTrendIcon(rate.trend)}
                  <span className="text-xs whitespace-nowrap">{rate.lastUpdated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayRates.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
            <p>검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 페이징 UI */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white disabled:bg-gray-800' 
                  : 'bg-background hover:bg-accent border-border'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
            
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  currentPage === pageNum
                    ? isDarkMode 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'bg-primary text-primary-foreground border-primary'
                    : isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white' 
                      : 'bg-background hover:bg-accent border-border'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white disabled:bg-gray-800' 
                  : 'bg-background hover:bg-accent border-border'
              }`}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-border'}`}>
          <p className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
            * 데이터 기준일: 2025-08-12
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
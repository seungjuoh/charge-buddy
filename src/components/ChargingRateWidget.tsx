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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
      minRate: 0,
      maxRate: 0,
      avgRate: 0,
  })

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
  }, [searchTerm, showMemberPrice, sortBy, itemsPerPage]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <span className="h-4 w-4 text-muted-foreground">—</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600";
      case "down":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  // 검색 필터링
  const filteredRates = rates.filter(rate => 
    rate.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 페이징 계산
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayRates = filteredRates.slice(startIndex, endIndex);

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
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            충전 요금 시세
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
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
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          실시간 충전 요금 비교
        </CardTitle>
        <p className="text-sm text-muted-foreground">(원/kWh)</p>
        
        {/* 필터 및 검색 */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="충전소 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-background"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={showMemberPrice ? "member" : "nonmember"}
                onChange={(e) => setShowMemberPrice(e.target.value === "member")}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="member">회원가</option>
                <option value="nonmember">비회원가</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "provider" | "price_asc" | "price_desc")}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="price_asc">낮은 가격 순</option>
                <option value="price_desc">높은 가격 순</option>
                <option value="provider">이름순</option>
              </select>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value={10}>10개씩</option>
                <option value={20}>20개씩</option>
                <option value={50}>50개씩</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span>총 {filteredRates.length}개 충전사업자</span>
            {filteredRates.length > 0 && (
              <span>• {startIndex + 1}-{Math.min(endIndex, filteredRates.length)} 표시</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayRates.map((rate, index) => (
            <div
              key={`${rate.provider}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{rate.provider}</span>
                  {startIndex + index === 0 && sortBy === "price_asc" && (
                    <Badge variant="secondary" className="text-xs">
                      최저가
                    </Badge>
                  )}
                  {startIndex + index === 0 && sortBy === "price_desc" && (
                    <Badge variant="secondary" className="text-xs">
                      최고가
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
          <div className="text-center py-8 text-muted-foreground">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}

        {/* 페이징 UI */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
            
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 text-sm border rounded-md ${
                  currentPage === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-accent'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            * 요금은 사업자별로 상이할 수 있으며, 실시간으로 업데이트됩니다.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            * 데이터 기준일: 2025-08-12
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
import React, { useState, useEffect, useRef } from 'react';

// --- 아이콘 컴포넌트들 (SVG) ---
const Zap = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const Clock = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TrendingUp = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>;
const TrendingDown = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>;
const Filter = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const Search = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ChevronLeft = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"></path></svg>;
const ChevronRight = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"></path></svg>;
const BarChart2 = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;

// --- UI 컴포넌트 (shadcn/ui 스타일 재현) ---
const Card = ({ className = "", children }) => <div className={`w-full bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm dark:bg-gray-900 dark:text-gray-50 dark:border-gray-800 ${className}`}>{children}</div>;
const CardHeader = ({ className = "", children }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className = "", children }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ className = "", children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Badge = ({ className = "", children }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;
const Button = ({ className = "", children, ...props }) => <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 ${className}`} {...props}>{children}</button>;

// --- 신규: 커스텀 셀렉트(필터) 컴포넌트 ---
const CustomSelect = ({ options, value, onChange, isActive }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const selectedLabel = options.find(opt => opt.value === value)?.label || '';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={selectRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 text-sm rounded-xl transition-all duration-200 flex items-center justify-between font-medium ${
                    isActive
                        ? 'bg-blue-50 border-2 border-blue-500 text-blue-800 shadow-md shadow-blue-500/10 dark:bg-green-900/20 dark:border-green-500 dark:text-green-200 dark:shadow-green-500/10'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:border-gray-600'
                } focus:outline-none focus:ring-0`}
            >
                <span>{selectedLabel}</span>
                <svg className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''} ${isActive ? 'text-blue-500 dark:text-green-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- 내장 CSV 파서 ---
const parseCSV = (csvString) => {
  const rows = csvString.trim().split('\n');
  return rows.map(row => row.split(','));
};

// --- 데이터 인터페이스 ---
interface ChargingRate {
  provider: string;
  fastCharging: number;
  slowCharging: number;
  memberFast: number;
  memberSlow: number;
  nonMemberFast: number;
  nonMemberSlow: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

// --- 메인 위젯 컴포넌트 ---
export const ChargingRateWidget = () => {
  // --- 상태 관리 및 데이터 로직 ---
  const [rates, setRates] = useState<ChargingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberPrice, setShowMemberPrice] = useState(true);
  const [sortBy, setSortBy] = useState("price_asc");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedSpeed, setSelectedSpeed] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // CSV 데이터 로드 및 파싱
  useEffect(() => {
    const loadCSVData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/전기차 충전 요금.csv');
      const csvContent = await response.text();
        
        // CSV 헤더를 건너뛰고 데이터 처리 (첫 3줄은 헤더)
        const data = parseCSV(csvContent);
        const providerMap = new Map();
        
        for (let i = 3; i < data.length; i++) { // 첫 3줄 건너뛰기
          const row = data[i];
          if (!row || !row[1] || row[1].trim() === '') continue;
          
          const [, provider, type, memberPriceStr, nonMemberPriceStr, lastUpdated] = row;
          
          if (!providerMap.has(provider)) {
            providerMap.set(provider, { 
              fastMember: [], slowMember: [], 
              fastNonMember: [], slowNonMember: [], 
              lastUpdated: '' 
            });
          }
          
          const d = providerMap.get(provider);
          const memberPrice = parseFloat(memberPriceStr) || 0;
          const nonMemberPrice = parseFloat(nonMemberPriceStr) || 0;
          
          if (type.includes('급속')) { 
            d.fastMember.push(memberPrice); 
            d.fastNonMember.push(nonMemberPrice); 
          } else if (type.includes('완속')) { 
            d.slowMember.push(memberPrice); 
            d.slowNonMember.push(nonMemberPrice); 
          }
          
          if (lastUpdated && lastUpdated > d.lastUpdated) {
            d.lastUpdated = lastUpdated;
          }
        }
        
        const getRelativeTime = (dateStr: string) => {
          if (!dateStr) return '정보 없음';
          const diffDays = Math.floor((new Date('2025-08-12').getTime() - new Date(dateStr).getTime()) / 86400000);
          if (diffDays <= 0) return '오늘';
          if (diffDays === 1) return '1일 전';
          if (diffDays < 7) return `${diffDays}일 전`;
          if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
          if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
          return '1년 이상';
        };
        
        const tempRates: any[] = [];
        providerMap.forEach((data, provider) => {
          const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
          tempRates.push({ 
            provider, 
            memberFast: avg(data.fastMember), 
            memberSlow: avg(data.slowMember), 
            nonMemberFast: avg(data.fastNonMember), 
            nonMemberSlow: avg(data.slowNonMember), 
            lastUpdated: getRelativeTime(data.lastUpdated) 
          });
        });
        
        const allValidRates = tempRates.flatMap(r => 
          showMemberPrice ? [r.memberFast, r.memberSlow] : [r.nonMemberFast, r.nonMemberSlow]
        ).filter(p => p > 0);
        const avgAll = allValidRates.length ? allValidRates.reduce((a, b) => a + b, 0) / allValidRates.length : 0;
        
        let processedRates = tempRates.map(rate => {
          const currentPrice = showMemberPrice ? (rate.memberFast || rate.memberSlow) : (rate.nonMemberFast || rate.nonMemberSlow);
          let trend: 'up' | 'down' | 'stable' = "stable";
          if (currentPrice > 0 && avgAll > 0) {
            if (currentPrice > avgAll * 1.05) trend = "up";
            else if (currentPrice < avgAll * 0.95) trend = "down";
          }
          return { 
            ...rate, 
            fastCharging: showMemberPrice ? rate.memberFast : rate.nonMemberFast, 
            slowCharging: showMemberPrice ? rate.memberSlow : rate.nonMemberSlow, 
            trend 
          };
        }).filter(r => r.fastCharging > 0 || r.slowCharging > 0);
        
        processedRates.sort((a, b) => {
          const getPrice = (rate: ChargingRate) => {
            if (selectedSpeed === 'fast' && rate.fastCharging > 0) return rate.fastCharging;
            if (selectedSpeed === 'slow' && rate.slowCharging > 0) return rate.slowCharging;
            // 속도 필터가 '전체'이거나 해당 속도 요금이 없을 경우, 유효한 요금 중 낮은 것을 기준으로
            const validPrices = [rate.fastCharging, rate.slowCharging].filter(p => p > 0);
            return validPrices.length > 0 ? Math.min(...validPrices) : Infinity;
          };
          
          switch (sortBy) {
            case 'price_asc':
              return getPrice(a) - getPrice(b);
            case 'price_desc':
              return getPrice(b) - getPrice(a);
            case 'provider':
              return a.provider.localeCompare(b.provider);
            default:
              return 0;
          }
        });
        
        setRates(processedRates);
      } catch (error) { 
        console.error('CSV 데이터 처리 오류:', error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    
    loadCSVData();
  }, [showMemberPrice, sortBy, selectedSpeed]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProvider, selectedSpeed, itemsPerPage]);

  const getTrendIcon = (trend: string) => {
    const base = "h-4 w-4";
    if (trend === "up") return <TrendingUp className={`${base} text-red-500`} />;
    if (trend === "down") return <TrendingDown className={`${base} text-blue-500 dark:text-green-500`} />;
    return <span className={`${base} text-gray-400`}>—</span>;
  };
  
  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-red-500";
    if (trend === "down") return "text-blue-500 dark:text-green-500";
    return "text-gray-500 dark:text-gray-400";
  };
  
  const filteredRates = rates.filter(rate => {
    const matchesSearch = rate.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || rate.provider === selectedProvider;
    const matchesSpeed = selectedSpeed === 'all' || 
                         (selectedSpeed === 'fast' && rate.fastCharging > 0) ||
                         (selectedSpeed === 'slow' && rate.slowCharging > 0);
    return matchesSearch && matchesProvider && matchesSpeed;
  });
  
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const displayRates = filteredRates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const availableProviders = [...new Set(rates.map(r => r.provider))].sort();
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const isFilterActive = (filterType: string, value: any) => {
    // 모든 필터가 항상 활성화된 색상으로 표시되도록 함
    return false;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filters = [
    { label: '충전속도', state: selectedSpeed, setState: setSelectedSpeed, options: [{value: 'all', label: '전체'}, {value: 'fast', label: '급속'}, {value: 'slow', label: '완속'}], filterType: 'speed' },
    { label: '요금타입', state: showMemberPrice ? 'member' : 'nonmember', setState: (val: string) => setShowMemberPrice(val === 'member'), options: [{value: 'member', label: '회원가'}, {value: 'nonmember', label: '비회원가'}], filterType: 'member' },
    { label: '사업자명', state: selectedProvider, setState: setSelectedProvider, options: [{value: 'all', label: '전체'}, ...availableProviders.map(p => ({value: p, label: p}))], filterType: 'provider' },
    { label: '정렬순서', state: sortBy, setState: setSortBy, options: [{value: 'price_asc', label: '낮은 가격 순'}, {value: 'price_desc', label: '높은 가격 순'}, {value: 'provider', label: '이름순'}], filterType: 'sort' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-600 dark:text-green-400">
          <Zap className="h-7 w-7" />
          실시간 충전 요금 비교
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">(원/kWh)</p>
        
        <div className="mt-6 space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500 dark:group-focus-within:text-green-400" />
            </div>
            <input
              type="text"
              placeholder="사업자명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-400
                         hover:border-gray-300 hover:shadow-md
                         focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10
                         dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500
                         dark:hover:border-gray-600 dark:hover:shadow-gray-900/20
                         dark:focus:border-green-500 dark:focus:shadow-green-500/10"
            />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map(({ label, state, setState, options, filterType }) => {
              const isActive = isFilterActive(filterType, state);
              return (
                <div key={label} className="space-y-2">
                  <label className={`block text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${
                    isActive 
                      ? 'text-blue-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {label}
                  </label>
                  <CustomSelect 
                    options={options}
                    value={state}
                    onChange={setState}
                    isActive={isActive}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3" />
            <span>총 {filteredRates.length}개</span>
            {filteredRates.length > 0 && (
              <span>• {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredRates.length)} 표시</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs">페이지당 표시:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="text-xs border border-gray-300 rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {displayRates.map((rate, index) => (
            <div 
              key={`${rate.provider}-${index}`} 
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:border-green-400/50 dark:hover:bg-green-500/10"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base text-gray-800 dark:text-gray-100">{rate.provider}</span>
                  {((currentPage - 1) * itemsPerPage) + index === 0 && sortBy === "price_asc" && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-green-900/50 dark:text-green-300">최저가</Badge>
                  )}
                  {((currentPage - 1) * itemsPerPage) + index === 0 && sortBy === "price_desc" && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">최고가</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    급속: {rate.fastCharging > 0 ? `${rate.fastCharging.toFixed(1)}원` : '없음'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    완속: {rate.slowCharging > 0 ? `${rate.slowCharging.toFixed(1)}원` : '없음'}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${getTrendColor(rate.trend)}`}>
                {getTrendIcon(rate.trend)}
                <span>{rate.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
        
        {displayRates.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-white border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map(num => (
              <Button 
                key={num} 
                onClick={() => setCurrentPage(num)} 
                className={currentPage === num 
                  ? 'bg-blue-600 text-white border-blue-600 dark:bg-green-600 dark:border-green-600' 
                  : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700'
                }
              >
                {num}
              </Button>
            ))}
            <Button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="bg-white border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">* 데이터 기준일: 2025-08-12</p>
        </div>
      </CardContent>
    </Card>
  );
};

// --- 앱 메인 컴포넌트 ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    };
    checkDarkMode();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    return () => mediaQuery.removeEventListener('change', checkDarkMode);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen font-sans p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <ChargingRateWidget />
      </div>
    </div>
  );
}
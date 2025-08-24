import React, { useState, useEffect } from 'react';

// --- 아이콘 컴포넌트들 ---
const Zap = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const Clock = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TrendingUp = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>;
const TrendingDown = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>;
const Filter = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const Search = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ChevronLeft = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"></path></svg>;
const ChevronRight = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"></path></svg>;
const BarChart2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;


// --- UI 컴포넌트 재현 ---
const Card = ({ className = "", children }) => <div className={`w-full bg-white border border-gray-200 rounded-xl shadow-md ${className}`}>{children}</div>;
const CardHeader = ({ className = "", children }) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className = "", children }) => <div className={`font-bold text-gray-900 ${className}`}>{children}</div>;
const CardContent = ({ className = "", children }) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const Badge = ({ className = "", children }) => <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${className}`}>{children}</span>;

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
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

// --- 신규: 가격 비교 차트 컴포넌트 ---
const PriceChart = ({ rates, showMemberPrice }) => {
  const chartData = rates
    .filter(r => r.fastCharging > 0)
    .sort((a, b) => a.fastCharging - b.fastCharging)
    .slice(0, 5);

  if (chartData.length === 0) {
    return null;
  }

  const maxPrice = Math.max(...chartData.map(r => r.fastCharging));

  return (
    <div className="mt-6 mb-4 p-4 border rounded-lg bg-gray-50 border-gray-200">
      <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-700">
        <BarChart2 className="w-4 h-4 mr-2" />
        TOP 5 최저가 (급속/{showMemberPrice ? '회원' : '비회원'})
      </h3>
      <div className="space-y-2">
        {chartData.map(rate => {
          const barWidth = (rate.fastCharging / maxPrice) * 100;
          return (
            <div key={rate.provider} className="flex items-center text-xs group">
              <div className="w-1/4 pr-2 text-right truncate text-gray-600">{rate.provider}</div>
              <div className="w-3/4 bg-gray-200 rounded-full">
                <div
                  className="bg-blue-500 h-5 flex items-center justify-end pr-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${barWidth}%` }}
                >
                  <span className="text-white font-medium">{rate.fastCharging.toFixed(1)}원</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- 메인 위젯 컴포넌트 ---
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

  // CSV 데이터 로드 및 파싱
  useEffect(() => {
    const loadCSVData = () => {
      setIsLoading(true);
      try {
        const csvContent = `순번,사업자,충전기 타입,회원가(kWh),비회원가(kWh),최종갱신일\n1,환경부,급속(100kW),324.4,430,2025-07-15\n2,환경부,완속,292.9,400,2025-07-15\n3,한국전력,급속(100kW),347.2,450,2025-08-01\n4,한국전력,완속,300,410,2025-08-01\n5,에버온,급속(100kW),345,460,2025-06-20\n6,에버온,완속,290,420,2025-06-20\n7,차지비,급속(100kW),360,470,2025-07-22\n8,차지비,완속,310,430,2025-07-22\n9,GS칼텍스,급속(200kW),380,490,2025-08-10\n10,SK에너지,급속(100kW),347.2,450,2025-05-30\n11,이마트,급속(100kW),324.4,430,2025-08-05\n12,이마트,완속,292.9,400,2025-08-05\n13,제주전기차서비스,급속(50kW),320,420,2025-04-11\n14,제주전기차서비스,완속,285,390,2025-04-11\n15,파워큐브,완속(7kW),280,380,2025-08-09`;
        const data = parseCSV(csvContent);
        const providerMap = new Map();
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || !row[1] || row[1].trim() === '') continue;
          const [ , provider, type, memberPriceStr, nonMemberPriceStr, lastUpdated] = row;
          if (!providerMap.has(provider)) providerMap.set(provider, { fastMember: [], slowMember: [], fastNonMember: [], slowNonMember: [], lastUpdated: '' });
          const d = providerMap.get(provider);
          const memberPrice = parseFloat(memberPriceStr) || 0;
          const nonMemberPrice = parseFloat(nonMemberPriceStr) || 0;
          if (type.includes('급속')) { d.fastMember.push(memberPrice); d.fastNonMember.push(nonMemberPrice); } 
          else if (type.includes('완속')) { d.slowMember.push(memberPrice); d.slowNonMember.push(nonMemberPrice); }
          if (lastUpdated && lastUpdated > d.lastUpdated) d.lastUpdated = lastUpdated;
        }
        const getRelativeTime = (dateStr) => {
          if (!dateStr) return '정보 없음';
          const diffDays = Math.floor((new Date('2025-08-12').getTime() - new Date(dateStr).getTime()) / 86400000);
          if (diffDays <= 0) return '오늘'; if (diffDays === 1) return '1일 전'; if (diffDays < 7) return `${diffDays}일 전`;
          if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`; if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
          return '1년 이상';
        };
        const tempRates = [];
        providerMap.forEach((data, provider) => {
          const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
          tempRates.push({ provider, memberFast: avg(data.fastMember), memberSlow: avg(data.slowMember), nonMemberFast: avg(data.fastNonMember), nonMemberSlow: avg(data.slowNonMember), lastUpdated: getRelativeTime(data.lastUpdated) });
        });
        const allValidRates = tempRates.flatMap(r => showMemberPrice ? [r.memberFast, r.memberSlow] : [r.nonMemberFast, r.nonMemberSlow]).filter(p => p > 0);
        const avgAll = allValidRates.length ? allValidRates.reduce((a, b) => a + b, 0) / allValidRates.length : 0;
        let processedRates = tempRates.map(rate => {
          const currentPrice = showMemberPrice ? (rate.memberFast || rate.memberSlow) : (rate.nonMemberFast || rate.nonMemberSlow);
          let trend = "stable";
          if (currentPrice > 0 && avgAll > 0) {
            if (currentPrice > avgAll * 1.05) trend = "up"; else if (currentPrice < avgAll * 0.95) trend = "down";
          }
          return { ...rate, fastCharging: showMemberPrice ? rate.memberFast : rate.nonMemberFast, slowCharging: showMemberPrice ? rate.memberSlow : rate.nonMemberSlow, trend };
        }).filter(r => r.fastCharging > 0 || r.slowCharging > 0);
        processedRates.sort((a, b) => {
          const priceA = a.fastCharging || a.slowCharging; const priceB = b.fastCharging || b.slowCharging;
          if (sortBy === 'price_asc') return priceA - priceB; if (sortBy === 'price_desc') return priceB - priceA;
          return a.provider.localeCompare(b.provider);
        });
        setRates(processedRates);
      } catch (error) { console.error('CSV 데이터 처리 오류:', error); } 
      finally { setIsLoading(false); }
    };
    loadCSVData();
  }, [showMemberPrice, sortBy]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedProvider, selectedSpeed, itemsPerPage]);

  const getTrendIcon = (trend) => {
    const base = "h-4 w-4";
    if (trend === "up") return <TrendingUp className={`${base} text-red-500`} />;
    if (trend === "down") return <TrendingDown className={`${base} text-green-500`} />;
    return <span className={`${base} text-gray-400`}>—</span>;
  };
  const getTrendColor = (trend) => {
    if (trend === "up") return "text-red-500";
    if (trend === "down") return "text-green-500";
    return "text-gray-500";
  };

  const filteredRates = rates.filter(rate => 
    rate.provider.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedProvider === "all" || rate.provider === selectedProvider) &&
    (selectedSpeed === "all" || (selectedSpeed === "fast" && rate.fastCharging > 0) || (selectedSpeed === "slow" && rate.slowCharging > 0))
  );

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const displayRates = filteredRates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const availableProviders = [...new Set(rates.map(r => r.provider))].sort();

  const getPageNumbers = () => {
    const pageNumbers = []; const maxPagesToShow = 3;
    let startPage = Math.max(1, currentPage - 1); let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Zap className="h-5 w-5" />실시간 충전 요금 비교
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-16 rounded-lg bg-gray-200"></div>)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-blue-600">
          <Zap className="h-6 w-6 md:h-7 md:w-7" />실시간 충전 요금 비교
        </CardTitle>
        <p className="text-sm text-gray-500">(원/kWh)</p>
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="사업자명 검색..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md border bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['충전속도', '회원가', '사업자명', '가격 순'].map(label => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium text-gray-700">{label}</label>
                <select 
                  className="w-full px-2 py-2 text-xs md:text-sm rounded-md border bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={ label === '충전속도' ? selectedSpeed : label === '회원가' ? (showMemberPrice ? "member" : "nonmember") : label === '사업자명' ? selectedProvider : sortBy }
                  onChange={(e) => {
                    if (label === '충전속도') setSelectedSpeed(e.target.value); 
                    else if (label === '회원가') setShowMemberPrice(e.target.value === "member");
                    else if (label === '사업자명') setSelectedProvider(e.target.value); 
                    else setSortBy(e.target.value as any);
                  }}
                >
                  {label === '충전속도' && <><option value="all">전체</option><option value="fast">급속</option><option value="slow">완속</option></>}
                  {label === '회원가' && <><option value="member">회원가</option><option value="nonmember">비회원가</option></>}
                  {label === '사업자명' && <><option value="all">전체</option>{availableProviders.map(p => <option key={p} value={p}>{p}</option>)}</>}
                  {label === '가격 순' && <><option value="price_asc">낮은 가격 순</option><option value="price_desc">높은 가격 순</option><option value="provider">이름순</option></>}
                </select>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <PriceChart rates={rates} showMemberPrice={showMemberPrice} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3" />
            <span>총 {filteredRates.length}개</span>
            {filteredRates.length > 0 && <span>• {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredRates.length)} 표시</span>}
          </div>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="w-fit px-2 py-1 rounded-md border bg-white border-gray-300 text-gray-900 outline-none">
            <option value={10}>10개씩</option>
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
          </select>
        </div>
        <div className="space-y-3">
          {displayRates.map((rate, index) => (
            <div key={`${rate.provider}-${index}`} className="flex items-center justify-between p-3 md:p-4 rounded-lg border bg-white border-gray-200 transition-all hover:shadow-lg hover:border-blue-400">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm md:text-base text-gray-800">{rate.provider}</span>
                  {((currentPage - 1) * itemsPerPage) + index === 0 && sortBy === "price_asc" && <Badge className="bg-green-100 text-green-800">최저가</Badge>}
                  {((currentPage - 1) * itemsPerPage) + index === 0 && sortBy === "price_desc" && <Badge className="bg-red-100 text-red-800">최고가</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" />급속: {rate.fastCharging > 0 ? `${rate.fastCharging.toFixed(1)}원` : '없음'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />완속: {rate.slowCharging > 0 ? `${rate.slowCharging.toFixed(1)}원` : '없음'}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${getTrendColor(rate.trend)}`}>
                {getTrendIcon(rate.trend)}<span>{rate.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
        {displayRates.length === 0 && <div className="text-center py-8 text-gray-500"><p>검색 결과가 없습니다.</p></div>}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-100 border-gray-300 text-gray-800">
              <ChevronLeft className="h-4 w-4" />이전
            </button>
            {getPageNumbers().map(num => 
              <button 
                key={num} 
                onClick={() => setCurrentPage(num)} 
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${currentPage === num ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800'}`}>
                {num}
              </button>
            )}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-100 border-gray-300 text-gray-800">
              다음<ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-center mt-1 text-gray-500">* 데이터 기준일: 2025-08-12</p>
        </div>
      </CardContent>
    </Card>
  );
};

// --- 앱 메인 컴포넌트 ---
export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <ChargingRateWidget />
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Car, 
  CreditCard, 
  Settings, 
  Edit, 
  ChevronRight, 
  LogOut,
  Cloud,
  TrendingUp,
  Zap,
  Clock,
  DollarSign
} from "lucide-react";

// ChargingRateWidget 컴포넌트
export const ChargingRateWidget = () => {
  const [currentTime] = useState(new Date().getHours());
  const isPeakTime = currentTime >= 10 && currentTime <= 22;
  
  return (
    <Card className="w-full bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base font-semibold text-foreground">
          <Zap className="w-5 h-5 mr-3 text-primary" />
          실시간 충전 요금
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">현재 요금</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg text-primary">
              {isPeakTime ? '320' : '240'}원/kWh
            </span>
            <div className="text-xs text-muted-foreground">
              {isPeakTime ? '피크시간' : '오프피크'}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">오프피크 (23:00-09:00)</span>
            <span className="font-semibold">240원/kWh</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">일반시간 (09:00-10:00, 22:00-23:00)</span>
            <span className="font-semibold">280원/kWh</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">피크시간 (10:00-22:00)</span>
            <span className="font-semibold">320원/kWh</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>다음 요금 변경</span>
            <span>{isPeakTime ? '22:00 (일반)' : '09:00 (일반)'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 사용자 프로필 데이터
const userProfile = {
  name: '김전기',
  email: 'kimev@example.com',
  joinDate: '2023.05.15',
  totalCharges: 156,
  totalAmount: 1250000,
  favoriteStations: 8,
  monthlyStats: { charges: 12, amount: 85000, energy: 142.5 },
  vehicles: [
    { 
      id: 1, 
      model: '현대 아이오닉 6', 
      year: '2023', 
      plateNumber: '12가 3456', 
      batteryCapacity: '77.4kWh', 
      isPrimary: true 
    }
  ],
  paymentMethods: [
    { 
      id: 1, 
      type: 'card', 
      name: '신한카드 ****-1234', 
      isDefault: true 
    }
  ],
};

// 사용자 정보 컴포넌트
const UserInfo = () => (
  <div className="text-center">
    <Avatar className="w-24 h-24 mx-auto mb-4">
      <AvatarFallback className="text-3xl bg-primary/10 text-primary font-medium">
        {userProfile.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
    <h3 className="text-xl font-semibold text-foreground">{userProfile.name}</h3>
    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
    <Badge variant="outline" className="mt-4 border-border text-muted-foreground font-normal">
      가입일: {userProfile.joinDate}
    </Badge>
  </div>
);

// 통계 카드 컴포넌트
const UserStatsCards = () => (
  <Card className="bg-card border-border rounded-xl shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center text-base font-semibold text-foreground">
        <TrendingUp className="w-5 h-5 mr-3 text-primary" />
        사용 통계
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <div className="text-sm font-medium text-muted-foreground mb-4">이번 달 충전 현황</div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">충전 횟수</span>
            <span className="font-semibold text-foreground">{userProfile.monthlyStats.charges}회</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">충전 비용</span>
            <span className="font-semibold text-foreground">
              {userProfile.monthlyStats.amount.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-muted-foreground">원</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">충전량</span>
            <span className="font-semibold text-foreground">
              {userProfile.monthlyStats.energy}
              <span className="ml-1 text-sm font-normal text-muted-foreground">kWh</span>
            </span>
          </div>
        </div>
      </div>
      <Separator className="bg-border" />
      <div>
        <div className="text-sm font-medium text-muted-foreground mb-4">총 누적 현황</div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">총 충전 횟수</span>
            <span className="font-semibold text-foreground">{userProfile.totalCharges}회</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">총 충전 비용</span>
            <span className="font-semibold text-foreground">
              {(userProfile.totalAmount / 10000).toFixed(0)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">만원</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">즐겨찾기</span>
            <span className="font-semibold text-foreground">{userProfile.favoriteStations}개소</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// 차량 관리 섹션
const VehicleSection = () => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-foreground">등록된 차량</h4>
    {userProfile.vehicles.map((vehicle) => (
      <Card key={vehicle.id} className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h5 className="font-semibold text-foreground">{vehicle.model}</h5>
                {vehicle.isPrimary && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">주차량</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {vehicle.year}년 • {vehicle.plateNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                배터리 용량: {vehicle.batteryCapacity}
              </p>
            </div>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
    <Button className="w-full" variant="outline">
      <Car className="w-4 h-4 mr-2" />
      차량 추가
    </Button>
  </div>
);

// 결제 수단 섹션
const PaymentSection = () => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-foreground">결제 수단</h4>
    {userProfile.paymentMethods.map((method) => (
      <Card key={method.id} className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{method.name}</p>
                {method.isDefault && (
                  <Badge variant="secondary" className="mt-1">기본 결제 수단</Badge>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
    <Button className="w-full" variant="outline">
      <CreditCard className="w-4 h-4 mr-2" />
      결제 수단 추가
    </Button>
  </div>
);

// 설정 섹션
const SettingsSection = () => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold text-foreground">설정</h4>
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">알림 설정</span>
          <Button size="sm" variant="outline">변경</Button>
        </div>
        <Separator className="bg-border" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">언어 설정</span>
          <Button size="sm" variant="outline">한국어</Button>
        </div>
        <Separator className="bg-border" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">테마 설정</span>
          <Button size="sm" variant="outline">자동</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// 로그아웃 버튼 컴포넌트
const LogoutButton = () => (
  <Button
    className="w-full h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90"
  >
    <LogOut className="w-4 h-4 mr-2" />
    로그아웃
  </Button>
);

// 메뉴 네비게이션 컴포넌트
const SidebarNav = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'vehicle', label: '차량 관리', icon: Car },
    { id: 'payment', label: '결제 수단', icon: CreditCard },
    { id: 'charging', label: '충전 요금', icon: Zap },
    { id: 'weather', label: '날씨 정보', icon: Cloud },
    { id: 'settings', label: '설정', icon: Settings }
  ];

  return (
    <div className="space-y-1">
      {menuItems.map((item) => {
        const isActive = activeSection === item.id;
        const baseClasses = "w-full justify-start h-9 px-3 rounded-md text-sm font-medium flex items-center transition-colors";
        const activeClasses = "bg-blue-600 text-white hover:bg-blue-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700";
        const inactiveClasses = "bg-transparent text-foreground hover:bg-blue-400 hover:text-white dark:hover:bg-green-400 dark:hover:text-white";

        return (
          <Button 
            key={item.id} 
            size="sm" 
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} 
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        );
      })}
    </div>
  );
};

// 콘텐츠 렌더링 컴포넌트
const SidebarContent = ({ activeSection }) => {
  const renderProfileSection = () => (
    <div className="space-y-6">
      <UserInfo />
      <UserStatsCards />
    </div>
  );

  const renderChargingSection = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-foreground">충전 요금 정보</h4>
      <ChargingRateWidget />
    </div>
  );

  const renderWeatherSection = () => (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-base font-semibold text-foreground">
          <Cloud className="w-5 h-5 mr-3 text-primary" />
          날씨 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">날씨 정보를 불러오는 중...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="overflow-y-auto h-[calc(100%-15rem)]">
      {activeSection === 'profile' && renderProfileSection()}
      {activeSection === 'vehicle' && <VehicleSection />}
      {activeSection === 'payment' && <PaymentSection />}
      {activeSection === 'charging' && renderChargingSection()}
      {activeSection === 'weather' && renderWeatherSection()}
      {activeSection === 'settings' && <SettingsSection />}
    </div>
  );
};

// 메인 컴포넌트
export default function UserProfile() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="p-6 space-y-4 bg-background text-foreground h-full flex flex-col max-w-md mx-auto">
      <div className="flex-grow min-h-0">
        <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} />
        <Separator className="my-4 bg-border" />
        <SidebarContent activeSection={activeSection} />
      </div>
      <div className="mt-auto pt-4">
        <Separator className="mb-4 bg-border" />
        <LogoutButton />
      </div>
    </div>
  );
}
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
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

// (userProfile 데이터는 동일하게 사용합니다)
const userProfile = {
  name: '김전기',
  email: 'kimev@example.com',
  joinDate: '2023.05.15',
  totalCharges: 156,
  totalAmount: 1250000,
  favoriteStations: 8,
  monthlyStats: { charges: 12, amount: 85000, energy: 142.5 },
  vehicles: [{ id: 1, model: '현대 아이오닉 6', year: '2023', plateNumber: '12가 3456', batteryCapacity: '77.4kWh', isPrimary: true }],
  paymentMethods: [{ id: 1, type: 'card', name: '신한카드 ****-1234', isDefault: true }],
};

// --- 새로운 UI를 위한 Stats 카드 컴포넌트 ---
// 요청하신 '라벨-값' 형태의 레이아웃으로 데이터를 표시합니다.
const UserStatsCards = () => (
  <Card className="bg-sidebar-accent border-sidebar-border rounded-xl shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center text-base font-semibold text-sidebar-foreground">
        <TrendingUp className="w-5 h-5 mr-3 text-sidebar-primary" />
        요약
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* --- 이번 달 충전 현황 --- */}
      <div>
        <div className="text-sm font-medium text-sidebar-muted-foreground mb-4">이번 달 충전 현황</div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-muted-foreground">충전 횟수</span>
            <span className="font-semibold text-sidebar-foreground">{userProfile.monthlyStats.charges}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-muted-foreground">충전 비용</span>
            <span className="font-semibold text-sidebar-foreground">
              {userProfile.monthlyStats.amount.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-sidebar-muted-foreground">원</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-muted-foreground">충전량</span>
            <span className="font-semibold text-sidebar-foreground">
              {userProfile.monthlyStats.energy}
              <span className="ml-1 text-sm font-normal text-sidebar-muted-foreground">kWh</span>
            </span>
          </div>
        </div>
      </div>
      
      <Separator className="bg-sidebar-border" />

      {/* --- 총 누적 현황 --- */}
      <div>
        <div className="text-sm font-medium text-sidebar-muted-foreground mb-4">총 누적 현황</div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-muted-foreground">총 충전 횟수</span>
            <span className="font-semibold text-sidebar-foreground">{userProfile.totalCharges}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-muted-foreground">총 충전 비용</span>
            <span className="font-semibold text-sidebar-foreground">
              {(userProfile.totalAmount / 10000).toFixed(0)}
              <span className="ml-1 text-sm font-normal text-sidebar-muted-foreground">만원</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-sidebar-muted-foreground">즐겨찾기</span>
            <span className="font-semibold text-sidebar-foreground">{userProfile.favoriteStations}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- 로그아웃 버튼 컴포넌트 ---
const LogoutButton = () => (
  <Button variant="outline" className="w-full h-10 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
    <LogOut className="w-4 h-4 mr-2" />
    로그아웃
  </Button>
);

export const UserProfile = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* 사용자 정보 (아바타, 이름 등) */}
      <div className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarFallback className="text-3xl bg-sidebar-accent text-sidebar-primary font-medium">
            {userProfile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold text-sidebar-foreground">{userProfile.name}</h3>
        <p className="text-sm text-sidebar-muted-foreground">{userProfile.email}</p>
        <Badge variant="outline" className="mt-4 border-sidebar-border text-sidebar-muted-foreground font-normal">
          가입일: {userProfile.joinDate}
        </Badge>
      </div>
      {/* 분리된 통계 카드 컴포넌트 사용 */}
      <UserStatsCards />
    </div>
  );

  const renderVehicleSection = () => ( <div className="p-4 text-sidebar-foreground">차량 관리 섹션이 여기에 표시됩니다.</div> );
  const renderPaymentSection = () => ( <div className="p-4 text-sidebar-foreground">결제 수단 섹션이 여기에 표시됩니다.</div> );
  const renderSettingsSection = () => ( <div className="p-4 text-sidebar-foreground">설정 섹션이 여기에 표시됩니다.</div> );

  const menuItems = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'vehicle', label: '차량 관리', icon: Car },
    { id: 'payment', label: '결제 수단', icon: CreditCard },
    { id: 'weather', label: '날씨 정보', icon: Cloud, isLink: true, to: '/weather' },
    { id: 'settings', label: '설정', icon: Settings }
  ];

  return (
    <div className="p-6 space-y-4 bg-sidebar-background text-sidebar-foreground h-full flex flex-col">
      <div className="flex-grow min-h-0">
        {/* --- 메뉴 네비게이션 --- */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const commonClasses = "w-full justify-start h-9 px-3 rounded-md text-sm font-medium flex items-center transition-colors";
            const iconClasses = "w-4 h-4 mr-3";
            const isActive = activeSection === item.id;

            if (item.isLink) {
              return (
                <Link key={item.id} to={item.to!} className={`${commonClasses} hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}>
                  <item.icon className={iconClasses} />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              );
            } else {
              return (
                <Button key={item.id} variant="ghost" size="sm"
                  className={`${commonClasses} ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className={iconClasses} />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              );
            }
          })}
        </div>

        <Separator className="my-4 bg-sidebar-border" />

        {/* --- 선택된 섹션 콘텐츠 렌더링 (스크롤 가능 영역) --- */}
        <div className="overflow-y-auto h-[calc(100%-15rem)]"> {/* 높이 값은 실제 레이아웃에 맞게 조정하세요 */}
            {activeSection === 'profile' && renderProfileSection()}
            {activeSection === 'vehicle' && renderVehicleSection()}
            {activeSection === 'payment' && renderPaymentSection()}
            {activeSection === 'settings' && renderSettingsSection()}
        </div>
      </div>

      {/* --- 로그아웃 버튼 (하단 고정) --- */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4 bg-sidebar-border" />
        <LogoutButton />
      </div>
    </div>
  );
};
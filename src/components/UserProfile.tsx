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
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const userProfile = {
  name: '김전기',
  email: 'kimev@example.com',
  phone: '010-1234-5678',
  joinDate: '2023.05.15',
  totalCharges: 156,
  totalAmount: 1250000,
  favoriteStations: 8,
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
    },
    {
      id: 2,
      type: 'account',
      name: '국민은행 ****-56-789012',
      isDefault: false
    }
  ],
  monthlyStats: {
    charges: 12,
    amount: 85000,
    energy: 142.5
  }
};

export const UserProfile = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderProfileSection = () => (
    <div className="space-y-3">
      {/* User Info */}
      <div className="text-center mb-4">
        <Avatar className="w-16 h-16 mx-auto mb-3">
          <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
            {userProfile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-base font-semibold text-gray-900">{userProfile.name}</h3>
        <p className="text-sm text-gray-600">{userProfile.email}</p>
        <Badge variant="outline" className="mt-2">
          가입일: {userProfile.joinDate}
        </Badge>
      </div>

      {/* Monthly Stats */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">이번 달 충전 현황</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{userProfile.monthlyStats.charges}</div>
              <div className="text-xs text-gray-600">충전 횟수</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {userProfile.monthlyStats.amount.toLocaleString()}원
              </div>
              <div className="text-xs text-gray-600">충전 비용</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {userProfile.monthlyStats.energy}kWh
              </div>
              <div className="text-xs text-gray-600">충전량</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-base font-bold text-gray-900">{userProfile.totalCharges}</div>
              <div className="text-xs text-gray-600">총 충전 횟수</div>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">
                {(userProfile.totalAmount / 10000).toFixed(0)}만원
              </div>
              <div className="text-xs text-gray-600">총 충전 비용</div>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">{userProfile.favoriteStations}</div>
              <div className="text-xs text-gray-600">즐겨찾기</div>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );

  const renderVehicleSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">등록된 차량</h3>
        <Button size="sm" variant="outline" className="h-8 px-3">
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      </div>

      {userProfile.vehicles.map((vehicle) => (
        <Card key={vehicle.id} className={`${vehicle.isPrimary ? 'border-blue-200 bg-blue-50' : ''} border-0 shadow-sm`}>
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{vehicle.model}</h4>
                <p className="text-xs text-gray-600">{vehicle.year}년식</p>
              </div>
              {vehicle.isPrimary && (
                <Badge className="bg-blue-600 text-xs">주차량</Badge>
              )}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">차량번호</span>
                <span className="font-medium">{vehicle.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배터리 용량</span>
                <span className="font-medium">{vehicle.batteryCapacity}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" size="sm" className="w-full h-9">
        <Car className="w-4 h-4 mr-2" />
        차량 추가
      </Button>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">결제 수단</h3>
        <Button size="sm" variant="outline" className="h-8 px-3">
          <Edit className="w-4 h-4 mr-2" />
          편집
        </Button>
      </div>

      {userProfile.paymentMethods.map((method) => (
        <Card key={method.id} className={`${method.isDefault ? 'border-green-200 bg-green-50' : ''} border-0 shadow-sm`}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{method.name}</p>
                  <p className="text-xs text-gray-600">
                    {method.type === 'card' ? '신용카드' : '계좌'}
                  </p>
                </div>
              </div>
              {method.isDefault && (
                <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                  기본
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" size="sm" className="w-full h-9">
        <CreditCard className="w-4 h-4 mr-2" />
        결제 수단 추가
      </Button>
    </div>
  );

  const menuItems = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'vehicle', label: '차량 관리', icon: Car },
    { id: 'payment', label: '결제 수단', icon: CreditCard },
    { id: 'weather', label: '날씨 정보', icon: Cloud, isLink: true, to: '/weather' },
    { id: 'settings', label: '설정', icon: Settings }
  ];

  return (
    <div className="space-y-4">

      {/* Menu Navigation */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          item.isLink ? (
            <Link key={item.id} to={item.to!}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9"
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
          ) : (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start h-9"
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )
        ))}
      </div>

      <Separator />

      {/* Content */}
      {activeSection === 'profile' && renderProfileSection()}
      {activeSection === 'vehicle' && renderVehicleSection()}
      {activeSection === 'payment' && renderPaymentSection()}
      {activeSection === 'settings' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">설정</h3>
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start h-9">
              알림 설정
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-9">
              개인정보 처리방침
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-9">
              서비스 이용약관
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-9">
              앱 버전 정보
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Logout */}
      <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 h-9">
        <LogOut className="w-4 h-4 mr-2" />
        로그아웃
      </Button>
    </div>
  );
};
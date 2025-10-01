'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  CalendarDaysIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// メニューアイテムの定義
interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  children?: MenuItem[];
}

const menuItems: { [key: string]: MenuItem[] } = {
  live_dep: [
    { text: 'ダッシュボード', icon: <HomeIcon className="w-5 h-5" />, path: '/live_dep' },
    { text: 'ライバー管理', icon: <UsersIcon className="w-5 h-5" />, path: '/live_dep/livers' },
    { text: '目標管理', icon: <ChartBarIcon className="w-5 h-5" />, path: '/live_dep/goals' },
    {
      text: 'レポート',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      path: '/live_dep/reports',
      children: [
        { text: '日報', icon: <CalendarIcon className="w-4 h-4" />, path: '/live_dep/reports/daily' },
        { text: '週報', icon: <CalendarDaysIcon className="w-4 h-4" />, path: '/live_dep/reports/weekly' },
        { text: '月報', icon: <DocumentChartBarIcon className="w-4 h-4" />, path: '/live_dep/reports/monthly' },
      ]
    },
    { text: 'イベント管理', icon: <VideoCameraIcon className="w-5 h-5" />, path: '/live_dep/schedule' },
    { text: 'マイページ', icon: <UserCircleIcon className="w-5 h-5" />, path: '/live_dep/profile' },
    { text: '設定', icon: <CogIcon className="w-5 h-5" />, path: '/live_dep/settings' },
  ],
  fan_dep: [
    { text: 'ダッシュボード', icon: <HomeIcon className="w-5 h-5" />, path: '/fan_dep' },
    { text: 'クリエイター管理', icon: <UsersIcon className="w-5 h-5" />, path: '/fan_dep/creator' },
    { text: 'キャンペーン', icon: <MegaphoneIcon className="w-5 h-5" />, path: '/fan_dep/campaigns' },
    { text: 'アナリティクス', icon: <ChartBarIcon className="w-5 h-5" />, path: '/fan_dep/analytics' },
    { text: 'マイページ', icon: <UserCircleIcon className="w-5 h-5" />, path: '/fan_dep/profile' },
    { text: '設定', icon: <CogIcon className="w-5 h-5" />, path: '/fan_dep/settings' },
  ],
  afe_dep: [
    { text: 'ダッシュボード', icon: <HomeIcon className="w-5 h-5" />, path: '/afe_dep' },
    { text: '請求書管理', icon: <DocumentIcon className="w-5 h-5" />, path: '/afe_dep/invoices' },
    // { text: 'アフィリエイター', icon: <UsersIcon className="w-5 h-5" />, path: '/afe_dep/affiliators' },
    // { text: '成果管理', icon: <CurrencyDollarIcon className="w-5 h-5" />, path: '/afe_dep/results' },
    // { text: 'レポート', icon: <DocumentChartBarIcon className="w-5 h-5" />, path: '/afe_dep/reports' },
    { text: 'マイページ', icon: <UserCircleIcon className="w-5 h-5" />, path: '/afe_dep/profile' },
    { text: '設定', icon: <CogIcon className="w-5 h-5" />, path: '/afe_dep/settings' },
  ],
};

interface DepartmentLayoutProps {
  children: React.ReactNode;
  departmentName: string;
  departmentCode: 'live_dep' | 'fan_dep' | 'afe_dep';
}

export default function DepartmentLayout({ children, departmentName, departmentCode }: DepartmentLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({ '分析': true });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const response = await fetch('/api/auth/check-session');
    const data = await response.json();
    
    if (!data.authenticated) {
      router.push(`/${departmentCode}/login`);
    } else {
      setEmployee(data.employee);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${departmentCode}/login`);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSubmenu = (text: string) => {
    setExpandedMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー - デスクトップ */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            {/* ロゴ/部署名 */}
            <div className="flex items-center h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-lg font-bold text-white">{departmentName}</h2>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {menuItems[departmentCode].map((item) => {
                const isActive = pathname === item.path;
                const isParentActive = item.children?.some(child => pathname === child.path);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus[item.text];

                return (
                  <div key={item.path}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleSubmenu(item.text);
                        }
                        router.push(item.path);
                      }}
                      className={`
                        flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive || isParentActive
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <span className={isActive || isParentActive ? 'text-blue-700' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span className="ml-3">{item.text}</span>
                      </div>
                      {hasChildren && (
                        <span className={isActive || isParentActive ? 'text-blue-700' : 'text-gray-400'}>
                          {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </span>
                      )}
                    </button>
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.path;
                          return (
                            <button
                              key={child.path}
                              onClick={() => router.push(child.path)}
                              className={`
                                flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors
                                ${isChildActive
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <span className={isChildActive ? 'text-blue-700' : 'text-gray-400'}>
                                {child.icon}
                              </span>
                              <span className="ml-3">{child.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* ユーザー情報 */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {employee.display_name || employee.first_name}
                  </p>
                  <p className="text-xs text-gray-500">{employee.employee_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルサイドバー */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="relative flex flex-col w-64 h-full bg-white">
            {/* ヘッダー */}
            <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-lg font-bold text-white">{departmentName}</h2>
              <button onClick={toggleMobileMenu} className="text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {menuItems[departmentCode].map((item) => {
                const isActive = pathname === item.path;
                const isParentActive = item.children?.some(child => pathname === child.path);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus[item.text];

                return (
                  <div key={item.path}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleSubmenu(item.text);
                        } else {
                          router.push(item.path);
                          setMobileOpen(false);
                        }
                      }}
                      className={`
                        flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive || isParentActive
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <span className={isActive || isParentActive ? 'text-blue-700' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span className="ml-3">{item.text}</span>
                      </div>
                      {hasChildren && (
                        <span className={isActive || isParentActive ? 'text-blue-700' : 'text-gray-400'}>
                          {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </span>
                      )}
                    </button>
                    {hasChildren && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.path;
                          return (
                            <button
                              key={child.path}
                              onClick={() => {
                                router.push(child.path);
                                setMobileOpen(false);
                              }}
                              className={`
                                flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors
                                ${isChildActive
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <span className={isChildActive ? 'text-blue-700' : 'text-gray-400'}>
                                {child.icon}
                              </span>
                              <span className="ml-3">{child.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* ユーザー情報 */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {employee.display_name || employee.first_name}
                  </p>
                  <p className="text-xs text-gray-500">{employee.employee_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツエリア */}
      <div className="flex flex-col flex-1 w-full">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* モバイルメニューボタン */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* タイトル（デスクトップ） */}
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {(() => {
                    // 直接マッチするページを探す
                    const directMatch = menuItems[departmentCode].find(item => item.path === pathname);
                    if (directMatch) return directMatch.text;
                    
                    // サブメニューから探す
                    for (const item of menuItems[departmentCode]) {
                      if (item.children) {
                        const childMatch = item.children.find(child => child.path === pathname);
                        if (childMatch) return `${item.text} / ${childMatch.text}`;
                      }
                    }
                    return 'ページ';
                  })()}
                </h1>
              </div>

              {/* タイトル（モバイル） */}
              <div className="md:hidden">
                <h1 className="text-lg font-semibold text-gray-900">
                  {departmentName}
                </h1>
              </div>

              {/* プロファイルメニュー */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <UserCircleIcon className="w-8 h-8" />
                  <span className="hidden md:block ml-2 text-sm font-medium text-gray-700">
                    {employee.display_name || employee.first_name}
                  </span>
                </button>

                {/* ドロップダウンメニュー */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-medium">{employee.display_name || employee.first_name}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-2" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
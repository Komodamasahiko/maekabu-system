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
  MegaphoneIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

// メニューアイテムの定義
interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'ダッシュボード', icon: <HomeIcon className="w-5 h-5" />, path: '/' },
  { 
    text: 'クリエイター管理', 
    icon: <UsersIcon className="w-5 h-5" />, 
    path: '/creator',
    children: [
      { text: 'ファンティア', icon: <UsersIcon className="w-4 h-4" />, path: '/creator/fantia' },
      { text: 'マイファンズ', icon: <UsersIcon className="w-4 h-4" />, path: '/creator/myfans' },
    ]
  },
  { 
    text: '入出金管理', 
    icon: <BanknotesIcon className="w-5 h-5" />, 
    path: '/payment',
    children: [
      { text: '入金一覧', icon: <BanknotesIcon className="w-4 h-4" />, path: '/payment/deposits' },
      { text: '出金一覧', icon: <BanknotesIcon className="w-4 h-4" />, path: '/payment/withdrawals' },
      { text: '振込申請', icon: <BanknotesIcon className="w-4 h-4" />, path: '/payment/transfer-request' },
    ]
  },
  { text: 'マイページ', icon: <UserCircleIcon className="w-5 h-5" />, path: '/profile' },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({ 'クリエイター管理': true, '入出金管理': true });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const response = await fetch('/api/auth/login');
    const data = await response.json();
    
    if (!data.authenticated) {
      // 未ログインの場合はログインページへ
      router.push('/login');
    } else {
      setEmployee(data.user);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    // ログアウト処理
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const toggleSubmenu = (menuText: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
  };

  const isMenuActive = (menuPath: string) => {
    return pathname === menuPath || pathname.startsWith(menuPath + '/');
  };

  const drawer = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="p-4">
        <h1 className="text-xl font-bold text-white mb-2">株式会社まえかぶ</h1>
        <p className="text-xs text-gray-400">社内システム</p>
      </div>
      
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.text}>
            <button
              onClick={() => {
                if (item.children) {
                  toggleSubmenu(item.text);
                } else {
                  router.push(item.path);
                  setMobileOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all ${
                isMenuActive(item.path)
                  ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.text}</span>
              </div>
              {item.children && (
                expandedMenus[item.text] ? 
                  <ChevronDownIcon className="w-4 h-4" /> : 
                  <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
            
            {item.children && expandedMenus[item.text] && (
              <div className="ml-6 mt-1">
                {item.children.map((child) => (
                  <button
                    key={child.text}
                    onClick={() => {
                      router.push(child.path);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md transition-all ${
                      pathname === child.path
                        ? 'bg-pink-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {child.icon}
                    <span className="ml-3">{child.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        {employee ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="ml-2">
                <p className="text-sm font-medium text-white">{employee.name}</p>
                <p className="text-xs text-gray-400">{employee.department}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-400">ゲストユーザー</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* モバイル用ドロワー */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black transition-opacity ${
            mobileOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={handleDrawerToggle}
        />
        <div
          className={`absolute left-0 top-0 h-full w-64 transform bg-gray-900 transition-transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {drawer}
        </div>
      </div>

      {/* デスクトップ用サイドバー */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex-1 flex flex-col min-h-0">
          {drawer}
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={handleDrawerToggle}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            
            <div className="flex-1 px-4 lg:px-0">
              <h2 className="text-lg font-semibold text-gray-800">
                {menuItems.find(item => isMenuActive(item.path))?.text || 'ダッシュボード'}
              </h2>
            </div>

            {/* プロフィールメニュー */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </button>
              
              {profileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={() => router.push('/profile')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    プロフィール
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    設定
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
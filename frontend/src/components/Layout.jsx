import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  CloudOff,
  ChevronRight,
  Baby
} from 'lucide-react';

export default function Layout({ children }) {
  const {
    user,
    logoutUser,
    activeTab,
    setActiveTab,
    settings,
    saveSettings,
    notifications,
    markNotifRead,
    clearAllNotifs,
    isOffline,
    sidebarOpen,
    setSidebarOpen
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'input', label: 'Catat ASIP', icon: PlusCircle },
    { id: 'baby', label: 'Keseharian Bayi', icon: Baby },
    { id: 'history', label: 'Riwayat Data', icon: History },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'notifications', label: 'Simulasi Alarm', icon: Bell },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  const unreadNotifCount = notifications.filter(n => !n.is_read).length;

  const handleThemeToggle = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    saveSettings({ ...settings, theme: nextTheme });
  };

  const getPageTitle = () => {
    const item = menuItems.find(m => m.id === activeTab);
    return item ? item.label : 'ASIP Monitor';
  };

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700
        transform lg:transform-none lg:opacity-100 transition-all duration-300 ease-in-out
        flex flex-col justify-between
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700 bg-brand-500 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-brand-600 font-black text-sm">AM</span>
              </div>
              <span className="font-bold text-lg tracking-wider">ASIP Monitor</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="mt-6 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-brand-50 text-brand-650 dark:bg-slate-700/50 dark:text-brand-350'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'notifications' && unreadNotifCount > 0 && (
                    <span className="bg-rose-500 text-white text-xxs font-semibold px-2 py-0.5 rounded-full">
                      {unreadNotifCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-brand-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-350 font-bold">
              {user?.name ? user.name[0].toUpperCase() : 'I'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate dark:text-white">{user?.name || 'Ibu ASIP'}</p>
              <p className="text-xs text-slate-450 dark:text-slate-500 truncate">{user?.email || 'ibu@asip.com'}</p>
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-35 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Global Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 relative z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
              {getPageTitle()}
            </h2>
            {isOffline && (
              <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-200 dark:border-amber-900/40">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={settings.theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
            >
              {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className={`p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition relative ${notifDropdownOpen ? 'bg-slate-50 dark:bg-slate-700' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">Notifikasi</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => { clearAllNotifs(); setNotifDropdownOpen(false); }}
                          className="text-xs text-rose-550 dark:text-rose-450 hover:underline font-semibold"
                        >
                          Hapus Semua
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-450 dark:text-slate-550">
                          Tidak ada notifikasi baru
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => { markNotifRead(notif.id); }}
                            className={`p-3 text-xs border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-750 ${!notif.is_read ? 'bg-brand-50/30 dark:bg-brand-950/10 font-medium' : 'opacity-70'}`}
                          >
                            <p className="dark:text-white">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.triggered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
                      <button
                        onClick={() => { setActiveTab('notifications'); setNotifDropdownOpen(false); }}
                        className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        Lihat Halaman Notifikasi
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 3. MAIN PAGE VIEWPORT */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* 4. BOTTOM NAVIGATION BAR (MOBILE ONLY - Material Design 3 Style) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 px-2 flex justify-around items-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="select-none flex flex-col items-center justify-center w-16"
              >
                <div className={`
                  px-5 py-1 rounded-full mb-1 transition-all duration-150 flex items-center justify-center
                  ${isActive
                    ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-650 dark:text-brand-350'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'
                  }
                `}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <span className={`
                  text-[10px] tracking-wide select-none transition-colors duration-150
                  ${isActive ? 'text-brand-600 dark:text-brand-350 font-bold' : 'text-slate-500 dark:text-slate-400'}
                `}>
                  {item.id === 'baby' ? 'Bayi' : item.id === 'input' ? 'Catat' : item.id === 'history' ? 'Riwayat' : item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
          {/* Settings button on mobile */}
          <button
            onClick={() => setActiveTab('settings')}
            className="select-none flex flex-col items-center justify-center w-16"
          >
            <div className={`
              px-5 py-1 rounded-full mb-1 transition-all duration-150 flex items-center justify-center
              ${activeTab === 'settings'
                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-650 dark:text-brand-350'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'
              }
            `}>
              <Settings className="w-5.5 h-5.5" />
            </div>
            <span className={`
              text-[10px] tracking-wide select-none transition-colors duration-150
              ${activeTab === 'settings' ? 'text-brand-600 dark:text-brand-350 font-bold' : 'text-slate-500 dark:text-slate-400'}
            `}>
              Pengaturan
            </span>
          </button>
        </nav>

      </div>
    </div>
  );
}

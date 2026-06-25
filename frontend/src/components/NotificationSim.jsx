import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Clock, ToggleLeft, ToggleRight, AlertTriangle, ShieldCheck, Flame, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationSim() {
  const {
    settings,
    saveSettings,
    notifications,
    markNotifRead,
    clearAllNotifs,
    refreshData
  } = useApp();

  const [loading, setLoading] = useState(false);

  const handleToggleActive = () => {
    saveSettings({
      ...settings,
      notifications_enabled: settings.notifications_enabled ? 0 : 1
    });
  };

  const handleIntervalChange = (val) => {
    saveSettings({
      ...settings,
      notification_interval: parseInt(val)
    });
  };

  const handleTimeChange = (val) => {
    saveSettings({
      ...settings,
      notification_time: val
    });
  };

  // Simulation Triggers
  const simulateNotification = async (type) => {
    setLoading(true);
    let message = '';
    
    if (type === 'pumping') {
      message = `[SIMULASI] Waktunya pumping sesi berikutnya! (Interval Anda: ${settings.notification_interval} menit).`;
    } else if (type === 'logging') {
      message = '[SIMULASI] Ibu belum mencatat data ASIP hari ini. Yuk catat sekarang agar grafik terus terpantau!';
    } else {
      message = `[SIMULASI] Selamat! Target harian Anda sebesar ${settings.daily_target || 1000} ml tercapai hari ini. Produksi ASI melimpah!`;
    }

    try {
      await api.createNotification(type, message);
      await refreshData(); // trigger refresh of stats and notifications list
      
      // Native notification popup
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('ASIP Monitor - Simulasi', {
          body: message,
          icon: '/logo.png'
        });
      }
    } catch (err) {
      console.error('Error simulating notification:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Settings and Simulators Panel (Left 1/3) */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* Settings Configuration Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" />
            <span>Konfigurasi Alarm</span>
          </h3>
          <p className="text-xs text-slate-400">Pengaturan pengingat otomatis di browser atau perangkat Ibu</p>
          
          <div className="space-y-4 pt-2">
            {/* Status Aktif/Nonaktif */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Status Notifikasi</span>
              <button
                onClick={handleToggleActive}
                className="focus:outline-none transition-transform active:scale-95"
              >
                {settings.notifications_enabled ? (
                  <ToggleRight className="w-12 h-8 text-brand-500 fill-brand-100" />
                ) : (
                  <ToggleLeft className="w-12 h-8 text-slate-300 dark:text-slate-650" />
                )}
              </button>
            </div>

            {/* Interval Notifikasi */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Interval Pengingat (Menit)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  value={settings.notification_interval}
                  disabled={!settings.notifications_enabled}
                  onChange={(e) => handleIntervalChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-400 dark:text-white transition disabled:opacity-50"
                >
                  <option value="60">Setiap 1 Jam (60 menit)</option>
                  <option value="120">Setiap 2 Jam (120 menit)</option>
                  <option value="180">Setiap 3 Jam (180 menit)</option>
                  <option value="240">Setiap 4 Jam (240 menit)</option>
                </select>
              </div>
            </div>

            {/* Jam Mulai Alarm */}
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Mulai Pukul</label>
              <input
                type="time"
                value={settings.notification_time}
                disabled={!settings.notifications_enabled}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-400 dark:text-white transition disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Simulation Controls Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white">Simulasi Trigger</h3>
          <p className="text-xs text-slate-400">Tekan tombol di bawah untuk menyimulasikan alarm/alert instan</p>
          
          <div className="space-y-3 pt-2">
            
            {/* Sim Pumping */}
            <button
              onClick={() => simulateNotification('pumping')}
              disabled={loading}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Clock className="w-4 h-4 text-brand-500" />
              <span>Alarm Jadwal Pumping</span>
            </button>

            {/* Sim Logging */}
            <button
              onClick={() => simulateNotification('logging')}
              disabled={loading}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Alarm Pengingat Catat</span>
            </button>

            {/* Sim Target Met */}
            <button
              onClick={() => simulateNotification('target_met')}
              disabled={loading}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Flame className="w-4 h-4 text-rosebrand-500" />
              <span>Notifikasi Target Tercapai</span>
            </button>

          </div>
        </div>

      </div>

      {/* History Notification Logs (Right 2/3) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Log Riwayat Notifikasi</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar alarm dan pesan sistem yang telah terpicu</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifs}
              className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Log</span>
            </button>
          )}
        </div>

        {/* List of Notification Logs */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-24 text-center text-slate-450 dark:text-slate-550 text-sm">
              Belum ada log notifikasi yang tercatat. Coba simulasikan notifikasi di sebelah kiri!
            </div>
          ) : (
            notifications.map((notif) => {
              const isPumping = notif.type === 'pumping';
              const isLogging = notif.type === 'logging';
              const isTargetMet = notif.type === 'target_met';
              
              return (
                <div
                  key={notif.id}
                  onClick={() => markNotifRead(notif.id)}
                  className={`
                    p-4 rounded-xl border text-xs flex items-start gap-3 transition cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-750/30
                    ${!notif.is_read
                      ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/60 dark:border-slate-750 font-medium'
                      : 'bg-white border-slate-100 dark:bg-slate-800/20 dark:border-slate-700/60 opacity-60'
                    }
                  `}
                >
                  {/* Symbol Indicator */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isPumping
                      ? 'bg-brand-50 text-brand-550 dark:bg-slate-750'
                      : isLogging
                      ? 'bg-amber-50 text-amber-550 dark:bg-slate-750'
                      : 'bg-emerald-50 text-emerald-500 dark:bg-slate-750'
                  }`}>
                    {isPumping ? (
                      <Clock className="w-4 h-4" />
                    ) : isLogging ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-slate-750 dark:text-slate-200 leading-relaxed break-words">{notif.message}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>
                        {new Date(notif.triggered_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {' '}
                        {new Date(notif.triggered_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!notif.is_read && (
                        <span className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">Baru</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

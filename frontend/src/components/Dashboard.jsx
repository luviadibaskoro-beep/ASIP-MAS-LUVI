import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Droplet,
  Calendar,
  Award,
  Zap,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const { stats, setActiveTab, user, isOffline } = useApp();

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-550 dark:text-slate-400 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  const { today, overview, weekly, monthly } = stats;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-md rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-500 dark:text-slate-450 mb-1">{label}</p>
          <p className="text-brand-600 dark:text-brand-350 font-semibold">
            Volume: <span className="text-sm font-bold">{payload[0].value} ml</span>
          </p>
          {payload[0].payload.sessions !== undefined && (
            <p className="text-slate-400 mt-0.5">Sesi: {payload[0].payload.sessions} kali</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Helper to format Date for XAxis (e.g., '2026-06-24' -> '24 Jun')
  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Circular progress math
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (today.percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-500 to-brand-600 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none">
          <Droplet className="w-64 h-64 translate-x-12 translate-y-12 fill-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Halo, {user?.name || 'Ibu Hebat'}! 👋</h1>
          <p className="text-brand-100 text-sm mt-1">
            {today.amount > 0 
              ? `Hari ini Ibu sudah mencatat ${today.amount} ml ASIP. Semangat mengASIhi!` 
              : 'Ayo mulai catat sesi pumping pertama Ibu hari ini!'}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('input')}
          className="relative z-10 shrink-0 flex items-center justify-center gap-2 bg-white text-brand-600 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 active:scale-95 shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          <span>Catat ASIP</span>
        </button>
      </div>

      {/* KPI Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today Volume */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Hari Ini</span>
            <h3 className="text-3xl font-extrabold text-brand-600 dark:text-brand-350">{today.amount} <span className="text-base font-medium text-slate-500">ml</span></h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Total produksi hari ini</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-slate-700/50 flex items-center justify-center text-brand-500">
            <Droplet className="w-6.5 h-6.5 fill-brand-200" />
          </div>
        </div>

        {/* Card 2: Today Sessions */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Sesi Pumping</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{today.sessions} <span className="text-base font-medium text-slate-500">kali</span></h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Total pumping hari ini</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-700/50 flex items-center justify-center text-indigo-500">
            <Calendar className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* Card 3: Target Harian */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Target Harian</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.dailyTarget} <span className="text-base font-medium text-slate-500">ml</span></h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Bisa diatur di pengaturan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-slate-700/50 flex items-center justify-center text-amber-500">
            <Award className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* Card 4: Persentase Target */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Pencapaian</span>
            <h3 className="text-3xl font-extrabold text-emerald-500">{today.percentage}%</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {today.percentage >= 100 ? '🎉 Target tercapai!' : `${stats.dailyTarget - today.amount} ml lagi`}
            </p>
          </div>
          {/* Circular progress bar */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-700 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-emerald-500 fill-none transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-350">
              {today.percentage}%
            </div>
          </div>
        </div>

      </div>

      {/* Rata-rata & Ringkasan Stats */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Statistik Rata-rata & Ringkasan Bulan Berjalan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
          
          <div className="pt-2 md:pt-0 md:px-4 text-center">
            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Rata-rata Produksi Harian</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{overview.averageDaily} ml</p>
          </div>

          <div className="pt-2 md:pt-0 md:px-4 text-center">
            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Total Akumulasi</p>
            <p className="text-2xl font-extrabold text-brand-650 dark:text-brand-350 mt-1">{overview.totalAmount} ml</p>
          </div>

          <div className="pt-2 md:pt-0 md:px-4 text-center">
            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Sesi Terbanyak (Sekali Pumping)</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{overview.maxAmount} ml</p>
          </div>

          <div className="pt-2 md:pt-0 md:px-4 text-center">
            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium font-semibold text-rose-500">Hari Aktif Mencatat</p>
            <p className="text-2xl font-extrabold text-rosebrand-500 mt-1">{overview.totalActiveDays} hari</p>
          </div>

        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart Card (2/3 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Grafik Produksi Mingguan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Perkembangan total volume ASIP 7 hari terakhir</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-750">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              <span>Target: {stats.dailyTarget} ml</span>
            </div>
          </div>

          <div className="h-64 w-full">
            {weekly.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-450">Belum ada data mingguan</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }} />
                  <Bar
                    dataKey="amount"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Chart Card (1/3 width on desktop) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Trend Produksi Bulanan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Statistik volume ASIP 30 hari terakhir</p>
          </div>

          <div className="h-64 w-full">
            {monthly.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-450">Belum ada data bulanan</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 8 }}
                    stroke="#94A3B8"
                    interval={Math.round(monthly.length / 5)}
                  />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Quick Navigation Help */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('history')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-650 hover:bg-slate-50/50 dark:hover:bg-slate-750 rounded-xl text-left flex items-center justify-between group transition"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-750 dark:text-white">Kelola Riwayat ASIP</h4>
            <p className="text-xxs text-slate-400 mt-0.5">Cari, edit, hapus, dan ekspor data</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-650 hover:bg-slate-50/50 dark:hover:bg-slate-750 rounded-xl text-left flex items-center justify-between group transition"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-750 dark:text-white">Analisis Grafik Detail</h4>
            <p className="text-xxs text-slate-400 mt-0.5">Lihat rasio payudara dan tren detail</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-650 hover:bg-slate-50/50 dark:hover:bg-slate-750 rounded-xl text-left flex items-center justify-between group transition"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-750 dark:text-white">Sesuaikan Target & Backup</h4>
            <p className="text-xxs text-slate-400 mt-0.5">Ubah nama, target, dan ekspor database JSON</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition" />
        </button>
      </div>

    </div>
  );
}

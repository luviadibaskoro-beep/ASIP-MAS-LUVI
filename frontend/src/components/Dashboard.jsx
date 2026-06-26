import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Droplet,
  Calendar,
  Award,
  Zap,
  ChevronRight,
  Plus,
  Activity,
  Heart,
  BarChart3,
  ListFilter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const { stats, setActiveTab, user } = useApp();
  const [chartType, setChartType] = useState('bar'); // bar, area, line

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-550 dark:text-slate-400 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  const { today, overview, weekly } = stats;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3.5 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs animate-in fade-in slide-in-from-bottom-1 duration-150">
          <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-brand-600 dark:text-brand-350 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
            Volume: <span className="text-sm font-black">{payload[0].value} ml</span>
          </p>
          {payload[0].payload.sessions !== undefined && (
            <p className="text-slate-450 dark:text-slate-500 mt-1 pl-3.5 text-[10px]">Sesi Pumping: {payload[0].payload.sessions} kali</p>
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
  const strokeDashoffset = circumference - (Math.min(today.percentage, 100) / 100) * circumference;

  // Greeting based on time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 11) return 'Selamat Pagi';
    if (hours < 15) return 'Selamat Siang';
    if (hours < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      
      {/* Sleek Minimalist Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-bold text-brand-500 dark:text-brand-400 tracking-wider uppercase">{getGreeting()}</span>
          <h1 className="text-2xl font-black text-slate-850 dark:text-white mt-0.5">Bunda {user?.name || 'Ibu Hebat'}</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
            {today.amount > 0 
              ? `Hari ini telah mencatat ${today.amount} ml ASIP (${today.percentage}% target harian).` 
              : 'Belum ada catatan ASIP hari ini. Mulai sekarang untuk menjaga produksi!'}
          </p>
        </div>
        <button
          onClick={() => setActiveTab('input')}
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Catat ASIP</span>
        </button>
      </div>

      {/* Modern Merged Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Today's Achievement (Radial Ring) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-4 pr-4">
            <div>
              <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Pencapaian Hari Ini</p>
              <h3 className="text-3xl font-black text-brand-600 dark:text-brand-350 mt-1">
                {today.amount} <span className="text-sm font-medium text-slate-400">ml</span>
              </h3>
            </div>
            
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-slate-405 dark:text-slate-500">Frekuensi</p>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-300 mt-0.5">{today.sessions} Pumping</p>
              </div>
              <div className="border-l border-slate-100 dark:border-slate-700 pl-4">
                <p className="text-[10px] text-slate-405 dark:text-slate-500">Sisa Target</p>
                <p className="text-xs font-bold text-slate-750 dark:text-slate-300 mt-0.5">
                  {today.amount >= stats.dailyTarget ? 'Tercapai! 🎉' : `${stats.dailyTarget - today.amount} ml`}
                </p>
              </div>
            </div>
          </div>

          {/* Radial progress ring */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-slate-55/50 dark:bg-slate-900/30 rounded-2xl p-2 border border-slate-100/50 dark:border-slate-700/30">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-700 fill-none"
                strokeWidth="5"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-brand-500 fill-none transition-all duration-550"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
              <span className="text-sm font-black text-slate-800 dark:text-white leading-none">{today.percentage}%</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Target</span>
            </div>
          </div>
        </div>

        {/* Card 2 & 3: Monthly Overview Metrics (2/3 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider mb-4">Rangkuman Tren & Rata-rata Bulan Ini</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl border border-slate-100/40 dark:border-slate-700/20">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-750 flex items-center justify-center text-brand-500 mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Rerata Harian</p>
              <p className="text-lg font-black text-slate-850 dark:text-white mt-0.5">{overview.averageDaily} <span className="text-xs font-normal text-slate-400">ml</span></p>
            </div>

            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl border border-slate-100/40 dark:border-slate-700/20">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-slate-750 flex items-center justify-center text-teal-500 mb-2">
                <Droplet className="w-4 h-4 fill-teal-100 dark:fill-none" />
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Total Akumulasi</p>
              <p className="text-lg font-black text-slate-850 dark:text-white mt-0.5">{overview.totalAmount >= 1000 ? `${(overview.totalAmount / 1000).toFixed(1)} L` : `${overview.totalAmount} ml`}</p>
            </div>

            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl border border-slate-100/40 dark:border-slate-700/20">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-slate-750 flex items-center justify-center text-amber-500 mb-2">
                <Award className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Sesi Terbanyak</p>
              <p className="text-lg font-black text-slate-850 dark:text-white mt-0.5">{overview.maxAmount} <span className="text-xs font-normal text-slate-400">ml</span></p>
            </div>

            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl border border-slate-100/40 dark:border-slate-700/20">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-slate-750 flex items-center justify-center text-rose-500 mb-2">
                <Heart className="w-4 h-4 fill-rose-100 dark:fill-none" />
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">Hari Aktif</p>
              <p className="text-lg font-black text-slate-850 dark:text-white mt-0.5">{overview.totalActiveDays} <span className="text-xs font-normal text-slate-400">hari</span></p>
            </div>

          </div>
        </div>

      </div>

      {/* Minimalist Interactive Chart Panel */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-850 dark:text-white text-sm">Tren Produksi Mingguan</h3>
            <p className="text-xxs text-slate-400 mt-0.5">Volume ASIP harian dalam 7 hari terakhir</p>
          </div>
          
          {/* Minimalist Switcher */}
          <div className="inline-flex bg-slate-55 dark:bg-slate-900/80 p-0.5 rounded-lg border border-slate-205 dark:border-slate-750 self-start sm:self-center">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${chartType === 'bar' ? 'bg-white dark:bg-slate-850 shadow-xs text-brand-650 dark:text-brand-350' : 'text-slate-450 dark:text-slate-500 hover:text-slate-650'}`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${chartType === 'area' ? 'bg-white dark:bg-slate-850 shadow-xs text-brand-650 dark:text-brand-350' : 'text-slate-450 dark:text-slate-500 hover:text-slate-650'}`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${chartType === 'line' ? 'bg-white dark:bg-slate-850 shadow-xs text-brand-650 dark:text-brand-350' : 'text-slate-450 dark:text-slate-500 hover:text-slate-650'}`}
            >
              Line
            </button>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          {weekly.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-450">Belum ada data mingguan</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={weekly} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/50" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 9, fontWeight: 500 }}
                    stroke="#94A3B8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(188, 90, 88, 0.04)' }} />
                  <Bar
                    dataKey="amount"
                    fill="#bc5a58"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              ) : chartType === 'area' ? (
                <AreaChart data={weekly} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bc5a58" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#bc5a58" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/50" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 9, fontWeight: 500 }}
                    stroke="#94A3B8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#bc5a58"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashboardAreaGrad)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={weekly} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/50" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 9, fontWeight: 500 }}
                    stroke="#94A3B8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#378685"
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 1.5, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sleek Minimalist Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('input')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-750/30 rounded-2xl flex flex-col justify-between h-24 text-left group transition duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 dark:text-slate-550 group-hover:bg-brand-50 group-hover:text-brand-500 transition duration-200">
            <Plus className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Catat ASIP</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Pumping & Menyusui</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('baby')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-750/30 rounded-2xl flex flex-col justify-between h-24 text-left group transition duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 dark:text-slate-550 group-hover:bg-teal-50 group-hover:text-teal-500 transition duration-200">
            <Heart className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Keseharian Bayi</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">BAB, BAK & Jadwal</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-750/30 rounded-2xl flex flex-col justify-between h-24 text-left group transition duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 dark:text-slate-550 group-hover:bg-amber-50 group-hover:text-amber-500 transition duration-200">
            <ListFilter className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Riwayat Catatan</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Lihat & Koreksi Data</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-750/30 rounded-2xl flex flex-col justify-between h-24 text-left group transition duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 dark:text-slate-550 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition duration-200">
            <BarChart3 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Statistik Detail</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Analisis Lengkap & JPEG</p>
          </div>
        </button>
      </div>

    </div>
  );
}

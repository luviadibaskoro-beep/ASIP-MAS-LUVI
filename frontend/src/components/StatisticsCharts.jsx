import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Droplet, ArrowUp, ArrowDown, Award, Camera } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export default function StatisticsCharts() {
  const { stats, user } = useApp();
  const [chartPeriod, setChartPeriod] = useState('weekly'); // weekly, monthly, daily

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-550 dark:text-slate-400 font-medium">Memuat data statistik...</p>
      </div>
    );
  }

  const { overview, breastSides, weekly, monthly } = stats;

  // Pie chart colors
  const PIE_COLORS = {
    left: '#f472b6',   // Pink for left side
    right: '#38bdf8',  // Blue for right side
    both: '#34d399'    // Emerald for both sides
  };

  // Convert breastSides array to a format that PieChart expects
  const pieData = breastSides.map(item => {
    let name = 'Keduanya';
    if (item.breast_side === 'left') name = 'Kiri';
    else if (item.breast_side === 'right') name = 'Kanan';
    
    return {
      name,
      value: Math.round(item.amount),
      count: item.count,
      side: item.breast_side
    };
  });

  const getActiveChartData = () => {
    if (chartPeriod === 'weekly') return weekly;
    if (chartPeriod === 'monthly') return monthly;
    
    // For 'daily', we will map the last 15 entries to show a detailed line chart
    return monthly.slice(-15);
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-md rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-brand-600 dark:text-brand-350 font-bold">
            Volume: <span className="text-sm">{payload[0].value} ml</span>
          </p>
          {payload[0].payload.sessions && (
            <p className="text-slate-400 text-xxs mt-0.5">Jumlah Sesi: {payload[0].payload.sessions} kali</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-md rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-700 dark:text-white">{payload[0].name}</p>
          <p className="text-brand-600 dark:text-brand-350 font-bold mt-1">
            Total: {payload[0].value} ml
          </p>
          <p className="text-slate-450 dark:text-slate-500 text-xxs mt-0.5">
            Sesi: {payload[0].payload.count} kali ({Math.round(payload[0].percent * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const handleExportImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 700);
    bgGradient.addColorStop(0, '#f0f9ff'); // sky-50
    bgGradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1000, 700);

    // Draw branding bar
    ctx.fillStyle = '#0284c7'; // brand-600
    ctx.fillRect(0, 0, 1000, 15);

    // Draw Header
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    ctx.fillText('ASIP Monitor - Statistik Produksi', 50, 60);

    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '14px Inter, Arial, sans-serif';
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    ctx.fillText(`Nama Ibu: ${user?.name || 'Ibu Hebat'}  |  Dicetak pada: ${dateStr}`, 50, 90);

    // Draw Divider Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 110);
    ctx.lineTo(950, 110);
    ctx.stroke();

    // Helper to draw rounded rectangle
    const drawRoundRect = (x, y, w, h, r, fillColor, strokeColor = null) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Draw 4 Overview Cards
    const cardData = [
      { label: 'TOTAL PRODUKSI', value: `${overview.totalAmount} ml`, sub: `${overview.totalSessions} Sesi Pumping`, color: '#e0f2fe' },
      { label: 'RERATA HARIAN', value: `${overview.averageDaily} ml`, sub: 'Konsistensi Produksi', color: '#fef3c7' },
      { label: 'REKOR TERTINGGI', value: `${overview.maxAmount} ml`, sub: 'Sesi Tunggal Terbanyak', color: '#d1fae5' },
      { label: 'MINIMUM SESI', value: `${overview.minAmount} ml`, sub: 'Sesi Tunggal Terendah', color: '#ffe4e6' }
    ];

    const cardW = 200;
    const cardH = 100;
    const gap = 30;
    const startX = 50;
    const startY = 140;

    cardData.forEach((card, idx) => {
      const x = startX + idx * (cardW + gap);
      // Draw card background
      drawRoundRect(x, startY, cardW, cardH, 12, '#ffffff', '#e2e8f0');

      // Top colored accent line
      drawRoundRect(x, startY, cardW, 6, 3, card.color);

      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px Inter, Arial, sans-serif';
      ctx.fillText(card.label, x + 15, startY + 28);

      // Value
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px Inter, Arial, sans-serif';
      ctx.fillText(card.value, x + 15, startY + 58);

      // Sub
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, Arial, sans-serif';
      ctx.fillText(card.sub, x + 15, startY + 82);
    });

    // Draw Left Container (Weekly Chart)
    const chartX = 50;
    const chartY = 270;
    const chartW = 550;
    const chartH = 340;
    drawRoundRect(chartX, chartY, chartW, chartH, 16, '#ffffff', '#e2e8f0');

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.fillText('Grafik Produksi Mingguan', chartX + 20, chartY + 30);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.fillText('Jumlah produksi harian dalam 7 hari terakhir', chartX + 20, chartY + 50);

    // Draw simple grid and bars for weekly
    const graphX = chartX + 45;
    const graphY = chartY + 80;
    const graphW = chartW - 70;
    const graphH = chartH - 120;

    // Draw grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let r = 0; r <= 4; r++) {
      const gy = graphY + r * (graphH / 4);
      ctx.beginPath();
      ctx.moveTo(graphX, gy);
      ctx.lineTo(graphX + graphW, gy);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter, Arial, sans-serif';
      const maxVal = Math.max(...weekly.map(w => w.amount), 1000);
      const val = Math.round(maxVal - r * (maxVal / 4));
      ctx.fillText(`${val} ml`, graphX - 40, gy + 3);
    }

    // Draw bars
    if (weekly && weekly.length > 0) {
      const maxVal = Math.max(...weekly.map(w => w.amount), 1000);
      const barW = Math.min(30, (graphW / weekly.length) - 15);
      const colW = graphW / weekly.length;

      weekly.forEach((day, idx) => {
        const bx = graphX + idx * colW + (colW - barW) / 2;
        const pct = day.amount / maxVal;
        const bh = graphH * pct;
        const by = graphY + graphH - bh;

        // Draw bar
        drawRoundRect(bx, by, barW, bh, 4, '#38bdf8');

        // Draw day label
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter, Arial, sans-serif';
        const dLabel = new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        ctx.fillText(dLabel, bx + (barW - ctx.measureText(dLabel).width) / 2, graphY + graphH + 18);

        // Draw value above bar
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 9px Inter, Arial, sans-serif';
        ctx.fillText(`${day.amount}`, bx + (barW - ctx.measureText(`${day.amount}`).width) / 2, by - 6);
      });
    }

    // Draw Right Container (Pie Chart / Breast Side Ratio)
    const pieContainerX = 630;
    const pieContainerY = 270;
    const pieContainerW = 320;
    const pieContainerH = 340;
    drawRoundRect(pieContainerX, pieContainerY, pieContainerW, pieContainerH, 16, '#ffffff', '#e2e8f0');

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.fillText('Rasio Sesi Pumping', pieContainerX + 20, pieContainerY + 30);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.fillText('Distribusi volume berdasarkan sisi payudara', pieContainerX + 20, pieContainerY + 50);

    // Draw Donut Pie Chart on Canvas
    const centerX = pieContainerX + 160;
    const centerY = pieContainerY + 140;
    const outerRadius = 60;
    const innerRadius = 40;

    let totalVal = pieData.reduce((sum, item) => sum + item.value, 0);
    if (totalVal === 0) totalVal = 1;

    let startAngle = -Math.PI / 2;
    pieData.forEach((item) => {
      const sliceAngle = (item.value / totalVal) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = PIE_COLORS[item.side] || '#cccccc';
      ctx.fill();

      startAngle = endAngle;
    });

    // Draw center hole text (Total)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total ASIP', centerX, centerY - 5);
    ctx.font = 'bold 15px Inter, Arial, sans-serif';
    ctx.fillText(`${overview.totalAmount} ml`, centerX, centerY + 12);
    ctx.textAlign = 'left'; // reset text align

    // Draw Legends
    const legendStartY = pieContainerY + 230;
    pieData.forEach((item, idx) => {
      const ly = legendStartY + idx * 25;
      
      // Color box
      ctx.fillStyle = PIE_COLORS[item.side] || '#cccccc';
      drawRoundRect(pieContainerX + 30, ly, 12, 12, 3, ctx.fillStyle);

      // Name
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px Inter, Arial, sans-serif';
      ctx.fillText(item.name, pieContainerX + 52, ly + 10);

      // Val and percent
      const pctStr = `${Math.round((item.value / totalVal) * 100)}%`;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px Inter, Arial, sans-serif';
      const detailStr = `${item.value} ml (${item.count} Sesi) - ${pctStr}`;
      ctx.fillText(detailStr, pieContainerX + 120, ly + 10);
    });

    // Draw Footer branding
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.fillText('ASIP Monitor - Sistem Pemantauan Air Susu Ibu Perah (Prototype)', 50, 660);
    
    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 11px Inter, Arial, sans-serif';
    ctx.fillText('asipmonitor.com', 950 - ctx.measureText('asipmonitor.com').width, 660);

    // Save as image download
    try {
      const imgURL = canvas.toDataURL('image/jpeg', 0.95);
      const downloadLink = document.createElement('a');
      downloadLink.href = imgURL;
      downloadLink.download = `ASIP_Monitor_Statistik_${new Date().toISOString().split('T')[0]}.jpeg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('Error exporting canvas:', e);
      alert('Gagal mengekspor gambar statistik. Coba beberapa saat lagi.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Statistik Produksi ASIP</h2>
          <p className="text-xs text-slate-450 dark:text-slate-500">Analisis menyeluruh tentang volume, frekuensi, dan konsistensi pumping</p>
        </div>
        <button
          onClick={handleExportImage}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl active:scale-95 shadow-sm hover:shadow transition self-start sm:self-center"
        >
          <Camera className="w-4 h-4" />
          <span>Simpan Gambar (.jpeg)</span>
        </button>
      </div>

      {/* 4 Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Produksi */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-brand-50 dark:bg-slate-700/50 flex items-center justify-center text-brand-500">
            <Droplet className="w-6 h-6 fill-brand-200" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Total Produksi</p>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{overview.totalAmount} ml</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Dari {overview.totalSessions} sesi pumping</p>
          </div>
        </div>

        {/* Produksi Tertinggi */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 dark:bg-slate-700/50 flex items-center justify-center text-emerald-500">
            <ArrowUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Pumping Tertinggi</p>
            <h4 className="text-xl font-extrabold text-emerald-500 mt-0.5">{overview.maxAmount} ml</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Rekor volume sesi tunggal</p>
          </div>
        </div>

        {/* Produksi Terendah */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-rose-50 dark:bg-slate-700/50 flex items-center justify-center text-rose-500">
            <ArrowDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Pumping Terendah</p>
            <h4 className="text-xl font-extrabold text-rose-550 dark:text-rose-400 mt-0.5">{overview.minAmount} ml</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Minimum volume sesi tunggal</p>
          </div>
        </div>

        {/* Rata-rata Produksi Harian */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-50 dark:bg-slate-700/50 flex items-center justify-center text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Rerata Produksi Harian</p>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{overview.averageDaily} ml</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Konsistensi produksi harian</p>
          </div>
        </div>

      </div>

      {/* Main Charts & Side Ratio Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Dynamic Production Trend (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-500" />
                <span>Analisis Grafik Produksi</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Lihat trend berdasarkan skala waktu harian, mingguan, atau bulanan</p>
            </div>
            
            {/* Period Toggles */}
            <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-750 self-start">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${chartPeriod === 'daily' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-350 shadow-xs' : 'text-slate-500'}`}
              >
                Harian
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${chartPeriod === 'weekly' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-350 shadow-xs' : 'text-slate-500'}`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${chartPeriod === 'monthly' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-350 shadow-xs' : 'text-slate-500'}`}
              >
                Bulanan
              </button>
            </div>
          </div>

          {/* Graph Render */}
          <div className="h-72 w-full">
            {chartPeriod === 'weekly' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : chartPeriod === 'monthly' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStatsAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 8 }} stroke="#94A3B8" interval={Math.round(monthly.length / 6)} />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorStatsAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              // Daily Line Chart (last 15 days detailed sessions)
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getActiveChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side: Breast Side Ratio Pie Chart (1/3 width) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Rasio Sesi Pumping</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribusi total volume berdasarkan sisi payudara yang dipompa</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada data untuk dianalisis</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.side] || '#cccccc'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legends & Stats */}
          <div className="space-y-2 border-t border-slate-50 dark:border-slate-700 pt-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[item.side] }}></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">{item.value} ml <span className="font-normal text-slate-400">({item.count} Sesi)</span></span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

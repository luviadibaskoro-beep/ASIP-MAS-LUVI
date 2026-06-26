import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Baby,
  Activity,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  Minus,
  RotateCcw,
  Search,
  Calendar,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function BabyRoutine() {
  const {
    babyRecords,
    babyStats,
    addBabyRecord,
    editBabyRecord,
    removeBabyRecord
  } = useApp();

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [babCount, setBabCount] = useState(0);
  const [bakCount, setBakCount] = useState(1);
  const [notes, setNotes] = useState('');
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Filter States
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editBab, setEditBab] = useState(0);
  const [editBak, setEditBak] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    resetFormValues();
  }, []);

  useEffect(() => {
    let result = [...babyRecords];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => (r.notes || '').toLowerCase().includes(q));
    }

    if (dateFilter) {
      result = result.filter(r => r.date === dateFilter);
    } else if (monthFilter) {
      result = result.filter(r => r.date.startsWith(monthFilter));
    }

    setFilteredRecords(result);
  }, [babyRecords, search, dateFilter, monthFilter]);

  const resetFormValues = () => {
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
    setTime(today.toTimeString().split(' ')[0].substring(0, 5));
    setBabCount(0);
    setBakCount(1);
    setNotes('');
  };

  const showFeedback = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (babCount === 0 && bakCount === 0 && !notes.trim()) {
      alert('Silakan isi jumlah BAB, BAK, atau tambahkan catatan.');
      setLoading(false);
      return;
    }

    const success = await addBabyRecord({
      date,
      time,
      bab_count: babCount,
      bak_count: bakCount,
      notes
    });

    if (success) {
      showFeedback('Aktivitas keseharian bayi berhasil disimpan!');
      resetFormValues();
    } else {
      showFeedback('Gagal menyimpan data ASIP.', 'error');
    }
    setLoading(false);
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditDate(record.date);
    setEditTime(record.time);
    setEditBab(record.bab_count);
    setEditBak(record.bak_count);
    setEditNotes(record.notes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const success = await editBabyRecord(editingRecord.id, {
      date: editDate,
      time: editTime,
      bab_count: editBab,
      bak_count: editBak,
      notes: editNotes
    });

    if (success) {
      showFeedback('Data keseharian bayi berhasil diperbarui!');
      setEditingRecord(null);
    } else {
      showFeedback('Gagal memperbarui data.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data aktivitas bayi ini?')) {
      const success = await removeBabyRecord(id);
      if (success) {
        showFeedback('Data aktivitas bayi berhasil dihapus!');
      } else {
        showFeedback('Gagal menghapus data.', 'error');
      }
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('');
    setMonthFilter('');
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

  // Recharts Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 shadow-md rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">{formatDateLabel(label)}</p>
          <p className="text-rosebrand-500 font-bold">
            Buang Air Besar (BAB): <span className="text-sm">{payload[0].value} kali</span>
          </p>
          <p className="text-emerald-500 font-bold mt-0.5">
            Buang Air Kecil (BAK): <span className="text-sm">{payload[1].value} kali</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Feedback */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${toastType === 'success' ? 'bg-emerald-500 text-white border-emerald-400/30' : 'bg-rose-500 text-white border-rose-450/30'}`}>
          {toastType === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
          <div>
            <p className="font-bold text-sm">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rosebrand-400 to-rosebrand-500 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none">
          <Baby className="w-64 h-64 translate-x-12 translate-y-12 fill-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Keseharian & Pencernaan Bayi 👶</h1>
          <p className="text-rose-100 text-sm mt-1">
            Pantau kesehatan pencernaan si kecil dengan mencatat frekuensi buang air (BAB / BAK) secara teratur.
          </p>
        </div>
      </div>

      {/* KPI Cards (BAB / BAK Today) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* BAB Today */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">BAB Hari Ini</span>
            <h3 className="text-3xl font-extrabold text-rosebrand-500">
              {babyStats ? babyStats.today.bab : 0} <span className="text-base font-medium text-slate-500">kali</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Rerata: {babyStats ? babyStats.overview.avgDailyBab : 0} kali/hari
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-slate-700/50 flex items-center justify-center text-rose-500">
            <Baby className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* BAK Today */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">BAK Hari Ini</span>
            <h3 className="text-3xl font-extrabold text-emerald-500">
              {babyStats ? babyStats.today.bak : 0} <span className="text-base font-medium text-slate-500">kali</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Rerata: {babyStats ? babyStats.overview.avgDailyBak : 0} kali/hari
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-slate-700/50 flex items-center justify-center text-emerald-500">
            <Activity className="w-6.5 h-6.5" />
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between col-span-1 sm:col-span-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Total Catatan</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {babyRecords.length} <span className="text-base font-medium text-slate-500">log</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Tercatat dalam {babyStats ? babyStats.overview.totalDays : 0} hari aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-550">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Form Input & Weekly Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Card (1/3 width) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden h-fit">
          <div className="bg-rosebrand-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-750 px-5 py-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Catat Aktivitas Buang Air</h3>
          </div>
          <form onSubmit={handleSave} className="p-5 space-y-4">
            
            {/* DateTime */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rosebrand-400 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase">Jam</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rosebrand-400 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* BAB Count Input */}
            <div className="bg-rose-50/20 dark:bg-slate-900/40 p-3 rounded-xl border border-rose-100/30 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rosebrand-600 dark:text-rose-450 block">Buang Air Besar (BAB)</span>
                <span className="text-[10px] text-slate-400">Frekuensi sesi ini</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBabCount(prev => Math.max(0, prev - 1))}
                  className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-extrabold text-sm dark:text-white">{babCount}</span>
                <button
                  type="button"
                  onClick={() => setBabCount(prev => prev + 1)}
                  className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BAK Count Input */}
            <div className="bg-emerald-50/10 dark:bg-slate-900/40 p-3 rounded-xl border border-emerald-100/20 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 block">Buang Air Kecil (BAK)</span>
                <span className="text-[10px] text-slate-400">Frekuensi sesi ini</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBakCount(prev => Math.max(0, prev - 1))}
                  className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-extrabold text-sm dark:text-white">{bakCount}</span>
                <button
                  type="button"
                  onClick={() => setBakCount(prev => prev + 1)}
                  className="w-7 h-7 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-550 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xxs font-bold text-slate-400 uppercase">Catatan Diaper / Kondisi (Opsional)</label>
              <textarea
                placeholder="Misal: Feses lembek kekuningan, urine jernih, ganti diaper baru..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 dark:text-white text-xs resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={resetFormValues}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-2 bg-gradient-to-r from-rosebrand-500 to-rosebrand-600 hover:from-rosebrand-600 hover:to-rosebrand-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm active:scale-[0.98] transition disabled:opacity-50"
              >
                <Baby className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Data'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Weekly Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Trend Mingguan Buang Air Bayi</h3>
            <p className="text-xs text-slate-400 mt-0.5">Analisis perbandingan frekuensi BAB vs BAK selama 7 hari terakhir</p>
          </div>

          <div className="h-64 w-full mt-4">
            {!babyStats || babyStats.weekly.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-450">Belum ada data grafik mingguan</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={babyStats.weekly} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  <Bar name="BAB (kali)" dataKey="bab" fill="#f472b6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar name="BAK (kali)" dataKey="bak" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* History table and filter box */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        
        {/* Filters bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-55/35 dark:bg-slate-900/10">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white shrink-0 self-start sm:self-center">Riwayat Aktivitas</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1 w-full">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari catatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 text-xs dark:text-white transition"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                disabled={!!monthFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-9 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 text-xs dark:text-white transition disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="month"
                value={monthFilter}
                disabled={!!dateFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full pl-9 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 text-xs dark:text-white transition disabled:opacity-50"
              />
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-750 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Reset
          </button>
        </div>

        {/* Table data */}
        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-450 dark:text-slate-550">
              Tidak ada riwayat aktivitas bayi ditemukan.
            </div>
          ) : (
            <>
              {/* Desktop View: Wide Spreadsheet Table */}
              <table className="hidden lg:table w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Jam</th>
                    <th className="px-6 py-3">Buang Air Besar (BAB)</th>
                    <th className="px-6 py-3">Buang Air Kecil (BAK)</th>
                    <th className="px-6 py-3">Catatan Diaper</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition">
                      <td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200">{item.date}</td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{item.time}</td>
                      <td className="px-6 py-3 font-bold text-rosebrand-500">
                        {item.bab_count > 0 ? `💩 ${item.bab_count} kali` : 'Tidak (0)'}
                      </td>
                      <td className="px-6 py-3 font-bold text-emerald-500">
                        {item.bak_count > 0 ? `💧 ${item.bak_count} kali` : 'Tidak (0)'}
                      </td>
                      <td className="px-6 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={item.notes}>
                        {item.notes || '-'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title="Ubah Log"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-slate-400 hover:text-rose-600 transition"
                            title="Hapus Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile/Android View: Touch-Friendly Card List */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((item) => (
                  <div key={item.id} className="p-5 space-y-3 hover:bg-slate-50/30 dark:hover:bg-slate-750/10 transition">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.date} &nbsp;•&nbsp; {item.time}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-750 rounded-xl text-slate-500 hover:text-slate-750 dark:hover:text-slate-200 transition border border-slate-200 dark:border-slate-700"
                          title="Ubah Log"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-10 h-10 flex items-center justify-center bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/15 dark:hover:bg-rose-950/30 rounded-xl text-slate-500 hover:text-rosebrand-600 transition border border-rose-100 dark:border-rose-900/40"
                          title="Hapus Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        item.bab_count > 0 
                          ? 'bg-rose-50 text-rosebrand-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40' 
                          : 'bg-slate-50 text-slate-450 dark:bg-slate-900/40 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                      }`}>
                        <span>💩</span>
                        <span>BAB: {item.bab_count} kali</span>
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        item.bak_count > 0 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40' 
                          : 'bg-slate-50 text-slate-450 dark:bg-slate-900/40 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                      }`}>
                        <span>💧</span>
                        <span>BAK: {item.bak_count} kali</span>
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-750/35 break-words">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* EDIT MODAL DIALOG */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-rosebrand-500 to-rosebrand-600 text-white">
              <h3 className="font-bold text-sm">Ubah Log Keseharian</h3>
              <button onClick={() => setEditingRecord(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 dark:text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase">Jam</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Edit BAB */}
              <div className="bg-rose-50/10 dark:bg-slate-900/40 p-2.5 rounded-xl border border-rose-100/20 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-rosebrand-600 dark:text-rose-455">Buang Air Besar (BAB)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBab(prev => Math.max(0, prev - 1))}
                    className="w-6.5 h-6.5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs dark:text-white">{editBab}</span>
                  <button
                    type="button"
                    onClick={() => setEditBab(prev => prev + 1)}
                    className="w-6.5 h-6.5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Edit BAK */}
              <div className="bg-emerald-50/10 dark:bg-slate-900/40 p-2.5 rounded-xl border border-emerald-100/20 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-455">Buang Air Kecil (BAK)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBak(prev => Math.max(0, prev - 1))}
                    className="w-6.5 h-6.5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs dark:text-white">{editBak}</span>
                  <button
                    type="button"
                    onClick={() => setEditBak(prev => prev + 1)}
                    className="w-6.5 h-6.5 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase">Catatan</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows="2"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-rosebrand-400 dark:text-white text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-750 text-slate-750 dark:text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rosebrand-500 hover:bg-rosebrand-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline Close Icon helper for modal
function X(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exportToCSV, exportToPDF, parseCSV } from '../services/excelPdfExport';
import {
  Search,
  Calendar,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function HistoryTable() {
  const { records, editRecord, removeRecord, importData } = useApp();

  // Filter States
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  
  // Data State
  const [filteredRecords, setFilteredRecords] = useState([]);
  
  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editAmount, setEditAmount] = useState(120);
  const [editSide, setEditSide] = useState('both');
  const [editNotes, setEditNotes] = useState('');
  
  // Feedback States
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Trigger filtering on search/filters or records changes
  useEffect(() => {
    let result = [...records];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        (r.notes || '').toLowerCase().includes(q) ||
        (r.breast_side === 'left' ? 'kiri' : r.breast_side === 'right' ? 'kanan' : 'keduanya').includes(q)
      );
    }

    if (dateFilter) {
      result = result.filter(r => r.date === dateFilter);
    } else if (monthFilter) {
      // monthFilter is YYYY-MM
      result = result.filter(r => r.date.startsWith(monthFilter));
    }

    setFilteredRecords(result);
  }, [records, search, dateFilter, monthFilter]);

  const showFeedback = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditDate(record.date);
    setEditTime(record.time);
    setEditAmount(record.amount);
    setEditSide(record.breast_side);
    setEditNotes(record.notes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editAmount <= 0) {
      alert('Jumlah harus lebih besar dari 0 ml.');
      return;
    }

    const success = await editRecord(editingRecord.id, {
      date: editDate,
      time: editTime,
      amount: editAmount,
      breast_side: editSide,
      notes: editNotes
    });

    if (success) {
      showFeedback('Data ASIP berhasil diperbarui!');
      setEditingRecord(null);
    } else {
      showFeedback('Gagal memperbarui data.', 'error');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pumping ini?')) {
      const success = await removeRecord(id);
      if (success) {
        showFeedback('Data ASIP berhasil dihapus!');
      } else {
        showFeedback('Gagal menghapus data.', 'error');
      }
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        showFeedback('Format file salah atau data kosong. Gunakan CSV standard.', 'error');
        return;
      }

      const success = await importData(parsed);
      if (success) {
        showFeedback(`Berhasil mengimpor ${parsed.length} data ASIP!`);
      } else {
        showFeedback('Gagal mengimpor data.', 'error');
      }
    };
    reader.readAsText(file);
    // clear input value so same file can be uploaded again
    e.target.value = null;
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showFeedback('Tidak ada data untuk diekspor.', 'error');
      return;
    }
    exportToCSV(filteredRecords);
    showFeedback('Data berhasil diekspor ke Excel/CSV!');
  };

  const handleExportPDF = () => {
    if (filteredRecords.length === 0) {
      showFeedback('Tidak ada data untuk diekspor.', 'error');
      return;
    }
    exportToPDF(filteredRecords);
    showFeedback('Laporan PDF siap dicetak!');
  };

  const handleResetFilters = () => {
    setSearch('');
    setDateFilter('');
    setMonthFilter('');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast popup */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${toastType === 'success' ? 'bg-emerald-500 text-white border-emerald-450/30' : 'bg-rose-500 text-white border-rose-450/30'}`}>
          {toastType === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Filter and Tools Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
        
        {/* Search & Filter inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari catatan atau sisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-450 text-sm dark:text-white transition"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              disabled={!!monthFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-450 text-sm dark:text-white transition disabled:opacity-50"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={monthFilter}
              disabled={!!dateFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-450 text-sm dark:text-white transition disabled:opacity-50"
            />
          </div>

          {/* Reset Filters & Clear */}
          <button
            onClick={handleResetFilters}
            className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition"
          >
            Hapus Filter
          </button>

        </div>

        {/* Import/Export buttons bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100/50 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor ke Excel</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-250 dark:border-indigo-900/50 hover:bg-indigo-100/50 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor ke PDF</span>
            </button>
          </div>

          {/* CSV File Import */}
          <label className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/80 px-4 py-2 rounded-xl text-xs font-bold dark:text-white transition cursor-pointer">
            <Upload className="w-4 h-4 text-brand-500" />
            <span>Impor Data CSV</span>
            <input
              type="file"
              accept=".csv, text/csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Database Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-450 dark:text-slate-550 text-xs">
              Tidak ada data ASIP yang ditemukan. Coba hapus filter atau catat baru.
            </div>
          ) : (
            <>
              {/* Desktop View: Wide Spreadsheet Table */}
              <table className="hidden lg:table w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Jam</th>
                    <th className="px-6 py-4">Jumlah (ml)</th>
                    <th className="px-6 py-4">Sisi Payudara</th>
                    <th className="px-6 py-4">Catatan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">{record.date}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{record.time}</td>
                      <td className="px-6 py-4 font-extrabold text-brand-600 dark:text-brand-350">{record.amount} ml</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wide border ${
                          record.breast_side === 'left'
                            ? 'bg-rosebrand-50 text-rosebrand-600 border-rosebrand-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                            : record.breast_side === 'right'
                            ? 'bg-brand-50 text-brand-650 border-brand-200 dark:bg-slate-750 dark:text-brand-350 dark:border-brand-850'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                        }`}>
                          {record.breast_side === 'left' ? 'Kiri' : record.breast_side === 'right' ? 'Kanan' : 'Keduanya'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={record.notes}>
                        {record.notes || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(record)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition"
                            title="Edit Catatan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 transition"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile/Android View: Touch-Friendly Card List */}
              <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="p-5 space-y-3.5 hover:bg-slate-50/30 dark:hover:bg-slate-750/10 transition">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {record.date} &nbsp;•&nbsp; {record.time}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        record.breast_side === 'left'
                          ? 'bg-rosebrand-50 text-rosebrand-600 border-rosebrand-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                          : record.breast_side === 'right'
                          ? 'bg-brand-50 text-brand-650 border-brand-200 dark:bg-slate-750 dark:text-brand-350 dark:border-brand-850'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                      }`}>
                        {record.breast_side === 'left' ? 'Kiri' : record.breast_side === 'right' ? 'Kanan' : 'Keduanya'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="text-2xl font-black text-brand-600 dark:text-brand-350">
                          {record.amount} <span className="text-sm font-medium text-slate-500">ml</span>
                        </div>
                        {record.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-750/35 break-words">
                            {record.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="w-11 h-11 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-750 rounded-xl text-slate-500 hover:text-slate-750 dark:hover:text-slate-200 transition border border-slate-200 dark:border-slate-700"
                          title="Edit Catatan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record.id)}
                          className="w-11 h-11 flex items-center justify-center bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/15 dark:hover:bg-rose-950/30 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-455 transition border border-rose-100 dark:border-rose-900/40"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
              <h3 className="font-bold">Ubah Catatan ASIP</h3>
              <button onClick={() => setEditingRecord(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-brand-400 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-400 uppercase">Jam</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-brand-400 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase block">Sisi Payudara</label>
                <div className="grid grid-cols-3 gap-2">
                  {['left', 'right', 'both'].map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setEditSide(side)}
                      className={`
                        py-2 text-xs font-semibold rounded-lg border transition
                        ${editSide === side
                          ? 'bg-brand-50 border-brand-400 text-brand-650 dark:bg-slate-750 dark:border-brand-500 dark:text-brand-350'
                          : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-450'
                        }
                      `}
                    >
                      {side === 'left' ? 'Kiri' : side === 'right' ? 'Kanan' : 'Keduanya'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xxs font-bold text-slate-400 uppercase">Volume (ml)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Math.max(0, parseFloat(e.target.value)))}
                    className="w-16 text-center font-bold border border-slate-250 dark:border-slate-700 rounded-lg py-0.5 text-xs bg-slate-50 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <input
                  type="range"
                  min="10"
                  max="400"
                  step="5"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-400 uppercase">Catatan</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows="2"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-brand-400 dark:text-white text-xs resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition"
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

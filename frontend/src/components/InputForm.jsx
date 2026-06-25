import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, Droplet, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

export default function InputForm() {
  const { addRecord } = useApp();

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState(120);
  const [breastSide, setBreastSide] = useState('both');
  const [notes, setNotes] = useState('');
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Set today's date and current time on mount
  useEffect(() => {
    resetFormValues();
  }, []);

  const resetFormValues = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5); // 'HH:MM'
    
    setDate(dateStr);
    setTime(timeStr);
    setAmount(120);
    setBreastSide('both');
    setNotes('');
  };

  const handleAmountChange = (val) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setAmount(parsed);
    }
  };

  const adjustAmount = (delta) => {
    setAmount(prev => Math.max(0, prev + delta));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (amount <= 0) {
      alert('Jumlah ASIP harus lebih besar dari 0 ml.');
      setLoading(false);
      return;
    }

    const success = await addRecord({
      date,
      time,
      amount,
      breast_side: breastSide,
      notes
    });

    if (success) {
      setShowToast(true);
      resetFormValues();
      // Auto hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } else {
      alert('Gagal menyimpan data ASIP.');
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-400/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-sm">Catatan Berhasil Disimpan!</p>
            <p className="text-xxs text-emerald-100 mt-0.5">Statistik dan riwayat diperbarui seketika.</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-md overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-400 to-brand-500 p-6 text-white text-center">
          <h2 className="text-lg font-bold tracking-tight">Catat Hasil Pumping ASIP Baru</h2>
          <p className="text-xs text-brand-100 mt-0.5">Catat secara teratur untuk memantau kelancaran produksi ASI Ibu</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* Row 1: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Tanggal Pumping
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-450 dark:text-white transition"
                />
              </div>
            </div>

            {/* Time Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Jam Pumping
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-450 dark:text-white transition"
                />
              </div>
            </div>

          </div>

          {/* Row 2: Breast Side Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Sisi Payudara yang Dipompa
            </label>
            <div className="grid grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setBreastSide('left')}
                className={`
                  py-3.5 rounded-2xl text-sm font-semibold border transition flex flex-col items-center justify-center gap-1
                  ${breastSide === 'left'
                    ? 'bg-brand-50 border-brand-350 text-brand-650 dark:bg-slate-750 dark:border-brand-500 dark:text-brand-350'
                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-450 hover:bg-slate-100/50'
                  }
                `}
              >
                <span>⬅️ Kiri</span>
                <span className="text-[10px] opacity-70 font-normal">Sisi Kiri Saja</span>
              </button>

              <button
                type="button"
                onClick={() => setBreastSide('right')}
                className={`
                  py-3.5 rounded-2xl text-sm font-semibold border transition flex flex-col items-center justify-center gap-1
                  ${breastSide === 'right'
                    ? 'bg-brand-50 border-brand-350 text-brand-650 dark:bg-slate-750 dark:border-brand-500 dark:text-brand-350'
                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-450 hover:bg-slate-100/50'
                  }
                `}
              >
                <span>Kanan ➡️</span>
                <span className="text-[10px] opacity-70 font-normal">Sisi Kanan Saja</span>
              </button>

              <button
                type="button"
                onClick={() => setBreastSide('both')}
                className={`
                  py-3.5 rounded-2xl text-sm font-semibold border transition flex flex-col items-center justify-center gap-1
                  ${breastSide === 'both'
                    ? 'bg-brand-50 border-brand-350 text-brand-650 dark:bg-slate-750 dark:border-brand-500 dark:text-brand-350'
                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-450 hover:bg-slate-100/50'
                  }
                `}
              >
                <span>🔄 Keduanya</span>
                <span className="text-[10px] opacity-70 font-normal">Kanan & Kiri</span>
              </button>

            </div>
          </div>

          {/* Row 3: Amount volume slider and input */}
          <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-150/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Volume Hasil ASIP (ml)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min="0"
                  max="1000"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-20 text-center font-extrabold text-brand-600 dark:text-brand-350 text-lg bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl px-2 py-1 outline-none focus:ring-1 focus:ring-brand-400"
                />
                <span className="text-sm font-bold text-slate-500">ml</span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 ml</span>
                <span>100 ml</span>
                <span>200 ml</span>
                <span>300 ml</span>
                <span>400 ml</span>
                <span>500 ml</span>
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 justify-center">
              <button
                type="button"
                onClick={() => adjustAmount(-50)}
                className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-slate-355 transition"
              >
                -50 ml
              </button>
              <button
                type="button"
                onClick={() => adjustAmount(-10)}
                className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-slate-355 transition"
              >
                -10 ml
              </button>
              <button
                type="button"
                onClick={() => adjustAmount(10)}
                className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-slate-355 transition"
              >
                +10 ml
              </button>
              <button
                type="button"
                onClick={() => adjustAmount(50)}
                className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-slate-355 transition"
              >
                +50 ml
              </button>
            </div>
          </div>

          {/* Row 4: Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Catatan Tambahan (Opsional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <textarea
                placeholder="Misalnya: Pumping setelah sarapan, bayi menyusui sebentar, booster ASI..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-450 dark:text-white transition resize-none text-sm"
              />
            </div>
          </div>

          {/* Submit & Reset Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={resetFormValues}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-650 hover:to-brand-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition disabled:opacity-50"
            >
              <Droplet className="w-5 h-5 fill-brand-200" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Data'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

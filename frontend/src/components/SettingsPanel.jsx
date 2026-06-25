import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Award, Clock, Sun, Moon, Database, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPanel() {
  const {
    user,
    settings,
    saveSettings,
    backupData,
    restoreData
  } = useApp();

  // Settings State
  const [name, setName] = useState(user?.name || 'Ibu ASIP');
  const [target, setTarget] = useState(settings.daily_target);
  const [interval, setInterval] = useState(settings.notification_interval);
  
  // UX State
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [saving, setSaving] = useState(false);

  const showFeedback = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!name.trim()) {
      showFeedback('Nama tidak boleh kosong.', 'error');
      setSaving(false);
      return;
    }

    if (target <= 0) {
      showFeedback('Target harian harus lebih besar dari 0 ml.', 'error');
      setSaving(false);
      return;
    }

    // Save profile name
    localStorage.setItem('asip_user_name', name);

    // Save settings
    const success = await saveSettings({
      ...settings,
      daily_target: parseFloat(target),
      notification_interval: parseInt(interval)
    });

    if (success) {
      showFeedback('Pengaturan berhasil disimpan!');
    } else {
      showFeedback('Gagal menyimpan pengaturan.', 'error');
    }
    
    setSaving(false);
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const success = await restoreData(evt.target.result);
        if (success) {
          showFeedback('Database berhasil di-restore!');
          // Refresh page after a brief moment to reload state
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showFeedback('Gagal me-restore data.', 'error');
        }
      } catch (err) {
        showFeedback(err.message || 'File backup tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // clear input
  };

  const handleThemeChange = (themeMode) => {
    saveSettings({
      ...settings,
      theme: themeMode
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${toastType === 'success' ? 'bg-emerald-500 text-white border-emerald-450/30' : 'bg-rose-500 text-white border-rose-450/30'}`}>
          {toastType === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: main settings inputs (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-brand-450 to-brand-500 px-6 py-4 text-white">
              <h3 className="font-bold text-sm">Profil & Target Pumping</h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Nama Pengguna */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase block">Nama Panggilan Ibu</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-450 text-sm dark:text-white transition"
                  />
                </div>
              </div>

              {/* Target Produksi Harian */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase block">Target Produksi Harian (ml)</label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="100"
                    max="5000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-450 text-sm dark:text-white transition"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Grafik pencapaian target harian akan menyesuaikan angka ini.</span>
              </div>

              {/* Interval Pengingat Pumping */}
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-slate-400 uppercase block">Interval Default Pengingat (Menit)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="15"
                    max="1440"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-450 text-sm dark:text-white transition"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Waktu antar alarm pumping berikutnya (default: 180 menit / 3 jam).</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition"
              >
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: theme, backup, restore (1/3 width) */}
        <div className="space-y-6">
          
          {/* Theme card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Tema Aplikasi</h3>
            <p className="text-xs text-slate-400">Pilih tampilan sesuai kenyamanan mata Ibu</p>
            
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${settings.theme === 'light' ? 'bg-brand-50 border-brand-350 text-brand-650 dark:bg-slate-750' : 'bg-slate-55 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700'}`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Terang</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${settings.theme === 'dark' ? 'bg-brand-50 border-brand-350 text-brand-650 dark:bg-slate-750 dark:border-brand-500 dark:text-brand-350' : 'bg-slate-55 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700'}`}
              >
                <Moon className="w-4 h-4 text-brand-500" />
                <span>Gelap</span>
              </button>
            </div>
          </div>

          {/* Database utility card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-500" />
              <span>Backup & Restore</span>
            </h3>
            <p className="text-xs text-slate-400">Ekspor seluruh data pumping Anda agar aman, atau pulihkan dari file cadangan sebelumnya</p>
            
            <div className="space-y-3 pt-2">
              {/* Backup */}
              <button
                onClick={backupData}
                className="w-full py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Backup Database (JSON)</span>
              </button>

              {/* Restore */}
              <label className="w-full py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer">
                <Upload className="w-4 h-4 text-brand-500" />
                <span>Restore Database (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

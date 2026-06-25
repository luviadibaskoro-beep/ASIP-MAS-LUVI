import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Activity, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginUser, registerUser } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password || (isRegister && !name)) {
      setError('Harap isi semua kolom data.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await registerUser(email, password, name);
        setSuccess('Pendaftaran berhasil! Silakan login menggunakan akun Anda.');
        setIsRegister(false);
        setPassword('');
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoData = () => {
    setEmail('ibu@asipmonitor.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-brand-100 dark:border-slate-700 transition-all duration-300">
        
        {/* Branding Header */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            Prototype
          </div>
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 animate-pulse">
            <Heart className="w-9 h-9 text-brand-500 fill-brand-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ASIP Monitor</h1>
          <p className="text-brand-100 text-sm mt-1">Air Susu Ibu Perah Monitoring System</p>
        </div>

        {/* Auth Body */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 text-center mb-6">
            {isRegister ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg flex items-start gap-2.5 text-sm border border-rose-100 dark:border-rose-900/50">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded-lg flex items-start gap-2.5 text-sm border border-emerald-100 dark:border-emerald-900/40">
              <Activity className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nama Ibu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-55/50 dark:bg-slate-900/50 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-55/50 dark:bg-slate-900/50 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-55/50 dark:bg-slate-900/50 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none transition dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-200 dark:shadow-none hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar Akun' : 'Masuk Aplikasi'}
            </button>
          </form>

          {/* Demo Login helper */}
          {!isRegister && (
            <div className="mt-4 p-3 bg-brand-50/55 dark:bg-brand-950/20 border border-brand-100/50 dark:border-brand-900/30 rounded-xl text-center">
              <p className="text-xs text-brand-800 dark:text-brand-350">
                Gunakan demo akun instan untuk evaluasi prototype:
              </p>
              <button
                onClick={fillDemoData}
                className="mt-1.5 text-xs text-brand-600 dark:text-brand-400 font-bold underline hover:text-brand-700"
              >
                Isi Otomatis Akun Demo
              </button>
            </div>
          )}

          {/* Toggle Register/Login Link */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isRegister ? (
              <p>
                Sudah memiliki akun?{' '}
                <button
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className="text-brand-500 hover:text-brand-600 font-medium underline"
                >
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p>
                Belum punya akun?{' '}
                <button
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className="text-brand-500 hover:text-brand-600 font-medium underline"
                >
                  Daftar Akun Baru
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

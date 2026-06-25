import React from 'react';
import { useApp } from './context/AppContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import HistoryTable from './components/HistoryTable';
import StatisticsCharts from './components/StatisticsCharts';
import NotificationSim from './components/NotificationSim';
import SettingsPanel from './components/SettingsPanel';
import BabyRoutine from './components/BabyRoutine';

export default function AppContent() {
  const { user, activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-250">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-550 dark:text-slate-400 font-bold mt-4">Menyiapkan ASIP Monitor...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'input' && <InputForm />}
      {activeTab === 'history' && <HistoryTable />}
      {activeTab === 'stats' && <StatisticsCharts />}
      {activeTab === 'baby' && <BabyRoutine />}
      {activeTab === 'notifications' && <NotificationSim />}
      {activeTab === 'settings' && <SettingsPanel />}
    </Layout>
  );
}

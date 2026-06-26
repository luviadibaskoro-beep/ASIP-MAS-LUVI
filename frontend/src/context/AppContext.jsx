import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    daily_target: 1000,
    notification_interval: 180,
    notification_time: '08:00',
    notifications_enabled: 1,
    theme: 'light'
  });
  const [notifications, setNotifications] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // Navigation: dashboard, input, history, stats, notifications, settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [babyRecords, setBabyRecords] = useState([]);
  const [babyStats, setBabyStats] = useState(null);

  // Load user on mount
  useEffect(() => {
    const userId = localStorage.getItem('asip_user_id');
    const name = localStorage.getItem('asip_user_name');
    const email = localStorage.getItem('asip_user_email');
    if (userId) {
      setUser({ id: parseInt(userId), name, email });
    }
    setLoading(false);
  }, []);

  // Fetch data whenever user logs in or is changed
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setRecords([]);
      setStats(null);
      setNotifications([]);
      setBabyRecords([]);
      setBabyStats(null);
    }
  }, [user]);

  // Apply Theme (Dark Mode) & PWA Android Status Bar color sync
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#1e293b'); // slate-800 (header background)
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#ffffff'); // white (header background)
      }
    }
  }, [settings.theme]);

  // Simulated Pumping Reminders Timer
  useEffect(() => {
    if (!user || !settings.notifications_enabled) return;

    // Simulate an alarm trigger based on notification_interval
    const intervalMs = settings.notification_interval * 60 * 1000;
    
    const triggerReminder = () => {
      const messages = [
        'Waktunya pumping sesi berikutnya! Yuk jaga produksi ASI.',
        'Sudah 3 jam sejak pumping terakhir. Jangan lupa catat hasilnya ya!',
        'Ayo pumping sekarang agar payudara tidak bengkak dan ASI lancar.',
        'Minum segelas air hangat dulu, lalu mulailah pumping sesi ini.'
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      api.createNotification('pumping', randomMsg)
        .then(newNotif => {
          setNotifications(prev => [newNotif, ...prev]);
          // If browser notifications are supported, show native notification
          if (Notification.permission === 'granted') {
            new Notification('ASIP Monitor - Pengingat', {
              body: randomMsg,
              icon: '/logo.png'
            });
          }
        })
        .catch(err => console.error('Error creating simulated notification:', err));
    };

    const timerId = setInterval(triggerReminder, intervalMs);

    // Request notification permission if enabled
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(timerId);
  }, [user, settings.notifications_enabled, settings.notification_interval]);

  const fetchData = async () => {
    setLoading(true);
    let offlineFlag = false;

    // 1. Fetch settings
    try {
      const fetchedSettings = await api.getSettings();
      setSettings(fetchedSettings);
    } catch (err) {
      if (err.message === 'OFFLINE') offlineFlag = true;
    }

    // 2. Fetch records
    try {
      const fetchedRecords = await api.getRecords();
      setRecords(fetchedRecords);
    } catch (err) {
      if (err.message === 'OFFLINE') offlineFlag = true;
    }

    // 3. Fetch notifications
    try {
      const fetchedNotifs = await api.getNotifications();
      setNotifications(fetchedNotifs);
    } catch (err) {
      if (err.message === 'OFFLINE') offlineFlag = true;
    }

    // 4. Fetch Stats
    try {
      const fetchedStats = await api.getStats();
      setStats(fetchedStats);
    } catch (err) {
      if (err.message === 'OFFLINE') offlineFlag = true;
    }

    // 5. Fetch Baby Records
    try {
      const fetchedBabyRecords = await api.getBabyRecords();
      setBabyRecords(fetchedBabyRecords);
    } catch (err) {
      if (err.message === 'OFFLINE') offlineFlag = true;
    }

    // 6. Fetch Baby Stats
    try {
      const fetchedBabyStats = await api.getBabyStats();
      setBabyStats(fetchedBabyStats);
    } catch (err) {
      if (err.message === 'OFFLINE') offlineFlag = true;
    }

    setIsOffline(offlineFlag);
    setLoading(false);
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setIsOffline(false);
      return res;
    } catch (err) {
      if (err.message.includes('Demo') || err.message === 'OFFLINE') {
        // Handle local login simulation
        if (email === 'ibu@asipmonitor.com' && password === 'password123') {
          const mockUser = { id: 1, email: 'ibu@asipmonitor.com', name: 'Ibu Luviadi (Offline)' };
          setUser(mockUser);
          setIsOffline(true);
          return { user: mockUser };
        }
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (email, password, name) => {
    setLoading(true);
    try {
      const res = await api.register(email, password, name);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('asip_user_id');
    localStorage.removeItem('asip_user_name');
    localStorage.removeItem('asip_user_email');
    setUser(null);
    setBabyRecords([]);
    setBabyStats(null);
    setActiveTab('dashboard');
  };

  const updateProfile = async (newName) => {
    try {
      await api.updateProfile(newName);
      setUser(prev => prev ? { ...prev, name: newName } : null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const addRecord = async (recordData) => {
    try {
      const newRec = await api.createRecord(recordData);
      setRecords(prev => [newRec, ...prev]);
      
      // Refresh stats & notifications (in case target met is triggered)
      const freshStats = await api.getStats();
      setStats(freshStats);
      const freshNotifs = await api.getNotifications();
      setNotifications(freshNotifs);
      
      return true;
    } catch (err) {
      console.error('Error adding record:', err);
      return false;
    }
  };

  const editRecord = async (id, updatedData) => {
    try {
      await api.updateRecord(id, updatedData);
      setRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updatedData, amount: parseFloat(updatedData.amount) } : r)));
      
      const freshStats = await api.getStats();
      setStats(freshStats);
      return true;
    } catch (err) {
      console.error('Error editing record:', err);
      return false;
    }
  };

  const removeRecord = async (id) => {
    try {
      await api.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      
      const freshStats = await api.getStats();
      setStats(freshStats);
      return true;
    } catch (err) {
      console.error('Error deleting record:', err);
      return false;
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await api.updateSettings(newSettings);
      setSettings(newSettings);
      
      const freshStats = await api.getStats();
      setStats(freshStats);
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      return false;
    }
  };

  const markNotifRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifs = async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const importData = async (parsedRecords) => {
    try {
      await api.importRecords(parsedRecords);
      // Refresh database
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Backup data as JSON file
  const backupData = () => {
    const backupObj = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: { name: user.name, email: user.email },
      records,
      settings
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASIP_Monitor_Backup_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restore data from JSON file
  const restoreData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.records || !Array.isArray(data.records)) {
        throw new Error('Format file backup tidak valid.');
      }
      
      // Import records
      return importData(data.records).then(success => {
        if (success && data.settings) {
          saveSettings(data.settings);
        }
        return success;
      });
    } catch (err) {
      console.error('Restore failed:', err);
      return Promise.reject(err);
    }
  };

  const addBabyRecord = async (recordData) => {
    try {
      const newRec = await api.createBabyRecord(recordData);
      setBabyRecords(prev => [newRec, ...prev]);
      
      const freshStats = await api.getBabyStats();
      setBabyStats(freshStats);
      return true;
    } catch (err) {
      console.error('Error adding baby record:', err);
      return false;
    }
  };

  const editBabyRecord = async (id, updatedData) => {
    try {
      await api.updateBabyRecord(id, updatedData);
      setBabyRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updatedData, bab_count: parseInt(updatedData.bab_count), bak_count: parseInt(updatedData.bak_count) } : r)));
      
      const freshStats = await api.getBabyStats();
      setBabyStats(freshStats);
      return true;
    } catch (err) {
      console.error('Error editing baby record:', err);
      return false;
    }
  };

  const removeBabyRecord = async (id) => {
    try {
      await api.deleteBabyRecord(id);
      setBabyRecords(prev => prev.filter(r => r.id !== id));
      
      const freshStats = await api.getBabyStats();
      setBabyStats(freshStats);
      return true;
    } catch (err) {
      console.error('Error deleting baby record:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      records,
      stats,
      settings,
      notifications,
      isOffline,
      loading,
      activeTab,
      sidebarOpen,
      setActiveTab,
      setSidebarOpen,
      loginUser,
      logoutUser,
      registerUser,
      updateProfile,
      addRecord,
      editRecord,
      removeRecord,
      saveSettings,
      markNotifRead,
      clearAllNotifs,
      importData,
      backupData,
      restoreData,
      babyRecords,
      babyStats,
      addBabyRecord,
      editBabyRecord,
      removeBabyRecord,
      refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

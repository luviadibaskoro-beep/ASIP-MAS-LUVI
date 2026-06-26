const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  // If accessed over Wi-Fi/local network (like 192.168.1.45)
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000/api`;
  }
  // If running inside Capacitor webview on the phone
  if (window.Capacitor) {
    return 'http://192.168.1.45:5000/api';
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getApiBaseUrl();

// Helper to check network status and fetch
async function request(path, options = {}) {
  const userId = localStorage.getItem('asip_user_id') || '1';
  
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // If it's a network error (server down or offline), throw specific error so caller handles fallback
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('network')) {
      console.warn('Backend server unreachable. Falling back to offline LocalStorage mode.');
      throw new Error('OFFLINE');
    }
    throw error;
  }
}

// LocalStorage helpers for offline mode
const offlineStorage = {
  getRecords() {
    const records = localStorage.getItem('asip_offline_records');
    if (!records) {
      // Seed default offline records if empty (copying structure of seeder)
      return [];
    }
    return JSON.parse(records);
  },
  
  saveRecords(records) {
    localStorage.setItem('asip_offline_records', JSON.stringify(records));
  },
  
  getSettings() {
    const settings = localStorage.getItem('asip_offline_settings');
    if (!settings) {
      return {
        daily_target: 1000,
        notification_interval: 180,
        notification_time: '08:00',
        notifications_enabled: 1,
        theme: 'light'
      };
    }
    return JSON.parse(settings);
  },
  
  saveSettings(settings) {
    localStorage.setItem('asip_offline_settings', JSON.stringify(settings));
  },

  getNotifications() {
    const notifs = localStorage.getItem('asip_offline_notifications');
    if (!notifs) {
      return [
        {
          id: Date.now(),
          type: 'pumping',
          message: 'Mode Offline Aktif. Data Anda disimpan di browser dan akan disinkronkan saat online.',
          triggered_at: new Date().toISOString(),
          is_read: 0
        }
      ];
    }
    return JSON.parse(notifs);
  },

  saveNotifications(notifs) {
    localStorage.setItem('asip_offline_notifications', JSON.stringify(notifs));
  },

  calculateStats() {
    const records = this.getRecords();
    const settings = this.getSettings();
    const target = settings.daily_target;
    const todayStr = new Date().toISOString().split('T')[0];

    const todayRecords = records.filter(r => r.date === todayStr);
    const todayAmount = todayRecords.reduce((sum, r) => sum + r.amount, 0);
    const todaySessions = todayRecords.length;

    const allAmounts = records.map(r => r.amount);
    const totalAmount = allAmounts.reduce((sum, a) => sum + a, 0);
    const maxAmount = allAmounts.length > 0 ? Math.max(...allAmounts) : 0;
    const minAmount = allAmounts.length > 0 ? Math.min(...allAmounts) : 0;

    // Daily averages
    const dailySums = {};
    records.forEach(r => {
      dailySums[r.date] = (dailySums[r.date] || 0) + r.amount;
    });
    const uniqueDays = Object.keys(dailySums).length;
    const avgDailyAmount = uniqueDays > 0 ? Math.round(totalAmount / uniqueDays) : 0;

    // Breast side distribution
    const sides = { left: { amount: 0, count: 0 }, right: { amount: 0, count: 0 }, both: { amount: 0, count: 0 } };
    records.forEach(r => {
      if (sides[r.breast_side]) {
        sides[r.breast_side].amount += r.amount;
        sides[r.breast_side].count += 1;
      }
    });

    const breastSides = Object.keys(sides).map(key => ({
      breast_side: key,
      amount: sides[key].amount,
      count: sides[key].count
    }));

    // Weekly (last 7 calendar days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRecs = records.filter(r => r.date === dStr);
      weeklyData.push({
        date: dStr,
        amount: dayRecs.reduce((sum, r) => sum + r.amount, 0),
        sessions: dayRecs.length
      });
    }

    // Monthly (last 30 calendar days)
    const monthlyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRecs = records.filter(r => r.date === dStr);
      monthlyData.push({
        date: dStr,
        amount: dayRecs.reduce((sum, r) => sum + r.amount, 0),
        sessions: dayRecs.length
      });
    }

    return {
      dailyTarget: target,
      today: {
        amount: todayAmount,
        sessions: todaySessions,
        percentage: Math.min(100, Math.round((todayAmount / target) * 100))
      },
      overview: {
        totalAmount,
        maxAmount,
        minAmount,
        totalSessions: records.length,
        averageDaily: avgDailyAmount,
        totalActiveDays: uniqueDays
      },
      breastSides,
      weekly: weeklyData,
      monthly: monthlyData
    };
  },
  
  getBabyRecords() {
    const records = localStorage.getItem('asip_offline_baby_records');
    if (!records) return [];
    return JSON.parse(records);
  },
  
  saveBabyRecords(records) {
    localStorage.setItem('asip_offline_baby_records', JSON.stringify(records));
  },
  
  calculateBabyStats() {
    const records = this.getBabyRecords();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayRecords = records.filter(r => r.date === todayStr);
    const todayBab = todayRecords.reduce((sum, r) => sum + r.bab_count, 0);
    const todayBak = todayRecords.reduce((sum, r) => sum + r.bak_count, 0);

    const totalBab = records.reduce((sum, r) => sum + r.bab_count, 0);
    const totalBak = records.reduce((sum, r) => sum + r.bak_count, 0);
    const uniqueDays = new Set(records.map(r => r.date)).size || 1;

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayRecs = records.filter(r => r.date === dStr);
      weeklyData.push({
        date: dStr,
        bab: dayRecs.reduce((sum, r) => sum + r.bab_count, 0),
        bak: dayRecs.reduce((sum, r) => sum + r.bak_count, 0)
      });
    }

    return {
      today: { bab: todayBab, bak: todayBak },
      overview: {
        totalBab,
        totalBak,
        totalDays: uniqueDays,
        avgDailyBab: (totalBab / uniqueDays).toFixed(1),
        avgDailyBak: (totalBak / uniqueDays).toFixed(1)
      },
      weekly: weeklyData
    };
  }
};

export const api = {
  // Auth
  async login(email, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('asip_user_id', data.user.id);
      localStorage.setItem('asip_user_name', data.user.name);
      localStorage.setItem('asip_user_email', data.user.email);
      return data;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        // Offline login simulation (only works for dummy user)
        if (email === 'ibu@asipmonitor.com' && password === 'password123') {
          localStorage.setItem('asip_user_id', '1');
          localStorage.setItem('asip_user_name', 'Ibu Luviadi (Offline)');
          localStorage.setItem('asip_user_email', 'ibu@asipmonitor.com');
          return {
            user: { id: 1, email: 'ibu@asipmonitor.com', name: 'Ibu Luviadi (Offline)' }
          };
        }
        throw new Error('Gagal login: Sedang offline. Hanya dapat login dengan akun demo (ibu@asipmonitor.com / password123).');
      }
      throw err;
    }
  },

  async register(email, password, name) {
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
    } catch (err) {
      if (err.message === 'OFFLINE') {
        throw new Error('Registrasi gagal karena Anda sedang offline. Hubungkan ke jaringan untuk mendaftar akun baru.');
      }
      throw err;
    }
  },

  async updateProfile(name) {
    try {
      const data = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
      localStorage.setItem('asip_user_name', name);
      return data;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        localStorage.setItem('asip_user_name', name);
        return { name };
      }
      throw err;
    }
  },

  // Records CRUD
  async getRecords(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const records = await request(`/records?${queryParams}`);
      // Cache records for offline use
      offlineStorage.saveRecords(records);
      return records;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        let records = offlineStorage.getRecords();
        // apply manual filters
        if (filters.date) {
          records = records.filter(r => r.date === filters.date);
        } else if (filters.month) {
          records = records.filter(r => r.date.startsWith(filters.month));
        }
        if (filters.search) {
          records = records.filter(r => (r.notes || '').toLowerCase().includes(filters.search.toLowerCase()));
        }
        return records;
      }
      throw err;
    }
  },

  async createRecord(record) {
    try {
      const res = await request('/records', {
        method: 'POST',
        body: JSON.stringify(record)
      });
      // Update cache
      const localRecs = offlineStorage.getRecords();
      localRecs.unshift(res);
      offlineStorage.saveRecords(localRecs);
      return res;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const newRecord = {
          ...record,
          id: Date.now(),
          amount: parseFloat(record.amount),
          user_id: 1,
          created_at: new Date().toISOString()
        };
        const localRecs = offlineStorage.getRecords();
        localRecs.unshift(newRecord);
        offlineStorage.saveRecords(localRecs);

        // Check target met offline
        const settings = offlineStorage.getSettings();
        const todayStr = newRecord.date;
        const totalToday = localRecs.filter(r => r.date === todayStr).reduce((sum, r) => sum + r.amount, 0);
        const prevTotal = totalToday - newRecord.amount;

        if (totalToday >= settings.daily_target && prevTotal < settings.daily_target) {
          const notifs = offlineStorage.getNotifications();
          notifs.unshift({
            id: Date.now() + 1,
            type: 'target_met',
            message: `Target harian offline Anda sebesar ${settings.daily_target} ml telah tercapai hari ini! (${todayStr})`,
            triggered_at: new Date().toISOString(),
            is_read: 0
          });
          offlineStorage.saveNotifications(notifs);
        }

        return newRecord;
      }
      throw err;
    }
  },

  async updateRecord(id, record) {
    try {
      await request(`/records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(record)
      });
      const localRecs = offlineStorage.getRecords();
      const idx = localRecs.findIndex(r => r.id === parseInt(id) || r.id === id);
      if (idx !== -1) {
        localRecs[idx] = { ...localRecs[idx], ...record, amount: parseFloat(record.amount) };
        offlineStorage.saveRecords(localRecs);
      }
      return { message: 'Data berhasil diperbarui' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const localRecs = offlineStorage.getRecords();
        const idx = localRecs.findIndex(r => r.id === id);
        if (idx !== -1) {
          localRecs[idx] = { ...localRecs[idx], ...record, amount: parseFloat(record.amount) };
          offlineStorage.saveRecords(localRecs);
          return { message: 'Data diperbarui secara lokal' };
        }
        throw new Error('Data tidak ditemukan');
      }
      throw err;
    }
  },

  async deleteRecord(id) {
    try {
      await request(`/records/${id}`, {
        method: 'DELETE'
      });
      const localRecs = offlineStorage.getRecords();
      const updated = localRecs.filter(r => r.id !== parseInt(id) && r.id !== id);
      offlineStorage.saveRecords(updated);
      return { message: 'Data berhasil dihapus' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const localRecs = offlineStorage.getRecords();
        const updated = localRecs.filter(r => r.id !== id);
        offlineStorage.saveRecords(updated);
        return { message: 'Data dihapus secara lokal' };
      }
      throw err;
    }
  },

  // Settings
  async getSettings() {
    try {
      const settings = await request('/settings');
      offlineStorage.saveSettings(settings);
      return settings;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        return offlineStorage.getSettings();
      }
      throw err;
    }
  },

  async updateSettings(settings) {
    try {
      await request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      offlineStorage.saveSettings(settings);
      return { message: 'Pengaturan disimpan' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        offlineStorage.saveSettings(settings);
        return { message: 'Pengaturan disimpan secara lokal' };
      }
      throw err;
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const notifs = await request('/notifications');
      offlineStorage.saveNotifications(notifs);
      return notifs;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        return offlineStorage.getNotifications();
      }
      throw err;
    }
  },

  async createNotification(type, message) {
    try {
      const notif = await request('/notifications', {
        method: 'POST',
        body: JSON.stringify({ type, message })
      });
      const localNotifs = offlineStorage.getNotifications();
      localNotifs.unshift(notif);
      offlineStorage.saveNotifications(localNotifs);
      return notif;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const newNotif = {
          id: Date.now(),
          type,
          message,
          triggered_at: new Date().toISOString(),
          is_read: 0
        };
        const localNotifs = offlineStorage.getNotifications();
        localNotifs.unshift(newNotif);
        offlineStorage.saveNotifications(localNotifs);
        return newNotif;
      }
      throw err;
    }
  },

  async markNotificationRead(id) {
    try {
      await request(`/notifications/${id}/read`, {
        method: 'PUT'
      });
      const localNotifs = offlineStorage.getNotifications();
      const idx = localNotifs.findIndex(n => n.id === parseInt(id) || n.id === id);
      if (idx !== -1) {
        localNotifs[idx].is_read = 1;
        offlineStorage.saveNotifications(localNotifs);
      }
      return { message: 'Notifikasi dibaca' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const localNotifs = offlineStorage.getNotifications();
        const idx = localNotifs.findIndex(n => n.id === id);
        if (idx !== -1) {
          localNotifs[idx].is_read = 1;
          offlineStorage.saveNotifications(localNotifs);
        }
        return { message: 'Notifikasi dibaca secara lokal' };
      }
      throw err;
    }
  },

  async clearNotifications() {
    try {
      await request('/notifications/clear', {
        method: 'DELETE'
      });
      offlineStorage.saveNotifications([]);
      return { message: 'Semua notifikasi dihapus' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        offlineStorage.saveNotifications([]);
        return { message: 'Semua notifikasi dihapus secara lokal' };
      }
      throw err;
    }
  },

  // Stats
  async getStats() {
    try {
      return await request('/stats');
    } catch (err) {
      if (err.message === 'OFFLINE') {
        return offlineStorage.calculateStats();
      }
      throw err;
    }
  },

  // Import
  async importRecords(data) {
    try {
      const res = await request('/records/import', {
        method: 'POST',
        body: JSON.stringify({ data })
      });
      
      // refresh local storage cache
      const updatedRecords = await request('/records');
      offlineStorage.saveRecords(updatedRecords);
      return res;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const localRecs = offlineStorage.getRecords();
        const formatted = data.map((r, i) => ({
          ...r,
          id: Date.now() + i,
          amount: parseFloat(r.amount),
          user_id: 1,
          created_at: new Date().toISOString()
        }));
        const combined = [...formatted, ...localRecs];
        // Sort
        combined.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
        offlineStorage.saveRecords(combined);
        return { message: `Berhasil mengimpor ${data.length} data ASIP secara lokal` };
      }
      throw err;
    }
  },

  // Baby Daily Routine
  async getBabyRecords(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const records = await request(`/baby?${queryParams}`);
      offlineStorage.saveBabyRecords(records);
      return records;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        let records = offlineStorage.getBabyRecords();
        if (filters.date) {
          records = records.filter(r => r.date === filters.date);
        } else if (filters.month) {
          records = records.filter(r => r.date.startsWith(filters.month));
        }
        if (filters.search) {
          records = records.filter(r => (r.notes || '').toLowerCase().includes(filters.search.toLowerCase()));
        }
        return records;
      }
      throw err;
    }
  },

  async createBabyRecord(record) {
    try {
      const res = await request('/baby', {
        method: 'POST',
        body: JSON.stringify(record)
      });
      const localRecs = offlineStorage.getBabyRecords();
      localRecs.unshift(res);
      offlineStorage.saveBabyRecords(localRecs);
      return res;
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const newRecord = {
          ...record,
          id: Date.now(),
          bab_count: parseInt(record.bab_count) || 0,
          bak_count: parseInt(record.bak_count) || 0,
          user_id: 1,
          created_at: new Date().toISOString()
        };
        const localRecs = offlineStorage.getBabyRecords();
        localRecs.unshift(newRecord);
        offlineStorage.saveBabyRecords(localRecs);
        return newRecord;
      }
      throw err;
    }
  },

  async updateBabyRecord(id, record) {
    try {
      await request(`/baby/${id}`, {
        method: 'PUT',
        body: JSON.stringify(record)
      });
      const localRecs = offlineStorage.getBabyRecords();
      const idx = localRecs.findIndex(r => r.id === parseInt(id) || r.id === id);
      if (idx !== -1) {
        localRecs[idx] = { 
          ...localRecs[idx], 
          ...record, 
          bab_count: parseInt(record.bab_count) || 0, 
          bak_count: parseInt(record.bak_count) || 0 
        };
        offlineStorage.saveBabyRecords(localRecs);
      }
      return { message: 'Data berhasil diperbarui' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const localRecs = offlineStorage.getBabyRecords();
        const idx = localRecs.findIndex(r => r.id === id);
        if (idx !== -1) {
          localRecs[idx] = { 
            ...localRecs[idx], 
            ...record, 
            bab_count: parseInt(record.bab_count) || 0, 
            bak_count: parseInt(record.bak_count) || 0 
          };
          offlineStorage.saveBabyRecords(localRecs);
          return { message: 'Data diperbarui secara lokal' };
        }
        throw new Error('Data tidak ditemukan');
      }
      throw err;
    }
  },

  async deleteBabyRecord(id) {
    try {
      await request(`/baby/${id}`, {
        method: 'DELETE'
      });
      const localRecs = offlineStorage.getBabyRecords();
      const updated = localRecs.filter(r => r.id !== parseInt(id) && r.id !== id);
      offlineStorage.saveBabyRecords(updated);
      return { message: 'Data berhasil dihapus' };
    } catch (err) {
      if (err.message === 'OFFLINE') {
        const localRecs = offlineStorage.getBabyRecords();
        const updated = localRecs.filter(r => r.id !== id);
        offlineStorage.saveBabyRecords(updated);
        return { message: 'Data dihapus secara lokal' };
      }
      throw err;
    }
  },

  async getBabyStats() {
    try {
      return await request('/baby/stats');
    } catch (err) {
      if (err.message === 'OFFLINE') {
        return offlineStorage.calculateBabyStats();
      }
      throw err;
    }
  }
};

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to extract userId (prototype simplified, defaults to 1)
const getUserId = (req) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 1;
  return parseInt(userId);
};

// --- AUTH ROUTES (Prototype Simulation) ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Email tidak terdaftar' });
    if (user.password !== password) {
      return res.status(401).json({ error: 'Password salah' });
    }

    res.json({
      message: 'Login berhasil',
      user: { id: user.id, email: user.email, name: user.name }
    });
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Semua kolom harus diisi' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    db.serialize(() => {
      db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, password, name],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          const newUserId = this.lastID;

          // Insert default settings
          db.run(
            `INSERT INTO settings (user_id, daily_target, notification_interval, notification_time, notifications_enabled, theme)
             VALUES (?, 1000, 180, '08:00', 1, 'light')`,
            [newUserId],
            (err) => {
              if (err) console.error('Error inserting settings for new user:', err.message);
              
              res.status(201).json({
                message: 'Registrasi berhasil',
                user: { id: newUserId, email, name }
              });
            }
          );
        }
      );
    });
  });
});

app.put('/api/auth/profile', (req, res) => {
  const userId = getUserId(req);
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nama tidak boleh kosong' });
  }

  db.run(
    'UPDATE users SET name = ? WHERE id = ?',
    [name, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profil berhasil diperbarui', name });
    }
  );
});

// --- SETTINGS ROUTES ---
app.get('/api/settings', (req, res) => {
  const userId = getUserId(req);
  db.get('SELECT * FROM settings WHERE user_id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      // Return default settings if not exists
      return res.json({
        user_id: userId,
        daily_target: 1000,
        notification_interval: 180,
        notification_time: '08:00',
        notifications_enabled: 1,
        theme: 'light'
      });
    }
    res.json(row);
  });
});

app.put('/api/settings', (req, res) => {
  const userId = getUserId(req);
  const { daily_target, notification_interval, notification_time, notifications_enabled, theme } = req.body;

  db.run(
    `INSERT INTO settings (user_id, daily_target, notification_interval, notification_time, notifications_enabled, theme)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
      daily_target = excluded.daily_target,
      notification_interval = excluded.notification_interval,
      notification_time = excluded.notification_time,
      notifications_enabled = excluded.notifications_enabled,
      theme = excluded.theme`,
    [userId, daily_target, notification_interval, notification_time, notifications_enabled, theme],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pengaturan berhasil disimpan' });
    }
  );
});

// --- ASIP RECORDS CRUD ROUTES ---
app.get('/api/records', (req, res) => {
  const userId = getUserId(req);
  const { date, month, search } = req.query;

  let query = 'SELECT * FROM asip_records WHERE user_id = ?';
  const params = [userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  } else if (month) {
    // month is expected as 'YYYY-MM'
    query += ' AND date LIKE ?';
    params.push(`${month}%`);
  }

  if (search) {
    query += ' AND notes LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY date DESC, time DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/records', (req, res) => {
  const userId = getUserId(req);
  const { date, time, amount, breast_side, notes } = req.body;

  if (!date || !time || !amount || !breast_side) {
    return res.status(400).json({ error: 'Tanggal, jam, jumlah, dan sisi payudara wajib diisi' });
  }

  db.run(
    'INSERT INTO asip_records (user_id, date, time, amount, breast_side, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, date, time, parseFloat(amount), breast_side, notes || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const recordId = this.lastID;

      // Check if this new record triggers a "daily target met" notification
      db.get('SELECT daily_target FROM settings WHERE user_id = ?', [userId], (err, setting) => {
        const target = setting ? setting.daily_target : 1000;
        
        db.get('SELECT SUM(amount) as total FROM asip_records WHERE user_id = ? AND date = ?', [userId, date], (err, sumRow) => {
          const totalToday = sumRow ? sumRow.total : 0;
          const prevTotal = totalToday - parseFloat(amount);

          if (totalToday >= target && prevTotal < target) {
            // Trigger notification
            db.run(
              "INSERT INTO notifications (user_id, type, message) VALUES (?, 'target_met', ?)",
              [userId, `Selamat! Target harian Anda sebesar ${target} ml telah tercapai hari ini (${date}) dengan total produksi ${totalToday} ml.`],
              (err) => {
                if (err) console.error('Error inserting notification:', err.message);
              }
            );
          }
        });
      });

      res.status(201).json({
        id: recordId,
        user_id: userId,
        date,
        time,
        amount: parseFloat(amount),
        breast_side,
        notes
      });
    }
  );
});

app.put('/api/records/:id', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { date, time, amount, breast_side, notes } = req.body;

  db.run(
    'UPDATE asip_records SET date = ?, time = ?, amount = ?, breast_side = ?, notes = ? WHERE id = ? AND user_id = ?',
    [date, time, parseFloat(amount), breast_side, notes || '', id, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan atau tidak berwenang' });
      }
      res.json({ message: 'Data berhasil diperbarui' });
    }
  );
});

app.delete('/api/records/:id', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  db.run('DELETE FROM asip_records WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan atau tidak berwenang' });
    }
    res.json({ message: 'Data berhasil dihapus' });
  });
});

// --- NOTIFICATIONS ROUTES ---
app.get('/api/notifications', (req, res) => {
  const userId = getUserId(req);
  db.all(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY triggered_at DESC LIMIT 50',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/notifications', (req, res) => {
  const userId = getUserId(req);
  const { type, message } = req.body;

  db.run(
    'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
    [userId, type, message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, user_id: userId, type, message, triggered_at: new Date().toISOString(), is_read: 0 });
    }
  );
});

app.put('/api/notifications/:id/read', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Notifikasi ditandai telah dibaca' });
    }
  );
});

app.delete('/api/notifications/clear', (req, res) => {
  const userId = getUserId(req);
  db.run('DELETE FROM notifications WHERE user_id = ?', [userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Semua notifikasi dihapus' });
  });
});

// --- STATISTICS ENDPOINT ---
app.get('/api/stats', (req, res) => {
  const userId = getUserId(req);
  const todayStr = new Date().toISOString().split('T')[0];

  db.serialize(() => {
    // 1. Get settings
    db.get('SELECT daily_target FROM settings WHERE user_id = ?', [userId], (err, settingRow) => {
      const dailyTarget = settingRow ? settingRow.daily_target : 1000;

      // 2. All-time aggregates (Total, Max, Min, Avg)
      const aggregatesQuery = `
        SELECT 
          SUM(amount) as totalAmount,
          MAX(amount) as maxAmount,
          MIN(amount) as minAmount,
          COUNT(id) as totalSessions
        FROM asip_records 
        WHERE user_id = ?
      `;

      db.get(aggregatesQuery, [userId], (err, aggRow) => {
        if (err) return res.status(500).json({ error: err.message });

        // 3. Average daily production (Total / Unique Days)
        const avgQuery = `
          SELECT AVG(daily_sum) as avgDailyAmount, COUNT(DISTINCT date) as totalDays
          FROM (
            SELECT date, SUM(amount) as daily_sum 
            FROM asip_records 
            WHERE user_id = ?
            GROUP BY date
          )
        `;

        db.get(avgQuery, [userId], (err, avgRow) => {
          if (err) return res.status(500).json({ error: err.message });

          // 4. Today's statistics (Today total, Today sessions)
          const todayQuery = `
            SELECT SUM(amount) as todayAmount, COUNT(id) as todaySessions
            FROM asip_records
            WHERE user_id = ? AND date = ?
          `;

          db.get(todayQuery, [userId, todayStr], (err, todayRow) => {
            if (err) return res.status(500).json({ error: err.message });

            // 5. Breast side distribution
            const sideQuery = `
              SELECT breast_side, SUM(amount) as amount, COUNT(id) as count
              FROM asip_records
              WHERE user_id = ?
              GROUP BY breast_side
            `;

            db.all(sideQuery, [userId], (err, sideRows) => {
              if (err) return res.status(500).json({ error: err.message });

              // 6. Last 7 days production list
              const last7DaysQuery = `
                SELECT date, SUM(amount) as amount, COUNT(id) as sessions
                FROM asip_records
                WHERE user_id = ?
                GROUP BY date
                ORDER BY date DESC
                LIMIT 7
              `;

              db.all(last7DaysQuery, [userId], (err, weeklyRows) => {
                if (err) return res.status(500).json({ error: err.message });

                // 7. Last 30 days production list
                const last30DaysQuery = `
                  SELECT date, SUM(amount) as amount, COUNT(id) as sessions
                  FROM asip_records
                  WHERE user_id = ?
                  GROUP BY date
                  ORDER BY date DESC
                  LIMIT 30
                `;

                db.all(last30DaysQuery, [userId], (err, monthlyRows) => {
                  if (err) return res.status(500).json({ error: err.message });

                  // Format response
                  res.json({
                    dailyTarget,
                    today: {
                      amount: todayRow ? (todayRow.todayAmount || 0) : 0,
                      sessions: todayRow ? (todayRow.todaySessions || 0) : 0,
                      percentage: todayRow ? Math.min(100, Math.round(((todayRow.todayAmount || 0) / dailyTarget) * 100)) : 0
                    },
                    overview: {
                      totalAmount: aggRow ? (aggRow.totalAmount || 0) : 0,
                      maxAmount: aggRow ? (aggRow.maxAmount || 0) : 0,
                      minAmount: aggRow ? (aggRow.minAmount || 0) : 0,
                      totalSessions: aggRow ? (aggRow.totalSessions || 0) : 0,
                      averageDaily: avgRow ? Math.round(avgRow.avgDailyAmount || 0) : 0,
                      totalActiveDays: avgRow ? (avgRow.totalDays || 0) : 0
                    },
                    breastSides: sideRows,
                    weekly: weeklyRows.reverse(), // chronologically ordered
                    monthly: monthlyRows.reverse()
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// Import bulk data
app.post('/api/records/import', (req, res) => {
  const userId = getUserId(req);
  const { data } = req.body; // array of records: { date, time, amount, breast_side, notes }

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'Data impor tidak valid atau kosong' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const stmt = db.prepare(`
      INSERT INTO asip_records (user_id, date, time, amount, breast_side, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let errorOccurred = false;

    data.forEach((r) => {
      if (!r.date || !r.time || !r.amount || !r.breast_side) {
        errorOccurred = true;
        return;
      }
      stmt.run([userId, r.date, r.time, parseFloat(r.amount), r.breast_side, r.notes || '']);
    });

    stmt.finalize();

    if (errorOccurred) {
      db.run('ROLLBACK');
      return res.status(400).json({ error: 'Format data impor salah. Pastikan tanggal, jam, jumlah, dan sisi payudara terisi.' });
    }

    db.run('COMMIT', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Berhasil mengimpor ${data.length} data ASIP` });
    });
  });
});


// --- BABY DAILY ROUTINE ROUTES ---
app.get('/api/baby', (req, res) => {
  const userId = getUserId(req);
  const { date, month, search } = req.query;

  let query = 'SELECT * FROM baby_records WHERE user_id = ?';
  const params = [userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  } else if (month) {
    query += ' AND date LIKE ?';
    params.push(`${month}%`);
  }

  if (search) {
    query += ' AND notes LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY date DESC, time DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/baby', (req, res) => {
  const userId = getUserId(req);
  const { date, time, bab_count, bak_count, notes } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Tanggal dan jam wajib diisi' });
  }

  db.run(
    'INSERT INTO baby_records (user_id, date, time, bab_count, bak_count, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, date, time, parseInt(bab_count) || 0, parseInt(bak_count) || 0, notes || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        user_id: userId,
        date,
        time,
        bab_count: parseInt(bab_count) || 0,
        bak_count: parseInt(bak_count) || 0,
        notes
      });
    }
  );
});

app.put('/api/baby/:id', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const { date, time, bab_count, bak_count, notes } = req.body;

  db.run(
    'UPDATE baby_records SET date = ?, time = ?, bab_count = ?, bak_count = ?, notes = ? WHERE id = ? AND user_id = ?',
    [date, time, parseInt(bab_count) || 0, parseInt(bak_count) || 0, notes || '', id, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Data tidak ditemukan atau tidak berwenang' });
      }
      res.json({ message: 'Data keseharian bayi berhasil diperbarui' });
    }
  );
});

app.delete('/api/baby/:id', (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  db.run('DELETE FROM baby_records WHERE id = ? AND user_id = ?', [id, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan atau tidak berwenang' });
    }
    res.json({ message: 'Data keseharian bayi berhasil dihapus' });
  });
});

app.get('/api/baby/stats', (req, res) => {
  const userId = getUserId(req);
  const todayStr = new Date().toISOString().split('T')[0];

  db.serialize(() => {
    // Today's total BAB & BAK
    const todayQuery = `
      SELECT SUM(bab_count) as todayBab, SUM(bak_count) as todayBak
      FROM baby_records
      WHERE user_id = ? AND date = ?
    `;

    db.get(todayQuery, [userId, todayStr], (err, todayRow) => {
      if (err) return res.status(500).json({ error: err.message });

      // Weekly trend (last 7 calendar days)
      const weeklyQuery = `
        SELECT date, SUM(bab_count) as bab, SUM(bak_count) as bak
        FROM baby_records
        WHERE user_id = ?
        GROUP BY date
        ORDER BY date DESC
        LIMIT 7
      `;

      db.all(weeklyQuery, [userId], (err, weeklyRows) => {
        if (err) return res.status(500).json({ error: err.message });

        // General overview (Totals, averages)
        const overviewQuery = `
          SELECT 
            SUM(bab_count) as totalBab,
            SUM(bak_count) as totalBak,
            COUNT(DISTINCT date) as totalDays
          FROM baby_records
          WHERE user_id = ?
        `;

        db.get(overviewQuery, [userId], (err, ovRow) => {
          if (err) return res.status(500).json({ error: err.message });

          const totalDays = ovRow ? (ovRow.totalDays || 1) : 1;
          const totalBab = ovRow ? (ovRow.totalBab || 0) : 0;
          const totalBak = ovRow ? (ovRow.totalBak || 0) : 0;

          res.json({
            today: {
              bab: todayRow ? (todayRow.todayBab || 0) : 0,
              bak: todayRow ? (todayRow.todayBak || 0) : 0
            },
            overview: {
              totalBab,
              totalBak,
              totalDays,
              avgDailyBab: (totalBab / totalDays).toFixed(1),
              avgDailyBak: (totalBak / totalDays).toFixed(1)
            },
            weekly: weeklyRows.reverse()
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`ASIP Monitor backend server is running on http://localhost:${PORT}`);
});

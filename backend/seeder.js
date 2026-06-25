const db = require('./db');

const testUser = {
  email: 'ibu@asipmonitor.com',
  password: 'password123',
  name: 'Ibu Luviadi'
};

const breastSides = ['left', 'right', 'both'];
const sampleNotes = [
  'Pumping subuh, produksi melimpah',
  'Setelah minum air hangat dan suplemen',
  'Pumping di sela jam kerja kantor',
  'Payudara terasa kencang sebelum pumping',
  'Sisi kiri agak seret dibanding kanan',
  'Rileks sambil mendengarkan musik',
  'Selesai menyusui langsung (DBF)',
  'Minum booster ASI 1 jam sebelumnya',
  'Pumping malam hari sebelum tidur',
  'Pumping terburu-buru, hasil kurang optimal'
];

db.serialize(() => {
  // Check if test user exists
  db.get('SELECT * FROM users WHERE email = ?', [testUser.email], (err, user) => {
    if (err) {
      console.error('Error seeding database:', err.message);
      return;
    }

    if (user) {
      console.log('Test user already exists. Truncating and re-seeding records for clean prototype...');
      db.run('DELETE FROM asip_records WHERE user_id = ?', [user.id]);
      db.run('DELETE FROM settings WHERE user_id = ?', [user.id]);
      db.run('DELETE FROM notifications WHERE user_id = ?', [user.id]);
      db.run('DELETE FROM baby_records WHERE user_id = ?', [user.id]);
      seedDataForUser(user.id);
    } else {
      // Create user
      db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [testUser.email, testUser.password, testUser.name],
        function (err) {
          if (err) {
            console.error('Error inserting test user:', err.message);
            return;
          }
          console.log('Test user created successfully with ID:', this.lastID);
          seedDataForUser(this.lastID);
        }
      );
    }
  });
});

function seedDataForUser(userId) {
  // Insert default settings
  db.run(
    `INSERT INTO settings (user_id, daily_target, notification_interval, notification_time, notifications_enabled, theme)
     VALUES (?, 1000, 180, '08:00', 1, 'light')`,
    [userId],
    (err) => {
      if (err) console.error('Error inserting settings:', err.message);
      else console.log('Default settings seeded.');
    }
  );

  // Generate 30 days of data ending today
  const today = new Date();
  const records = [];

  for (let i = 29; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);
    const dateString = currentDate.toISOString().split('T')[0];

    // 4 to 6 sessions per day
    const sessionsCount = Math.floor(Math.random() * 3) + 4; 
    const hours = [];
    if (sessionsCount === 4) hours.push('05:30', '10:30', '16:00', '21:30');
    else if (sessionsCount === 5) hours.push('05:00', '09:30', '14:00', '18:30', '22:30');
    else hours.push('02:00', '06:30', '10:30', '14:30', '18:30', '22:30');

    hours.forEach((time) => {
      // Amount per session ranges from 70 to 200 ml, with subuh (early morning) being higher on average
      const isSubuh = parseInt(time.split(':')[0]) < 8;
      const minAmount = isSubuh ? 120 : 70;
      const maxAmount = isSubuh ? 230 : 160;
      const amount = Math.round((Math.random() * (maxAmount - minAmount) + minAmount) / 5) * 5; // rounded to nearest 5ml

      const side = breastSides[Math.floor(Math.random() * breastSides.length)];
      
      // If it's both, volume is typically higher
      const adjustedAmount = side === 'both' ? Math.round(amount * 1.3) : amount;

      const note = Math.random() > 0.3 ? sampleNotes[Math.floor(Math.random() * sampleNotes.length)] : '';

      records.push({
        userId,
        date: dateString,
        time,
        amount: adjustedAmount,
        side,
        note
      });
    });
  }

  // Insert all records into SQLite
  const stmt = db.prepare(`
    INSERT INTO asip_records (user_id, date, time, amount, breast_side, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  records.forEach((r) => {
    stmt.run([r.userId, r.date, r.time, r.amount, r.side, r.note]);
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error finalising records seed:', err.message);
    } else {
      console.log(`Successfully seeded ${records.length} ASIP records for the past 30 days.`);
      
      // Add a couple of simulated notifications
      db.run(
        `INSERT INTO notifications (user_id, type, message, is_read) VALUES 
         (?, 'target_met', 'Selamat! Target produksi harian Anda kemarin (1000ml) tercapai.', 0),
         (?, 'pumping', 'Waktunya pumping sesi berikutnya! (Jadwal: 10:30)', 0)`,
        [userId, userId],
        (err) => {
          if (err) console.error('Error inserting sample notifications:', err.message);
          else console.log('Sample notifications seeded.');
          
          seedBabyRecordsForUser(userId, () => {
            // Close database when seeding completes
            db.close(() => {
              console.log('Database seeding finished. Database connection closed.');
            });
          });
        }
      );
    }
  });
}

function seedBabyRecordsForUser(userId, callback) {
  const today = new Date();
  const babyRecords = [];
  const babyNotes = [
    'Feses normal berwarna kuning keemasan, tekstur lunak.',
    'Pipis cukup banyak, urine jernih.',
    'BAB sedikit padat, bayi mengejan agak lama.',
    'Pipis sedikit pekat, mungkin kurang cairan.',
    'Ganti popok baru, kulit bokong bersih.',
    'BAB cair berbusa sedikit.',
    'BAK melimpah, popok sangat penuh.',
    'Ganti popok kain setelah BAK.',
    'BAB setelah disusui DBF pagi.'
  ];

  for (let i = 29; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);
    const dateString = currentDate.toISOString().split('T')[0];

    // 1 to 2 checks per day
    const entriesCount = Math.floor(Math.random() * 2) + 1;
    const hours = entriesCount === 1 ? ['12:00'] : ['09:00', '19:00'];

    hours.forEach((time) => {
      // Random BAB (0-1), BAK (1-3)
      const bab = Math.random() > 0.4 ? 1 : 0;
      const bak = Math.floor(Math.random() * 3) + 1;
      const note = Math.random() > 0.3 ? babyNotes[Math.floor(Math.random() * babyNotes.length)] : '';

      babyRecords.push({
        userId,
        date: dateString,
        time,
        bab,
        bak,
        note
      });
    });
  }

  const stmt = db.prepare(`
    INSERT INTO baby_records (user_id, date, time, bab_count, bak_count, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  babyRecords.forEach((r) => {
    stmt.run([r.userId, r.date, r.time, r.bab, r.bak, r.note]);
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('Error seeding baby records:', err.message);
    } else {
      console.log(`Successfully seeded ${babyRecords.length} baby daily routine records.`);
    }
    callback();
  });
}

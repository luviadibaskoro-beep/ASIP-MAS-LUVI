/**
 * Utility helpers for exporting to CSV (Excel), printing to PDF,
 * and importing from CSV data.
 */

// Export data to CSV (automatically compatible with Excel via BOM)
export function exportToCSV(records) {
  if (!records || records.length === 0) return;

  const headers = ['Tanggal', 'Jam', 'Jumlah ASIP (ml)', 'Sisi Payudara', 'Catatan'];
  
  const rows = records.map(r => [
    r.date,
    r.time,
    r.amount,
    r.breast_side === 'left' ? 'Kiri' : r.breast_side === 'right' ? 'Kanan' : 'Keduanya',
    `"${(r.notes || '').replace(/"/g, '""')}"` // escape double quotes
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Excel needs UTF-8 BOM (\uFEFF) to display characters and formatting correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ASIP_Monitor_Riwayat_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate print page styled specifically for PDF printing
export function exportToPDF(records, stats = null) {
  const printWindow = window.open('', '_blank');
  
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalProduction = records.reduce((sum, r) => sum + r.amount, 0);
  const avgProduction = records.length > 0 ? Math.round(totalProduction / new Set(records.map(r => r.date)).size) : 0;

  let tableRowsHtml = records.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td class="amount">${r.amount} ml</td>
      <td>${r.breast_side === 'left' ? 'Kiri' : r.breast_side === 'right' ? 'Kanan' : 'Keduanya'}</td>
      <td>${r.notes || '-'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Laporan Produksi ASIP - ASIP Monitor</title>
        <style>
          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #334155;
            padding: 20px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #38bdf8;
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 {
            color: #0284c7;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #64748b;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .summary-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 10px 12px;
            text-align: left;
            font-size: 13px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .amount {
            font-weight: 600;
            color: #0284c7;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>ASIP Monitor</h1>
            <p>Laporan Pemantauan Air Susu Ibu Perah (ASIP)</p>
          </div>
          <div style="text-align: right">
            <p style="font-weight: 600; color: #334155;">Dicetak pada:</p>
            <p>${today}</p>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Produksi Laporan</div>
            <div class="value">${totalProduction} ml</div>
          </div>
          <div class="summary-card">
            <div class="label">Jumlah Sesi Pumping</div>
            <div class="value">${records.length} sesi</div>
          </div>
          <div class="summary-card">
            <div class="label">Rata-rata Harian</div>
            <div class="value">${avgProduction} ml/hari</div>
          </div>
        </div>

        <h2>Detil Catatan Riwayat</h2>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Volume (ml)</th>
              <th>Sisi Payudara</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <p>ASIP Monitor Prototype - Membantu Ibu Memberikan yang Terbaik untuk Buah Hati.</p>
        </div>

        <script>
          // Automatically trigger print dialog on load
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Parses raw CSV text into array of object records
export function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split line by comma, keeping quotes intact (crude parser for simple format)
    // Supports CSV format: date, time, amount, breast_side, notes
    const columns = [];
    let insideQuote = false;
    let currentColumn = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        columns.push(currentColumn.trim());
        currentColumn = '';
      } else {
        currentColumn += char;
      }
    }
    columns.push(currentColumn.trim());

    if (columns.length < 3) continue;

    // Mapping columns back
    const date = columns[0]; // YYYY-MM-DD
    const time = columns[1]; // HH:MM
    const amountVal = parseFloat(columns[2]);
    let breastSideRaw = columns[3] ? columns[3].toLowerCase() : 'both';
    
    // translate breast side to english database terms
    let breast_side = 'both';
    if (breastSideRaw.includes('kir') || breastSideRaw === 'left') breast_side = 'left';
    else if (breastSideRaw.includes('kan') || breastSideRaw === 'right') breast_side = 'right';

    // strip double quotes from notes if any
    let notes = columns[4] || '';
    if (notes.startsWith('"') && notes.endsWith('"')) {
      notes = notes.slice(1, -1).replace(/""/g, '"');
    }

    if (date && time && !isNaN(amountVal)) {
      records.push({
        date,
        time,
        amount: amountVal,
        breast_side,
        notes
      });
    }
  }

  return records;
}

const ExcelJS = require('exceljs');
const fs = require('fs');

(async () => {
  const csv = fs.readFileSync('rates_full.csv', 'utf8');
  const rows = csv.split('\n').filter(r => r.trim());

  // Parse headers + data
  const headers = rows[0].split(',').map(h => h.trim());

  // Add normalized final_weight_kg column after final_weight
  const fwIdx = headers.indexOf('final_weight');
  const newHeaders = [...headers.slice(0, fwIdx + 1), 'final_weight_kg', ...headers.slice(fwIdx + 1)];

  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const vals = parseCSVLine(rows[i]);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });

    // Normalize: DHL + DPSHOPEE + DPKERRY = kg, DPFLASHA/DPFLASHLIVEBULKY = kg, DPTHAIPOST = grams
    const rawFw = parseFloat(obj.final_weight) || 0;
    const courier = obj.courier_code || '';
    if (courier === 'DPTHAIPOST') {
      obj.final_weight_kg = (rawFw / 1000).toFixed(2); // grams -> kg
    } else {
      obj.final_weight_kg = rawFw.toFixed(2); // already kg
    }
    data.push(obj);
  }

  const wb = new ExcelJS.Workbook();

  // ===== Sheet 1: FULL DATA =====
  const ws1 = wb.addWorksheet('Full Data', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });

  // Header style
  const headerStyle = {
    font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    }
  };

  // Number format for prices
  const priceCols = ['cost', 'price', 'shop_price', 'actual_price', 'actual_price_bulky',
    'profit', 'sum_cost', 'sum_price', 'gas_fee', 'remote_area_price', 'remote_area_shop',
    'cost_cod_fee', 'price_cod_fee', 'cost_insurance_fee', 'price_insurance_fee',
    'price_box_shield_fee', 'on_time_price', 'discount_price', 'cost_policies', 'price_policies',
    'final_weight', 'final_weight_kg', 'weight_weight', 'weight_dimension', 'weight_side',
    'weight_kg', 'weight_gram', 'dimension', 'dim_sum', 'remote_area', 'remote_percent', 'dimension_percent',
    'cost_cod_fee_rate'];

  // Define columns with types
  ws1.columns = newHeaders.map(h => ({
    header: h,
    key: h,
    width: Math.max(h.length + 4, 14)
  }));

  // Add header row
  const headerRow = ws1.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
    cell.border = headerStyle.border;
  });
  headerRow.height = 28;

  // Add data
  for (const row of data) {
    ws1.addRow(row);
  }

  // Style data rows
  const dataStyle = {
    border: {
      top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
    }
  };

  ws1.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell, colNum) => {
      cell.border = dataStyle.border;
      cell.alignment = { vertical: 'middle' };
      // Number format for price columns
      if (priceCols.includes(newHeaders[colNum - 1])) {
        cell.numFmt = '#,##0.00';
        try { cell.value = parseFloat(cell.value) || 0; } catch(e) {}
      }
      // Alternating row color
      if (rowNum % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
      }
    });
  });

  // Add autofilter
  ws1.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: data.length + 1, column: headers.length }
  };

  // ===== Sheet 2: PIVOT BKK =====
  const { parse } = csv;

  const ws2 = wb.addWorksheet('Pivot BKK', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }]
  });

  const pivotCsv = fs.readFileSync('rates_pivot_bkk.csv', 'utf8');
  const pivotRows = pivotCsv.split('\n').filter(r => r.trim());
  for (const pr of pivotRows) {
    ws2.addRow(pr.split(','));
  }

  // Style pivot header
  const pivotHeader = ws2.getRow(1);
  pivotHeader.eachCell(cell => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
    cell.border = headerStyle.border;
  });
  pivotHeader.height = 28;

  ws2.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell) => {
      cell.border = dataStyle.border;
      cell.numFmt = '#,##0.00';
      try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {}
      if (rowNum % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
      }
    });
  });

  // Auto-width for pivot
  ws2.columns.forEach(col => { col.width = 16; });
  ws2.getColumn(1).width = 12;

  // ===== Sheet 3: SUMMARY =====
  const ws3 = wb.addWorksheet('Summary', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
  });

  const sumCsv = fs.readFileSync('rates_summary.csv', 'utf8');
  const sumRows = sumCsv.split('\n').filter(r => r.trim());
  for (const sr of sumRows) {
    ws3.addRow(sr.split(','));
  }

  const sumHeader = ws3.getRow(1);
  sumHeader.eachCell(cell => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
    cell.border = headerStyle.border;
  });
  sumHeader.height = 28;

  ws3.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell, colNum) => {
      cell.border = dataStyle.border;
      if (colNum >= 7) { // numeric cols
        cell.numFmt = '#,##0.00';
        try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {}
      }
      if (rowNum % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
      }
    });
  });

  ws3.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: sumRows.length, column: 13 }
  };

  await wb.xlsx.writeFile('rates_full.xlsx');
  console.log('Saved: rates_full.xlsx');
})();

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

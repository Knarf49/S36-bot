const ExcelJS = require('exceljs');
const fs = require('fs');

(async () => {

const allResults = JSON.parse(fs.readFileSync('rates_all_provinces.json', 'utf8'));
console.log(`Loaded ${allResults.length} records`);

const PROVINCES = [...new Set(allResults.map(r => r.destination))].sort((a,b) => a.localeCompare(b, 'th'));

const COURIER_NAME = {
  'DPKERRY': 'Kerry Express',
  'DPTHAIPOST': 'ไปรษณีย์ไทย (EMS)',
  'DPFLASHA': 'Flash Express',
  'DPSHOPEE': 'Shopee Express (SPX)',
  'DPDHL': 'DHL Express',
  'DPFLASHLIVEBULKY': 'Flash Bulky',
};

const ZONE_NAME = {
  'BKK_BKK': 'ในเขต',
  'BKK_OTHER': 'ข้ามเขต',
};

const HEADER_TH = {
  'destination': 'ปลายทาง',
  'courier_code': 'รหัสขนส่ง',
  'courier_name': 'ขนส่ง',
  'shipping_type': 'โซนขนส่ง',
  'pickup_area_type': 'โซน',
  'weight_kg': 'น้ำหนัก(kg)',
  'weight_gram': 'น้ำหนัก(g)',
  'dim_w': 'กว้าง(cm)', 'dim_l': 'ยาว(cm)', 'dim_h': 'สูง(cm)', 'dim_sum': 'รวมมิติ(cm)',
  'final_weight': 'นน.คิดราคา(raw)', 'final_weight_kg': 'นน.คิดราคา(kg)',
  'weight_weight': 'นน.ชั่ง', 'weight_dimension': 'นน.ปริมาตร', 'weight_side': 'นน.ด้าน',
  'cost': 'ราคาทุน', 'price': 'ราคาขาย', 'shop_price': 'ราคาหน้าร้าน',
  'actual_price': 'ราคาขายจริง', 'actual_price_bulky': 'ราคาขายbulky',
  'profit': 'กำไร', 'sum_cost': 'รวมทุน', 'sum_price': 'รวมขาย',
  'gas_fee': 'ค่าน้ำมัน', 'remote_area': 'พื้นที่ห่างไกล', 'remote_area_price': 'ค่าห่างไกล(ทุน)',
  'remote_area_shop': 'ค่าห่างไกล(ขาย)', 'remote_percent': '%ห่างไกล', 'dimension_percent': '%มิติ',
  'cost_cod_fee': 'ค่าCOD(ทุน)', 'price_cod_fee': 'ค่าCOD(ขาย)', 'cost_cod_fee_rate': '%ค่าCOD(ทุน)',
  'cost_insurance_fee': 'ค่าประกัน(ทุน)', 'price_insurance_fee': 'ค่าประกัน(ขาย)',
  'insurance_status': 'สถานะประกัน', 'insurance_message': 'ข้อความประกัน',
  'price_box_shield_fee': 'ค่าประกันกล่อง', 'on_time_price': 'ค่าOnTime',
  'discount_price': 'ส่วนลด', 'cost_policies': 'นโยบาย(ทุน)', 'price_policies': 'นโยบาย(ขาย)',
  'dimension': 'มิติ', 'dst_prov': 'จังหวัด', 'dst_zip': 'รหัสไปรษณีย์',
};

const colOrder = [
  'destination', 'courier_code', 'courier_name', 'shipping_type', 'pickup_area_type',
  'weight_kg', 'weight_gram', 'dim_w', 'dim_l', 'dim_h', 'dim_sum',
  'final_weight', 'final_weight_kg', 'weight_weight', 'weight_dimension', 'weight_side',
  'cost', 'price', 'shop_price', 'actual_price', 'actual_price_bulky',
  'profit', 'sum_cost', 'sum_price',
  'gas_fee', 'remote_area', 'remote_area_price', 'remote_area_shop',
  'remote_percent', 'dimension_percent',
  'cost_cod_fee', 'price_cod_fee', 'cost_cod_fee_rate',
  'cost_insurance_fee', 'price_insurance_fee', 'insurance_status', 'insurance_message',
  'price_box_shield_fee', 'on_time_price', 'discount_price',
  'cost_policies', 'price_policies', 'dimension'
];

const wb = new ExcelJS.Workbook();
wb.creator = 'TwentyExpress Scraper';

// ===== STYLES =====
const headerStyle = {
  font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
};
const borderStyle = {
  border: { top: { style: 'thin', color: { argb: 'FFD9D9D9' } }, bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
    left: { style: 'thin', color: { argb: 'FFD9D9D9' } }, right: { style: 'thin', color: { argb: 'FFD9D9D9' } } }
};

// ===== SHEET 1: FULL DATA =====
const ws1 = wb.addWorksheet('Full Data', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
const thHeaders = colOrder.map(h => HEADER_TH[h] || h);

const hRow1 = ws1.addRow(thHeaders);
hRow1.eachCell(c => { c.font = headerStyle.font; c.fill = headerStyle.fill; c.alignment = headerStyle.alignment; c.border = headerStyle.border; });
hRow1.height = 30;

// Track courier order for pivot sheets
const couriers = [...new Set(allResults.map(r => r.courier_code))].sort();

for (const row of allResults) {
  row.courier_name = COURIER_NAME[row.courier_code] || row.courier_code;
  row.shipping_type = ZONE_NAME[row.shipping_type] || row.shipping_type;
  ws1.addRow(colOrder.map(h => row[h] ?? ''));
}

ws1.eachRow((row, rn) => {
  if (rn === 1) return;
  row.eachCell((cell, cn) => {
    cell.font = { size: 11 };
    cell.border = borderStyle.border;
    cell.alignment = { vertical: 'middle' };
    if (cn >= 8 && cn <= colOrder.length) { cell.numFmt = '#,##0.00'; try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {} }
    if (rn % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
  });
});

for (let i = 0; i < colOrder.length; i++) {
  ws1.getColumn(i + 1).width = Math.max(thHeaders[i].length * 3 + 4, 14);
}
ws1.getColumn(2).width = 12;
ws1.getColumn(3).width = 22;
ws1.getColumn(4).width = 12;

ws1.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + colOrder.length)}${allResults.length + 1}` };

// ===== PIVOT SHEETS =====
for (const [label, weight] of [['Pivot 1kg', 1], ['Pivot 5kg', 5], ['Pivot 10kg', 10]]) {
  const ws = wb.addWorksheet(label, { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] });
  const data = allResults.filter(r => r.weight_kg === weight);

  const pivotHeaders = ['จังหวัด'];
  for (const c of couriers) {
    const name = COURIER_NAME[c] || c;
    pivotHeaders.push(`${name}_ทุน`, `${name}_ขาย`, `${name}_กำไร`);
  }

  const pivotRow = ws.addRow(pivotHeaders);
  pivotRow.eachCell(c => { c.font = headerStyle.font; c.fill = headerStyle.fill; c.alignment = headerStyle.alignment; c.border = headerStyle.border; });
  pivotRow.height = 30;

  for (const prov of PROVINCES) {
    const vals = [prov];
    for (const c of couriers) {
      const d = data.find(r => r.courier_code === c && r.destination === prov);
      vals.push(d ? parseFloat(d.cost) || d.cost : '', d ? parseFloat(d.price) || d.price : '', d ? parseFloat(d.profit) || d.profit : '');
    }
    ws.addRow(vals);
  }

  ws.eachRow((row, rn) => {
    if (rn === 1) return;
    row.eachCell((cell, cn) => {
      cell.font = { size: 11 };
      cell.border = borderStyle.border;
      cell.alignment = { vertical: 'middle', horizontal: cn > 1 ? 'right' : 'left' };
      if (cn > 1) { cell.numFmt = '#,##0.00'; try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {} }
      if (rn % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
    });
  });

  ws.getColumn(1).width = 20;
  for (let i = 2; i <= pivotHeaders.length; i++) ws.getColumn(i).width = 18;
}

await wb.xlsx.writeFile('rates_full_v2.xlsx');
console.log('Saved: rates_full_v2.xlsx');
console.log(`  ${allResults.length} records, ${PROVINCES.length} provinces, ${couriers.length} couriers`);

})();

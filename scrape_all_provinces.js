require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');

// ============================================================
// Thai provinces mapping (sub_district, district, zipcode)
// Using district capitals / known valid addresses
// ============================================================
const PROVINCES = [
  { th: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110' },
  { th: 'กระบี่', sub: 'ปากน้ำ', dist: 'เมืองกระบี่', zip: '81000' },
  { th: 'กาญจนบุรี', sub: 'บ้านเหนือ', dist: 'เมืองกาญจนบุรี', zip: '71000' },
  { th: 'กาฬสินธุ์', sub: 'กาฬสินธุ์', dist: 'เมืองกาฬสินธุ์', zip: '46000' },
  { th: 'กำแพงเพชร', sub: 'ในเมือง', dist: 'เมืองกำแพงเพชร', zip: '62000' },
  { th: 'ขอนแก่น', sub: 'ในเมือง', dist: 'เมืองขอนแก่น', zip: '40000' },
  { th: 'จันทบุรี', sub: 'ตลาด', dist: 'เมืองจันทบุรี', zip: '22000' },
  { th: 'ฉะเชิงเทรา', sub: 'หน้าเมือง', dist: 'เมืองฉะเชิงเทรา', zip: '24000' },
  { th: 'ชลบุรี', sub: 'บางปลาสร้อย', dist: 'เมืองชลบุรี', zip: '20000' },
  { th: 'ชัยนาท', sub: 'ในเมือง', dist: 'เมืองชัยนาท', zip: '17000' },
  { th: 'ชัยภูมิ', sub: 'ในเมือง', dist: 'เมืองชัยภูมิ', zip: '36000' },
  { th: 'ชุมพร', sub: 'ท่าตะเภา', dist: 'เมืองชุมพร', zip: '86000' },
  { th: 'เชียงราย', sub: 'เวียง', dist: 'เมืองเชียงราย', zip: '57000' },
  { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' },
  { th: 'ตรัง', sub: 'ทับเที่ยง', dist: 'เมืองตรัง', zip: '92000' },
  { th: 'ตราด', sub: 'บางพระ', dist: 'เมืองตราด', zip: '23000' },
  { th: 'ตาก', sub: 'ระแหง', dist: 'เมืองตาก', zip: '63000' },
  { th: 'นครนายก', sub: 'นครนายก', dist: 'เมืองนครนายก', zip: '26000' },
  { th: 'นครปฐม', sub: 'พระปฐมเจดีย์', dist: 'เมืองนครปฐม', zip: '73000' },
  { th: 'นครพนม', sub: 'ในเมือง', dist: 'เมืองนครพนม', zip: '48000' },
  { th: 'นครราชสีมา', sub: 'ในเมือง', dist: 'เมืองนครราชสีมา', zip: '30000' },
  { th: 'นครศรีธรรมราช', sub: 'ในเมือง', dist: 'เมืองนครศรีธรรมราช', zip: '80000' },
  { th: 'นครสวรรค์', sub: 'ปากน้ำโพ', dist: 'เมืองนครสวรรค์', zip: '60000' },
  { th: 'นนทบุรี', sub: 'บางกระสอ', dist: 'เมืองนนทบุรี', zip: '11000' },
  { th: 'นราธิวาส', sub: 'บางนาค', dist: 'เมืองนราธิวาส', zip: '96000' },
  { th: 'น่าน', sub: 'ในเวียง', dist: 'เมืองน่าน', zip: '55000' },
  { th: 'บึงกาฬ', sub: 'บึงกาฬ', dist: 'เมืองบึงกาฬ', zip: '38000' },
  { th: 'บุรีรัมย์', sub: 'ในเมือง', dist: 'เมืองบุรีรัมย์', zip: '31000' },
  { th: 'ปทุมธานี', sub: 'คลองหลวง', dist: 'คลองหลวง', zip: '12120' },
  { th: 'ประจวบคีรีขันธ์', sub: 'ประจวบคีรีขันธ์', dist: 'เมืองประจวบคีรีขันธ์', zip: '77000' },
  { th: 'ปราจีนบุรี', sub: 'หน้าเมือง', dist: 'เมืองปราจีนบุรี', zip: '25000' },
  { th: 'ปัตตานี', sub: 'สะบารัง', dist: 'เมืองปัตตานี', zip: '94000' },
  { th: 'พะเยา', sub: 'เวียง', dist: 'เมืองพะเยา', zip: '56000' },
  { th: 'พังงา', sub: 'ท้ายช้าง', dist: 'เมืองพังงา', zip: '82000' },
  { th: 'พัทลุง', sub: 'คูหาสวรรค์', dist: 'เมืองพัทลุง', zip: '93000' },
  { th: 'พิจิตร', sub: 'ในเมือง', dist: 'เมืองพิจิตร', zip: '66000' },
  { th: 'พิษณุโลก', sub: 'ในเมือง', dist: 'เมืองพิษณุโลก', zip: '65000' },
  { th: 'เพชรบุรี', sub: 'ท่าราบ', dist: 'เมืองเพชรบุรี', zip: '76000' },
  { th: 'เพชรบูรณ์', sub: 'ในเมือง', dist: 'เมืองเพชรบูรณ์', zip: '67000' },
  { th: 'แพร่', sub: 'ในเวียง', dist: 'เมืองแพร่', zip: '54000' },
  { th: 'ภูเก็ต', sub: 'ป่าตอง', dist: 'กะทู้', zip: '83150' },
  { th: 'มหาสารคาม', sub: 'ตลาด', dist: 'เมืองมหาสารคาม', zip: '44000' },
  { th: 'มุกดาหาร', sub: 'มุกดาหาร', dist: 'เมืองมุกดาหาร', zip: '49000' },
  { th: 'แม่ฮ่องสอน', sub: 'จองคำ', dist: 'เมืองแม่ฮ่องสอน', zip: '58000' },
  { th: 'ยโสธร', sub: 'ในเมือง', dist: 'เมืองยโสธร', zip: '35000' },
  { th: 'ยะลา', sub: 'สะเตง', dist: 'เมืองยะลา', zip: '95000' },
  { th: 'ร้อยเอ็ด', sub: 'ในเมือง', dist: 'เมืองร้อยเอ็ด', zip: '45000' },
  { th: 'ระนอง', sub: 'เขานิเวศน์', dist: 'เมืองระนอง', zip: '85000' },
  { th: 'ระยอง', sub: 'ท่าประดู่', dist: 'เมืองระยอง', zip: '21000' },
  { th: 'ราชบุรี', sub: 'หน้าเมือง', dist: 'เมืองราชบุรี', zip: '70000' },
  { th: 'ลพบุรี', sub: 'ท่าหิน', dist: 'เมืองลพบุรี', zip: '15000' },
  { th: 'ลำปาง', sub: 'เวียงเหนือ', dist: 'เมืองลำปาง', zip: '52000' },
  { th: 'ลำพูน', sub: 'ในเมือง', dist: 'เมืองลำพูน', zip: '51000' },
  { th: 'เลย', sub: 'กุดป่อง', dist: 'เมืองเลย', zip: '42000' },
  { th: 'ศรีสะเกษ', sub: 'เมืองเหนือ', dist: 'เมืองศรีสะเกษ', zip: '33000' },
  { th: 'สกลนคร', sub: 'ธาตุเชิงชุม', dist: 'เมืองสกลนคร', zip: '47000' },
  { th: 'สงขลา', sub: 'หาดใหญ่', dist: 'หาดใหญ่', zip: '90110' },
  { th: 'สตูล', sub: 'พิมาน', dist: 'เมืองสตูล', zip: '91000' },
  { th: 'สมุทรปราการ', sub: 'ปากน้ำ', dist: 'เมืองสมุทรปราการ', zip: '10270' },
  { th: 'สมุทรสงคราม', sub: 'แม่กลอง', dist: 'เมืองสมุทรสงคราม', zip: '75000' },
  { th: 'สมุทรสาคร', sub: 'มหาชัย', dist: 'เมืองสมุทรสาคร', zip: '74000' },
  { th: 'สระแก้ว', sub: 'สระแก้ว', dist: 'เมืองสระแก้ว', zip: '27000' },
  { th: 'สระบุรี', sub: 'ปากเพรียว', dist: 'เมืองสระบุรี', zip: '18000' },
  { th: 'สิงห์บุรี', sub: 'บางพุทรา', dist: 'เมืองสิงห์บุรี', zip: '16000' },
  { th: 'สุโขทัย', sub: 'ธานี', dist: 'เมืองสุโขทัย', zip: '64000' },
  { th: 'สุพรรณบุรี', sub: 'ท่าพี่เลี้ยง', dist: 'เมืองสุพรรณบุรี', zip: '72000' },
  { th: 'สุราษฎร์ธานี', sub: 'ตลาด', dist: 'เมืองสุราษฎร์ธานี', zip: '84000' },
  { th: 'สุรินทร์', sub: 'ในเมือง', dist: 'เมืองสุรินทร์', zip: '32000' },
  { th: 'หนองคาย', sub: 'ในเมือง', dist: 'เมืองหนองคาย', zip: '43000' },
  { th: 'หนองบัวลำภู', sub: 'หนองบัว', dist: 'เมืองหนองบัวลำภู', zip: '39000' },
  { th: 'อ่างทอง', sub: 'ตลาดหลวง', dist: 'เมืองอ่างทอง', zip: '14000' },
  { th: 'อุดรธานี', sub: 'หมากแข้ง', dist: 'เมืองอุดรธานี', zip: '41000' },
  { th: 'อุตรดิตถ์', sub: 'ท่าอิฐ', dist: 'เมืองอุตรดิตถ์', zip: '53000' },
  { th: 'อุทัยธานี', sub: 'อุทัยใหม่', dist: 'เมืองอุทัยธานี', zip: '61000' },
  { th: 'อุบลราชธานี', sub: 'ในเมือง', dist: 'เมืองอุบลราชธานี', zip: '34000' },
  { th: 'อำนาจเจริญ', sub: 'บุ่ง', dist: 'เมืองอำนาจเจริญ', zip: '37000' },
];

// ============================================================
// Thai header translations
// ============================================================
const HEADER_TH = {
  'destination': 'ปลายทาง',
  'courier_code': 'รหัสขนส่ง',
  'shipping_type': 'ประเภทขนส่ง',
  'pickup_area_type': 'โซน',
  'weight_kg': 'น้ำหนัก(kg)',
  'weight_gram': 'น้ำหนัก(g)',
  'dim_w': 'กว้าง(cm)',
  'dim_l': 'ยาว(cm)',
  'dim_h': 'สูง(cm)',
  'dim_sum': 'รวมมิติ(cm)',
  'final_weight': 'นน.คิดราคา(raw)',
  'final_weight_kg': 'นน.คิดราคา(kg)',
  'weight_weight': 'นน.ชั่ง',
  'weight_dimension': 'นน.ปริมาตร',
  'weight_side': 'นน.ด้าน',
  'cost': 'ราคาทุน',
  'price': 'ราคาขาย',
  'shop_price': 'ราคาหน้าร้าน',
  'actual_price': 'ราคาขายจริง',
  'actual_price_bulky': 'ราคาขายbulky',
  'profit': 'กำไร',
  'sum_cost': 'รวมทุน',
  'sum_price': 'รวมขาย',
  'gas_fee': 'ค่าน้ำมัน',
  'remote_area': 'พื้นที่ห่างไกล',
  'remote_area_price': 'ค่าห่างไกล(ทุน)',
  'remote_area_shop': 'ค่าห่างไกล(ขาย)',
  'remote_percent': '%ห่างไกล',
  'dimension_percent': '%มิติ',
  'cost_cod_fee': 'ค่าCOD(ทุน)',
  'price_cod_fee': 'ค่าCOD(ขาย)',
  'cost_cod_fee_rate': '%ค่าCOD(ทุน)',
  'cost_insurance_fee': 'ค่าประกัน(ทุน)',
  'price_insurance_fee': 'ค่าประกัน(ขาย)',
  'insurance_status': 'สถานะประกัน',
  'insurance_message': 'ข้อความประกัน',
  'price_box_shield_fee': 'ค่าประกันกล่อง',
  'on_time_price': 'ค่าOnTime',
  'discount_price': 'ส่วนลด',
  'cost_policies': 'นโยบาย(ทุน)',
  'price_policies': 'นโยบาย(ขาย)',
  'dimension': 'มิติ',
  'dst_prov': 'จังหวัด',
  'dst_zip': 'รหัสไปรษณีย์',
  'dst_sub': 'ตำบล',
  'dst_dist': 'อำเภอ',
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const xsrf = process.env.TWENTYEXPRESS_XSRF;
  const session = process.env.TWENTYEXPRESS_SESSION;
  if (!xsrf || !session) {
    console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars');
    process.exit(1);
  }
  const cookies = [
    { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/' },
    { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
  ];
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) { console.log('Session expired!'); await browser.close(); process.exit(1); }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  // Test weights: 1kg, 5kg, 10kg (กรัม)
  const testWeights = [
    { gram: 1000, dim: { w: 20, l: 30, h: 10 } },
    { gram: 5000, dim: { w: 30, l: 40, h: 20 } },
    { gram: 10000, dim: { w: 40, l: 50, h: 30 } },
  ];

  const allResults = [];
  let total = PROVINCES.length * testWeights.length;
  let count = 0;

  console.log(`\nScraping ${PROVINCES.length} provinces x ${testWeights.length} weights = ${total} calls...\n`);

  for (const prov of PROVINCES) {
    for (const w of testWeights) {
      count++;
      const kg = w.gram / 1000;

      // Fill form
      await page.evaluate(({ prov, w, dim }) => {
        document.querySelector('#dst_name').value = 'Test';
        document.querySelector('#dst_phone').value = '0812345678';
        document.querySelector('#dst_address').value = '123/4';
        document.querySelector('#dst_sub_district').value = prov.sub;
        document.querySelector('#dst_district').value = prov.dist;
        document.querySelector('#dst_province').value = prov.th;
        document.querySelector('#dst_zipcode').value = prov.zip;
        document.querySelector('#kg_weight').value = w / 1000;
        document.querySelector('#gram_weight').value = w;
        document.querySelector('#weight').value = w;
        document.querySelector('#width').value = dim.w;
        document.querySelector('#length').value = dim.l;
        document.querySelector('#height').value = dim.h;
      }, { prov, w: w.gram, dim: w.dim });

      await page.waitForTimeout(150);

      const result = await page.evaluate((cs) => {
        return new Promise((resolve) => {
          const arr = $('#createOrderForm').serializeArray();
          arr.push({ name: '_token', value: cs });
          $.getJSON('/order/compare-price', $.param(arr))
            .done(data => resolve({ ok: true, data }))
            .fail((j, s, e) => resolve({ ok: false, error: s, status: j.status }));
        });
      }, csrf);

      if (result.ok && Array.isArray(result.data)) {
        for (const cd of result.data) {
          allResults.push({
            destination: prov.th,
            dst_sub: prov.sub,
            dst_dist: prov.dist,
            dst_prov: prov.th,
            dst_zip: prov.zip,
            weight_gram: w.gram,
            weight_kg: kg,
            dim_w: w.dim.w, dim_l: w.dim.l, dim_h: w.dim.h,
            dim_sum: w.dim.w + w.dim.l + w.dim.h,
            courier_code: cd.courier_code,
            shipping_type: cd.shipping_type,
            pickup_area_type: cd.pickup_area_type_check,
            cost: cd.cost,
            price: cd.price,
            shop_price: cd.price_dimension || cd.price,
            actual_price: cd.actual_price,
            actual_price_bulky: cd.actual_price_bulky,
            profit: cd.profit,
            sum_cost: cd.sum_cost,
            sum_price: cd.sum_price,
            final_weight: cd.all_weight?.final_weight,
            weight_weight: cd.weight_weight,
            weight_dimension: cd.weight_dimension,
            weight_side: cd.weight_side,
            gas_fee: cd.gas_fee,
            remote_area: cd.getRemote?.remote_area || cd.remote,
            remote_area_price: cd.getRemote?.remote_area_price || 0,
            remote_area_shop: cd.getRemote?.remote_area_shop || 0,
            remote_percent: cd.remote_percent || 0,
            dimension_percent: cd.dimension_percent || 0,
            cost_cod_fee: cd.cost_cod_fee,
            price_cod_fee: cd.price_cod_fee,
            cost_cod_fee_rate: cd.cost_cod_fee_rate,
            cost_insurance_fee: cd.cost_insurance_fee,
            price_insurance_fee: cd.price_insurance_fee,
            insurance_status: cd.insurance_status,
            insurance_message: cd.insurance_message,
            price_box_shield_fee: cd.price_box_shield_fee,
            on_time_price: cd.on_time_price,
            discount_price: cd.discount_price,
            cost_policies: cd.cost_policies,
            price_policies: cd.price_policies,
            dimension: cd.dimension,
          });
        }
      }

      process.stdout.write(`\r${count}/${total} ${prov.th} ${kg}kg [${result.ok ? result.data.length + ' couriers' : 'FAIL:' + result.error}]`);
      await page.waitForTimeout(300);
    }
  }

  console.log(`\n\nDone. ${allResults.length} total records`);

  // Normalize final_weight_kg
  for (const r of allResults) {
    const rawFw = parseFloat(r.final_weight) || 0;
    if (r.courier_code === 'DPTHAIPOST') {
      r.final_weight_kg = (rawFw / 1000).toFixed(2);
    } else {
      r.final_weight_kg = rawFw.toFixed(2);
    }
  }

  fs.writeFileSync('rates_all_provinces.json', JSON.stringify(allResults, null, 2));

  // ===== Generate XLSX with Thai headers =====
  const ExcelJS = require('exceljs');
  const wb = new ExcelJS.Workbook();

  const colOrder = [
    'destination', 'courier_code', 'shipping_type', 'pickup_area_type',
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

  const thHeaders = colOrder.map(h => HEADER_TH[h] || h);

  // Sheet 1: Full Data
  const ws1 = wb.addWorksheet('Full Data', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  ws1.columns = thHeaders.map(th => ({ header: th, key: th, width: Math.max(th.length * 3 + 4, 14) }));

  const headerStyle = {
    font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Angsana New' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  };

  const headerRow = ws1.getRow(1);
  headerRow.eachCell(cell => Object.assign(cell, headerStyle));
  headerRow.height = 32;

  const priceColsThai = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];

  for (const row of allResults) {
    const vals = colOrder.map(h => row[h] ?? '');
    ws1.addRow(vals);
  }

  const borderStyle = {
    border: { top: { style: 'thin', color: { argb: 'FFD9D9D9' } }, bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } }, right: { style: 'thin', color: { argb: 'FFD9D9D9' } } }
  };

  ws1.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Angsana New', size: 14 };
      cell.border = borderStyle.border;
      cell.alignment = { vertical: 'middle' };
      if (colNum >= 9 && colNum <= 36) {
        cell.numFmt = '#,##0.00';
        try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {}
      }
      if (rowNum % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
      }
    });
  });

  ws1.autoFilter = { from: { row: 1, column: 1 }, to: { row: allResults.length + 1, column: colOrder.length } };

  // Sheet 2: Pivot by province for each courier at 1kg
  const ws2 = wb.addWorksheet('Pivot 1kg', { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] });
  const kg1Data = allResults.filter(r => r.weight_kg === 1);
  const couriers = [...new Set(kg1Data.map(r => r.courier_code))].sort();

  ws2.columns = [{ header: 'จังหวัด', key: 'prov', width: 22 }];
  for (const c of couriers) {
    ws2.columns.push({ header: `${c}_ทุน`, key: `${c}_cost`, width: 14 });
    ws2.columns.push({ header: `${c}_ขาย`, key: `${c}_price`, width: 14 });
    ws2.columns.push({ header: `${c}_กำไร`, key: `${c}_profit`, width: 14 });
  }

  const ws2h = ws2.getRow(1);
  ws2h.eachCell(cell => Object.assign(cell, headerStyle));
  ws2h.height = 32;

  for (const prov of PROVINCES) {
    const row = { prov: prov.th };
    for (const c of couriers) {
      const d = kg1Data.find(r => r.courier_code === c && r.destination === prov.th);
      row[`${c}_cost`] = d ? parseFloat(d.cost) : '';
      row[`${c}_price`] = d ? parseFloat(d.price) : '';
      row[`${c}_profit`] = d ? parseFloat(d.profit) : '';
    }
    ws2.addRow(row);
  }

  ws2.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Angsana New', size: 14 };
      cell.border = borderStyle.border;
      cell.alignment = { vertical: 'middle', horizontal: colNum > 1 ? 'right' : 'left' };
      if (colNum > 1) { cell.numFmt = '#,##0.00'; try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {} }
      if (rowNum % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
    });
  });

  // Sheet 3: Pivot 5kg
  const ws3 = wb.addWorksheet('Pivot 5kg', { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] });
  const kg5Data = allResults.filter(r => r.weight_kg === 5);

  ws3.columns = [{ header: 'จังหวัด', key: 'prov', width: 22 }];
  for (const c of couriers) {
    ws3.columns.push({ header: `${c}_ทุน`, key: `${c}_cost`, width: 14 });
    ws3.columns.push({ header: `${c}_ขาย`, key: `${c}_price`, width: 14 });
    ws3.columns.push({ header: `${c}_กำไร`, key: `${c}_profit`, width: 14 });
  }

  const ws3h = ws3.getRow(1);
  ws3h.eachCell(cell => Object.assign(cell, headerStyle));
  ws3h.height = 32;

  for (const prov of PROVINCES) {
    const row = { prov: prov.th };
    for (const c of couriers) {
      const d = kg5Data.find(r => r.courier_code === c && r.destination === prov.th);
      row[`${c}_cost`] = d ? parseFloat(d.cost) : '';
      row[`${c}_price`] = d ? parseFloat(d.price) : '';
      row[`${c}_profit`] = d ? parseFloat(d.profit) : '';
    }
    ws3.addRow(row);
  }

  ws3.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Angsana New', size: 14 };
      cell.border = borderStyle.border;
      cell.alignment = { vertical: 'middle', horizontal: colNum > 1 ? 'right' : 'left' };
      if (colNum > 1) { cell.numFmt = '#,##0.00'; try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {} }
      if (rowNum % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
    });
  });

  // Sheet 4: Pivot 10kg
  const ws4 = wb.addWorksheet('Pivot 10kg', { views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] });
  const kg10Data = allResults.filter(r => r.weight_kg === 10);

  ws4.columns = [{ header: 'จังหวัด', key: 'prov', width: 22 }];
  for (const c of couriers) {
    ws4.columns.push({ header: `${c}_ทุน`, key: `${c}_cost`, width: 14 });
    ws4.columns.push({ header: `${c}_ขาย`, key: `${c}_price`, width: 14 });
    ws4.columns.push({ header: `${c}_กำไร`, key: `${c}_profit`, width: 14 });
  }

  const ws4h = ws4.getRow(1);
  ws4h.eachCell(cell => Object.assign(cell, headerStyle));
  ws4h.height = 32;

  for (const prov of PROVINCES) {
    const row = { prov: prov.th };
    for (const c of couriers) {
      const d = kg10Data.find(r => r.courier_code === c && r.destination === prov.th);
      row[`${c}_cost`] = d ? parseFloat(d.cost) : '';
      row[`${c}_price`] = d ? parseFloat(d.price) : '';
      row[`${c}_profit`] = d ? parseFloat(d.profit) : '';
    }
    ws4.addRow(row);
  }

  ws4.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Angsana New', size: 14 };
      cell.border = borderStyle.border;
      cell.alignment = { vertical: 'middle', horizontal: colNum > 1 ? 'right' : 'left' };
      if (colNum > 1) { cell.numFmt = '#,##0.00'; try { cell.value = parseFloat(cell.value) || cell.value; } catch(e) {} }
      if (rowNum % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F7FB' } };
    });
  });

  await wb.xlsx.writeFile('rates_full.xlsx');
  console.log('Saved: rates_full.xlsx');

  await browser.close();
  console.log('Done.');
})();

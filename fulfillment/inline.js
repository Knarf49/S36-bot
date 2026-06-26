'use strict';
const functions = require('firebase-functions');

// ── Rate tables (compact) ──────────────────────────────────────
const RT = {DPKERRY:{BKK_BKK:{w:[{k:0.5,c:33,p:45},{k:1,c:36,p:45},{k:2,c:40,p:50},{k:3,c:45,p:60},{k:4,c:58,p:70},{k:5,c:76,p:85},{k:6,c:83,p:95},{k:7,c:88,p:105},{k:8,c:99,p:120},{k:9,c:111,p:125},{k:10,c:122,p:135},{k:12,c:146,p:155},{k:15,c:184,p:195}]},BKK_OTHER:{w:[{k:0.5,c:33,p:45},{k:1,c:36,p:45},{k:2,c:47,p:60},{k:3,c:52,p:70},{k:4,c:63,p:85},{k:5,c:81,p:95},{k:6,c:88,p:105},{k:7,c:98,p:120},{k:8,c:108,p:135},{k:9,c:118,p:145},{k:10,c:131,p:155},{k:12,c:154,p:175},{k:15,c:193,p:210}]}},DPTHAIPOST:{BKK_BKK:{w:[{k:0.5,c:30,p:40},{k:1,c:36,p:45},{k:2,c:44,p:57},{k:3,c:57,p:75},{k:4,c:66,p:89},{k:5,c:79,p:97},{k:6,c:96,p:135},{k:7,c:108,p:145},{k:8,c:120,p:155},{k:9,c:132,p:165},{k:10,c:147,p:175},{k:12,c:180,p:235},{k:15,c:220,p:265}]},BKK_OTHER:{w:[{k:0.5,c:30,p:40},{k:1,c:36,p:45},{k:2,c:44,p:57},{k:3,c:57,p:75},{k:4,c:66,p:89},{k:5,c:79,p:97},{k:6,c:96,p:135},{k:7,c:108,p:145},{k:8,c:120,p:155},{k:9,c:132,p:165},{k:10,c:147,p:175},{k:12,c:180,p:235},{k:15,c:220,p:265}]}},DPFLASHA:{BKK_BKK:{w:[{k:0.5,c:28,p:35},{k:1,c:31,p:35},{k:2,c:35,p:40},{k:3,c:41,p:46},{k:4,c:57,p:63},{k:5,c:92,p:99},{k:6,c:80,p:89},{k:7,c:89,p:99},{k:8,c:103,p:120},{k:9,c:113,p:131},{k:12,c:160,p:183},{k:15,c:190,p:216}],d:[{k:6,c:80,p:89},{k:7,c:89,p:99},{k:8,c:103,p:120},{k:9,c:113,p:131},{k:10,c:130,p:150},{k:11,c:150,p:172},{k:12,c:160,p:183},{k:13,c:170,p:194},{k:14,c:180,p:205},{k:15,c:190,p:216},{k:16,c:205,p:233},{k:17,c:215,p:244}]},BKK_OTHER:{w:[{k:0.5,c:28,p:35},{k:1,c:31,p:35},{k:2,c:35,p:40},{k:3,c:41,p:46},{k:4,c:61,p:66},{k:5,c:92,p:99},{k:6,c:80,p:89},{k:7,c:89,p:99},{k:8,c:103,p:120},{k:9,c:113,p:131},{k:12,c:160,p:183},{k:15,c:190,p:216}],d:[{k:6,c:80,p:89},{k:7,c:89,p:99},{k:8,c:103,p:120},{k:9,c:113,p:131},{k:10,c:130,p:150},{k:11,c:150,p:172},{k:12,c:160,p:183},{k:13,c:170,p:194},{k:14,c:180,p:205},{k:15,c:190,p:216},{k:16,c:205,p:233},{k:17,c:215,p:244}]}},DPSHOPEE:{BKK_BKK:{w:[{k:0.5,c:24,p:30},{k:1,c:27,p:30},{k:2,c:30,p:38},{k:3,c:34,p:43},{k:4,c:46,p:58},{k:5,c:55,p:65},{k:6,c:58,p:73},{k:7,c:66,p:83},{k:8,c:84,p:102},{k:9,c:90,p:110},{k:10,c:101,p:120},{k:12,c:115,p:137},{k:15,c:154,p:168}]},BKK_OTHER:{w:[{k:0.5,c:35,p:40},{k:1,c:38,p:40},{k:2,c:39,p:45},{k:3,c:41,p:47},{k:4,c:46,p:58},{k:5,c:55,p:65},{k:6,c:58,p:73},{k:7,c:66,p:83},{k:8,c:81,p:102},{k:9,c:88,p:110},{k:10,c:99,p:120},{k:12,c:117,p:137},{k:15,c:143,p:163}]}},DPDHL:{BKK_BKK:{w:[{k:0.5,c:30,p:35},{k:1,c:33,p:35},{k:2,c:36,p:41},{k:3,c:41,p:48},{k:4,c:45,p:58},{k:5,c:51,p:60},{k:6,c:71,p:76},{k:7,c:76,p:85},{k:8,c:81,p:92},{k:9,c:88,p:99},{k:12,c:104,p:119},{k:15,c:119,p:135}],d:[{k:5,c:46,p:57},{k:7,c:76,p:85},{k:9,c:88,p:99},{k:12,c:104,p:119},{k:14,c:114,p:129},{k:15,c:119,p:135},{k:16,c:135,p:145},{k:17,c:150,p:162}]},BKK_OTHER:{w:[{k:0.5,c:30,p:35},{k:1,c:33,p:35},{k:2,c:44,p:49},{k:3,c:48,p:56},{k:4,c:52,p:61},{k:5,c:58,p:67},{k:6,c:88,p:95},{k:7,c:92,p:99},{k:8,c:97,p:105},{k:9,c:105,p:110},{k:12,c:129,p:137},{k:15,c:150,p:159}],d:[{k:5,c:55,p:67},{k:7,c:92,p:99},{k:9,c:105,p:110},{k:12,c:129,p:137},{k:14,c:143,p:152},{k:15,c:150,p:159},{k:16,c:171,p:182},{k:17,c:176,p:187}]}},DPFLASHLIVEBULKY:{BKK_BKK:{w:[{k:6,c:60,p:60},{k:7,c:62,p:70},{k:8,c:72,p:80},{k:9,c:82,p:90},{k:10,c:95,p:100},{k:12,c:112,p:120},{k:15,c:142,p:150}],d:[{k:10,c:92,p:100},{k:12,c:112,p:120}]},BKK_OTHER:{w:[{k:6,c:60,p:60},{k:7,c:62,p:70},{k:8,c:72,p:80},{k:9,c:82,p:90},{k:10,c:95,p:100},{k:12,c:112,p:120},{k:15,c:142,p:150}],d:[{k:10,c:92,p:100},{k:12,c:112,p:120}]}}};

const BKK = new Set(['กรุงเทพมหานคร','นนทบุรี','ปทุมธานี','สมุทรปราการ']);
const VOL = {DPKERRY:1/0,DPTHAIPOST:1,DPFLASHA:6000,DPSHOPEE:5000,DPDHL:5000,DPFLASHLIVEBULKY:1/0};

// ── Calculation functions ───────────────────────────────────────
function zn(p) { return BKK.has(p)?'BKK_BKK':'BKK_OTHER'; }

function interp(rows, t) {
  const s = [...rows].sort((a,b)=>a.k-b.k);
  if (s.length===0) return null;
  if (t <= s[0].k) {
    if (s.length===1) return {c:s[0].c,p:s[0].p,e:false};
    const r=(s[1].c-s[0].c)/(s[1].k-s[0].k), pr=(s[1].p-s[0].p)/(s[1].k-s[0].k);
    return {c:Math.round(Math.max(0,s[0].c-r*(s[0].k-t))*100)/100,p:Math.round(Math.max(0,s[0].p-pr*(s[0].k-t))*100)/100,e:false};
  }
  if (t >= s[s.length-1].k) {
    if (s.length===1) return {c:s[0].c,p:s[0].p,e:false};
    const a=s[s.length-2],b=s[s.length-1];
    const r=(b.c-a.c)/(b.k-a.k), pr=(b.p-a.p)/(b.k-a.k);
    return {c:Math.round((b.c+r*(t-b.k))*100)/100,p:Math.round((b.p+pr*(t-b.k))*100)/100,e:false};
  }
  for (let i=0; i<s.length-1; i++) {
    const a=s[i], b=s[i+1];
    if (t>=a.k && t<=b.k) {
      const f=(t-a.k)/(b.k-a.k);
      return {c:Math.round((a.c+(b.c-a.c)*f)*100)/100,p:Math.round((a.p+(b.p-a.p)*f)*100)/100,e:false};
    }
  }
  return null;
}

function volWt(cr, v) {
  const d=VOL[cr];
  if (!isFinite(d)) return 1;
  if (cr==='DPTHAIPOST') return v;
  return Math.ceil(v/d);
}

function sw(cr, ds) {
  if (cr==='DPFLASHA') {if(ds>=135.5)return 17;if(ds>=131.5)return 16;if(ds>=125.5)return 15;if(ds>=121.5)return 14;if(ds>=115.5)return 13;if(ds>=112)return 12;if(ds>=105.5)return 11;if(ds>=100.5)return 10;if(ds>=95.5)return 9;if(ds>=90.5)return 8;if(ds>=85.5)return 7;if(ds>=81.5)return 6;return 1;}
  if (cr==='DPDHL') {if(ds>=135.5)return 17;if(ds>=131.5)return 16;if(ds>=125.5)return 15;if(ds>=121.5)return 14;if(ds>=111.5)return 12;if(ds>=100.5)return 9;if(ds>=90.5)return 7;if(ds>=81.5)return 5;return 1;}
  if (cr==='DPFLASHLIVEBULKY') {if(ds>=120)return Math.max(10,sw('DPFLASHA',ds)-3);return 0;}
  return 1;
}

function fwSide(cr, wKg, w, l, h) {
  const v=w*l*h;
  if (cr==='DPTHAIPOST') return Math.max(Math.ceil(wKg*1000),v)/1000;
  const ac=Math.ceil(wKg), dw=volWt(cr,v), ds=w+l+h, s=sw(cr,ds);
  if (cr==='DPDHL') return Math.max(ac,s);
  if (cr==='DPFLASHLIVEBULKY') return Math.max(ac,s);
  return Math.max(ac,dw,s);
}

function policy(cr, wKg, w, l, h) {
  if (['DPKERRY','DPTHAIPOST','DPSHOPEE'].includes(cr)) return 'w';
  const v=w*l*h, ds=w+l+h, ac=Math.ceil(wKg);
  if (cr==='DPFLASHLIVEBULKY') {return Math.max(ac,sw(cr,ds))>ac?'d':'w';}
  if (cr==='DPFLASHA') {return Math.max(ac,Math.ceil(v/6000),sw(cr,ds))>ac?'d':'w';}
  return Math.max(ac,sw(cr,ds))>ac?'d':'w';
}

function calcPrice(cr, prov, wKg, wCm, lCm, hCm) {
  const wN=Math.ceil(wCm*2)/2, lN=Math.ceil(lCm*2)/2, hN=Math.ceil(hCm*2)/2;
  if (cr==='DPTHAIPOST' && wN*lN*hN > 60000) return {price:null,rejected:true,reason:'ขนาดเกินไปรษณีย์ไทย (ปริมาตร > 60,000 cm³)'};
  const z=zn(prov), ct=RT[cr]; if (!ct) return {price:0,rejected:true,reason:'ไม่พบข้อมูลขนส่ง'};
  const zt=ct[z]; if (!zt) return {price:0,rejected:true,reason:'ไม่มีข้อมูลโซนนี้'};
  const pol=policy(cr,wKg,wN,lN,hN);
  let rows,lk;
  if (pol==='w'||!zt.d) {rows=zt.w;lk=wKg<=0.5?wKg:Math.ceil(wKg);}
  else {rows=zt.d;lk=fwSide(cr,wKg,wN,lN,hN);}
  const r=interp(rows,lk);
  if (!r) return {price:0,rejected:true,reason:'ไม่พบอัตราค่าส่ง'};
  return {price:r.p,rejected:false};
}

function compareAll(prov, wKg, wCm, lCm, hCm) {
  return Object.keys(RT).map(function(c){var r=calcPrice(c,prov,wKg,wCm,lCm,hCm);r.courier=c;return r;}).sort(function(a,b){return (a.price||0)-(b.price||0);});
}

// ── Province normalization ─────────────────────────────────────
const AP = new Set(['กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี','อำนาจเจริญ']);
const PS = {'กทม':'กรุงเทพมหานคร','กรุงเทพ':'กรุงเทพมหานคร','โคราช':'นครราชสีมา','ปากน้ำ':'สมุทรปราการ','หัวหิน':'ประจวบคีรีขันธ์','นครศรี':'นครศรีธรรมราช','สุราษฎร์':'สุราษฎร์ธานี','อุบล':'อุบลราชธานี','อุดร':'อุดรธานี','หาดใหญ่':'สงขลา','พัทยา':'ชลบุรี'};

function normProv(raw) {
  if (!raw) return null;
  const inp=raw.trim();
  if (AP.has(inp)) return inp;
  if (PS[inp]) return PS[inp];
  for (const p of AP) {if(p.toLowerCase()===inp.toLowerCase()) return p;}
  var psKeys=Object.keys(PS); for (var i=0;i<psKeys.length;i++) {var s=psKeys[i];if(s.toLowerCase()===inp.toLowerCase()) return PS[s];}
  for (const p of AP) {if(p.includes(inp)||inp.includes(p)) return p;}
  return null;
}

function pad(n,l,c){c=c||'0';n=String(n);while(n.length<l)n=c+n;return n;}
const H = {M:{o:9,c:18},W:{o:9,c:17}};
function isOpen() {
  const n=new Date();
  const d=n.getDay(), h=n.getHours(), m=n.getMinutes(), t=h+m/60;
  const wk=d>=1&&d<=5, r=wk?H.M:H.W;
  const open=t>=r.o&&t<r.c;
  const dn=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][d];
  const ts=pad(h,2)+':'+pad(m,2);
  return {open,dn,ts,r};
}

// ── Courier names ──────────────────────────────────────────────
const CN = {DPKERRY:'Kerry',DPTHAIPOST:'ไปรษณีย์ไทย',DPFLASHA:'Flash',DPSHOPEE:'Shopee',DPDHL:'DHL',DPFLASHLIVEBULKY:'Flash Bulky'};

function defDim(wKg) {
  const g=wKg*1000;
  if (g<=500) return {w:15,l:20,h:10};
  if (g<=1000) return {w:20,l:30,h:10};
  if (g<=5000) return {w:30,l:40,h:20};
  return {w:40,l:50,h:30};
}

// ── Fulfillment ────────────────────────────────────────────────
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(function(request, response) {
  var qr = (request.body || {}).queryResult || {};
  var intent = qr.intent || {};
  var params = qr.parameters || {};
  var name = intent.displayName || '';
  var text = '';

  if (name === 'ส่งของ') {
    var raw = params.province;
    var w = parseFloat(params.weight) || 0;
    var l = parseFloat(params.length) || 0;
    var wd = parseFloat(params.width) || 0;
    var ht = parseFloat(params.height) || 0;
    if (!raw && !w) { text = 'กรุณาระบุปลายทางและน้ำหนักครับ เช่น "ส่งของไปเชียงใหม่ 5 กิโล"'; }
    else if (!raw) { text = 'กรุณาระบุปลายทางจังหวัดครับ'; }
    else if (!w) { text = 'กรุณาระบุน้ำหนักกี่กิโลกรัมครับ'; }
    else {
      var prov = normProv(String(raw));
      if (!prov) { text = 'ไม่พบจังหวัด "' + raw + '" ครับ'; }
      else {
        var dim = (l && wd && ht) ? {w:wd,l:l,h:ht} : defDim(w);
        var results = compareAll(prov, w, dim.w, dim.l, dim.h);
        var lines = [];
        for (var i = 0; i < results.length; i++) {
          var r = results[i];
          var n = CN[r.courier] || r.courier;
          if (r.rejected) { lines.push('- ' + n + ': ' + String.fromCharCode(10060) + ' ' + r.reason); }
          else { lines.push('- ' + n + ': ' + r.price + ' บาท'); }
        }
        var dsp = prov !== raw ? prov + ' (' + raw + ')' : prov;
        text = 'ค่าส่งไป' + dsp + ' ' + w + ' kg\n' + lines.join('\n');
      }
    }
  } else if (name === 'เช็คเวลาเปิด') {
    var o = isOpen();
    var cs = pad(o.r.c, 2) + ':00';
    if (o.open) { text = 'ขณะนี้ (' + o.dn + ' ' + o.ts + ' น.) ร้านเปิดอยู่ค่ะ ปิด ' + cs + ' น.'; }
    else { text = 'ขณะนี้ (' + o.dn + ' ' + o.ts + ' น.) ร้านปิดแล้วค่ะ เปิดอีกที' + (o.dn === 'เสาร์' || o.dn === 'อาทิตย์' ? 'วันจันทร์' : 'พรุ่งนี้') + ' 09:00 น.'; }
  } else if (name === 'แจ้งเวลาเปิด') {
    text = 'ร้านเปิด จันทร์-ศุกร์ 09:00-18:00 น.\nเสาร์-อาทิตย์ 09:00-17:00 น.';
  } else {
    text = 'ขอโทษค่ะ ไม่เข้าใจคำถาม';
  }

  response.json({ fulfillmentText: text, fulfillmentMessages: [{ text: { text: [text] } }] });
});
    const dsp = prov!==raw?`${prov} (${raw})`:prov;
    agent.add(`ค่าส่งไป${dsp} ${w} kg\n${lines.join('\n')}`);
  }

  function checkTime(agent) {
    const {open,dn,ts,r} = isOpen();
    const cs = pad(r.c,2)+':00';
    if (open) agent.add(`ขณะนี้ (${dn} ${ts} น.) ร้านเปิดอยู่ค่ะ ปิด ${cs} น.`);
    else agent.add(`ขณะนี้ (${dn} ${ts} น.) ร้านปิดแล้วค่ะ เปิดอีกที${dn==='เสาร์'||dn==='อาทิตย์'?'วันจันทร์':'พรุ่งนี้'} 09:00 น.`);
  }

  function tellTime(agent) {
    agent.add('ร้านเปิด จันทร์-ศุกร์ 09:00-18:00 น.\nเสาร์-อาทิตย์ 09:00-17:00 น.');
  }

  let intentMap = new Map();
  intentMap.set('ส่งของ', ship);
  intentMap.set('เช็คเวลาเปิด', checkTime);
  intentMap.set('แจ้งเวลาเปิด', tellTime);
  agent.handleRequest(intentMap);
});

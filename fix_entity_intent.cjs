const df = require('@google-cloud/dialogflow');
const entityClient = new df.EntityTypesClient();
const intentClient = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const parent = `projects/${PROJECT_ID}/agent`;

async function main() {
  // 1. Fix @province entity — add หาดใหญ่ as synonym for สงขลา
  const entityId = '6a3d8c9d-cb27-407e-8f2a-678ecd504a7e';
  const [et] = await entityClient.getEntityType({ name: parent + '/entityTypes/' + entityId, languageCode: 'th' });

  // Add synonyms to existing entries
  const updates = {
    'สงขลา': ['หาดใหญ่'],
    'ชลบุรี': ['พัทยา'],
  };

  let entities = (et.entities || []).map(e => {
    const extra = updates[e.value];
    if (extra) {
      const syns = [...new Set([...(e.synonyms || []), ...extra])];
      return { value: e.value, synonyms: syns };
    }
    return e;
  });

  // Also ensure all 76 are present
  const allProvinces = [
    'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา',
    'ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด',
    'ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี',
    'นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี',
    'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่',
    'ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง',
    'ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร',
    'สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี',
    'สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง',
    'อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี','อำนาจเจริญ'
  ];

  const existing = new Set(entities.map(e => e.value));

  // Build complete entity list with synonyms
  const SYN_MAP = {
    'กรุงเทพมหานคร': ['กทม', 'กรุงเทพ'],
    'นครราชสีมา': ['โคราช'],
    'สมุทรปราการ': ['ปากน้ำ'],
    'ประจวบคีรีขันธ์': ['หัวหิน'],
    'นครศรีธรรมราช': ['นครศรี'],
    'สุราษฎร์ธานี': ['สุราษฎร์'],
    'อุบลราชธานี': ['อุบล'],
    'อุดรธานี': ['อุดร'],
    'สงขลา': ['หาดใหญ่'],
    'ชลบุรี': ['พัทยา'],
  };

  const finalEntities = allProvinces.map(p => ({
    value: p,
    synonyms: SYN_MAP[p] || [p],
  }));

  await entityClient.updateEntityType({
    entityType: {
      name: parent + '/entityTypes/' + entityId,
      displayName: 'province',
      entities: finalEntities,
    },
    updateMask: { paths: ['entities'] },
    languageCode: 'th',
  });
  console.log('Entity updated: 76 provinces, synonyms added');

  // 2. Fix ส่งของ training phrases — remove พัทยา, use ชลบุรี instead
  const intentId = '8c970429-5571-4b80-a438-1bb5f91ec5fb';
  const P = parent + '/entityTypes/' + entityId;
  const N = '@sys.number';
  function T(t) { return { text: t }; }
  function E(t, e, a) { return { text: t, entityType: e, alias: a, userDefined: true }; }
  function tp(parts) { return { parts, type: 'EXAMPLE' }; }

  const phrases = [
    // "ส่งของไป[province] [weight] unit"
    tp([T('ส่งของไป'), E('เชียงใหม่',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
    tp([T('ส่งของไป'), E('ขอนแก่น',P,'province'), T(' '), E('3',N,'weight'), T(' kg')]),
    tp([T('ส่งของไป'), E('ภูเก็ต',P,'province'), T(' '), E('1.5',N,'weight'), T(' โล')]),
    tp([T('ส่งของไป'), E('ชลบุรี',P,'province'), T(' '), E('2',N,'weight'), T(' กิโล')]),
    // "[province] [weight] unit" (bare)
    tp([E('โคราช',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
    tp([E('กรุงเทพ',P,'province'), T(' '), E('2',N,'weight'), T(' kg')]),
    tp([E('เชียงใหม่',P,'province'), T(' '), E('10',N,'weight'), T(' โล')]),
    tp([E('นครปฐม',P,'province'), T(' '), E('1',N,'weight'), T(' kg')]),
    // "ส่งของ [weight] unit ไป [province]"
    tp([T('ส่งของ '), E('1',N,'weight'), T(' กิโล ไป '), E('เชียงราย',P,'province')]),
    tp([T('ส่งของ '), E('5',N,'weight'), T(' kg ไป '), E('กทม',P,'province')]),
    // "[province] ค่าส่ง [weight] โล"
    tp([E('ระยอง',P,'province'), T(' ค่าส่ง '), E('3',N,'weight'), T(' โล')]),
    tp([E('พัทยา',P,'province'), T(' ค่าส่ง '), E('1',N,'weight'), T(' kg')]),
    // "[province] จัดส่ง [weight]"
    tp([E('ลำปาง',P,'province'), T(' '), E('1',N,'weight'), T(' โล เท่าไหร่')]),
    tp([T('จัดส่ง '), E('น่าน',P,'province'), T(' '), E('4',N,'weight'), T(' กิโลกรัม')]),
    tp([T('ค่าส่ง '), E('10',N,'weight'), T(' โล '), E('สุราษฎร์',P,'province')]),
    // New patterns
    tp([T('ส่งพัสดุไป '), E('ตราด',P,'province'), T(' '), E('2',N,'weight'), T(' kg')]),
  ];

  await intentClient.updateIntent({
    intent: {
      name: parent + '/intents/' + intentId,
      trainingPhrases: phrases,
    },
    updateMask: { paths: ['training_phrases'] },
    languageCode: 'th',
  });
  console.log('Intent training phrases updated');
}

main().catch(e => console.error(e.message.slice(0, 300)));

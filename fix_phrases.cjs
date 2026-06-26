const df = require('@google-cloud/dialogflow');
const intentClient = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const parent = `projects/${PROJECT_ID}/agent`;
const intentId = '8c970429-5571-4b80-a438-1bb5f91ec5fb';
const P = parent + '/entityTypes/6a3d8c9d-cb27-407e-8f2a-678ecd504a7e';
const N = '@sys.number';

function T(t) { return { text: t }; }
function E(t, e, a) { return { text: t, entityType: e, alias: a, userDefined: true }; }
function tp(parts) { return { parts, type: 'EXAMPLE' }; }

const phrases = [
  // No-space patterns (province immediately after prefix)
  tp([T('ส่งของไป'), E('เชียงใหม่',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
  tp([T('ส่งของไป'), E('ขอนแก่น',P,'province'), T(' '), E('3',N,'weight'), T(' kg')]),
  tp([T('ส่งของไป'), E('ภูเก็ต',P,'province'), T(' '), E('1',N,'weight'), T(' โล')]),
  tp([T('ส่งของไป'), E('ชลบุรี',P,'province'), T(' '), E('2',N,'weight'), T(' กิโล')]),
  tp([T('ไป'), E('เชียงใหม่',P,'province'), T(' '), E('1',N,'weight'), T(' kg')]),
  tp([T('ไป'), E('กทม',P,'province'), T(' '), E('10',N,'weight'), T(' โล')]),
  tp([E('เชียงใหม่',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
  tp([E('โคราช',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
  tp([E('กรุงเทพ',P,'province'), T(' '), E('3',N,'weight'), T(' kg')]),
  tp([E('ขอนแก่น',P,'province'), T(' '), E('10',N,'weight'), T(' โล')]),
  tp([E('ระยอง',P,'province'), T(' '), E('1',N,'weight'), T(' kg')]),
  tp([E('นครปฐม',P,'province'), T(' '), E('2',N,'weight'), T(' kg')]),
  tp([E('หาดใหญ่',P,'province'), T(' '), E('1.5',N,'weight'), T(' โล')]),
  // Weight first then province
  tp([T('ส่งของ '), E('1',N,'weight'), T(' กิโล ไป '), E('เชียงราย',P,'province')]),
  tp([T('ส่งของ '), E('5',N,'weight'), T(' kg ไป '), E('กทม',P,'province')]),
  tp([T('ค่าส่ง '), E('2',N,'weight'), T(' โล '), E('ภูเก็ต',P,'province')]),
  tp([T('ค่าส่ง '), E('10',N,'weight'), T(' โล '), E('สุราษฎร์',P,'province')]),
  // Province with prefix, weight after
  tp([E('ระยอง',P,'province'), T(' ค่าส่ง '), E('3',N,'weight'), T(' โล')]),
  tp([E('พัทยา',P,'province'), T(' ค่าส่ง '), E('1',N,'weight'), T(' kg')]),
  tp([E('ลำปาง',P,'province'), T(' '), E('1',N,'weight'), T(' โล เท่าไหร่')]),
  tp([T('จัดส่ง '), E('น่าน',P,'province'), T(' '), E('4',N,'weight'), T(' กิโลกรัม')]),
  tp([T('ส่งพัสดุไป '), E('ตราด',P,'province'), T(' '), E('2',N,'weight'), T(' kg')]),
  tp([T('จังหวัด '), E('อุบล',P,'province'), T(' '), E('7',N,'weight'), T(' กิโล')]),
];

intentClient.updateIntent({
  intent: {
    name: parent + '/intents/' + intentId,
    trainingPhrases: phrases,
  },
  updateMask: { paths: ['training_phrases'] },
  languageCode: 'th',
}).then(() => console.log('Updated:', phrases.length, 'training phrases'));

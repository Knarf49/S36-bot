const df = require('@google-cloud/dialogflow');
const client = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const parent = `projects/${PROJECT_ID}/agent`;
const intentId = '8c970429-5571-4b80-a438-1bb5f91ec5fb';
const provinceEntity = `projects/${PROJECT_ID}/agent/entityTypes/6a3d8c9d-cb27-407e-8f2a-678ecd504a7e`;

function T(text) { return { text }; }
function E(text, entity, alias) { return { text, entityType: entity, alias, userDefined: true }; }
function tp(parts) { return { parts, type: 'EXAMPLE' }; }

const P = provinceEntity;
const N = '@sys.number';

const phrases = [
  // Pattern: "ส่งของไป[province] [weight] กิโล"
  tp([T('ส่งของไป'), E('เชียงใหม่',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
  tp([T('ส่งของไป'), E('ขอนแก่น',P,'province'), T(' '), E('3',N,'weight'), T(' kg')]),
  tp([T('ส่งของไป'), E('ภูเก็ต',P,'province'), T(' '), E('1.5',N,'weight'), T(' โล')]),
  // Pattern: "[province] [weight] kg"
  tp([E('โคราช',P,'province'), T(' '), E('5',N,'weight'), T(' กิโล')]),
  tp([E('กรุงเทพ',P,'province'), T(' '), E('2',N,'weight'), T(' kg')]),
  tp([E('เชียงใหม่',P,'province'), T(' '), E('10',N,'weight'), T(' โล')]),
  // Pattern: "ส่งของ [weight] กิโล ไป [province]"
  tp([T('ส่งของ '), E('1',N,'weight'), T(' กิโล ไป '), E('เชียงราย',P,'province')]),
  tp([T('ส่งของ '), E('5',N,'weight'), T(' kg ไป '), E('กทม',P,'province')]),
  // Pattern: "[province] ค่าส่ง [weight] โล"
  tp([E('ระยอง',P,'province'), T(' ค่าส่ง '), E('3',N,'weight'), T(' โล')]),
  tp([E('หาดใหญ่',P,'province'), T(' ค่าส่ง '), E('1',N,'weight'), T(' kg')]),
  // Pattern: "คิดราคา [province] [weight] kg" / จังหวัด [province]
  tp([T('คิดค่าส่ง '), E('พัทยา',P,'province'), T(' '), E('2',N,'weight'), T(' กิโล')]),
  tp([T('จังหวัด '), E('อุบล',P,'province'), T(' ส่งของ '), E('7',N,'weight'), T(' kg')]),
  // Pattern: "[province] เท่าไหร่ [weight] โล"
  tp([E('ลำปาง',P,'province'), T(' '), E('1',N,'weight'), T(' โล เท่าไหร่')]),
  // Pattern: "จัดส่ง [province] [weight] กิโลกรัม"
  tp([T('จัดส่ง '), E('น่าน',P,'province'), T(' '), E('4',N,'weight'), T(' กิโลกรัม')]),
  // Pattern: "ค่าส่ง [weight] โล [province]"
  tp([T('ค่าส่ง '), E('10',N,'weight'), T(' โล '), E('สุราษฎร์',P,'province')]),
];

client.updateIntent({
  intent: {
    name: parent + '/intents/' + intentId,
    displayName: 'ส่งของ',
    trainingPhrases: phrases,
    webhookState: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
    parameters: [
      { displayName: 'province', entityTypeDisplayName: '@province', mandatory: true, value: '$province', prompts: ['ปลายทางจังหวัดอะไรครับ'], isList: false },
      { displayName: 'weight', entityTypeDisplayName: '@sys.number', mandatory: true, value: '$weight', prompts: ['น้ำหนักกี่กิโลกรัมครับ'], isList: false },
      { displayName: 'length', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$length', prompts: [], isList: false },
      { displayName: 'width', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$width', prompts: [], isList: false },
      { displayName: 'height', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$height', prompts: [], isList: false },
    ],
  },
  updateMask: { paths: ['training_phrases', 'parameters', 'webhook_state'] },
  languageCode: 'th',
}).then(() => console.log('Updated OK'));

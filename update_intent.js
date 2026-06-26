const df = require('@google-cloud/dialogflow');
const client = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const parent = `projects/${PROJECT_ID}/agent`;
const intentId = '8c970429-5571-4b80-a438-1bb5f91ec5fb';
const entityPath = `projects/${PROJECT_ID}/agent/entityTypes/6a3d8c9d-cb27-407e-8f2a-678ecd504a7e`;

function tp(partsArr) {
  return { parts: partsArr.map(p => {
    if (typeof p === 'string') return { text: p };
    return { text: p.text, entityType: p.entity, alias: p.alias, userDefined: true };
  }), type: 'EXAMPLE' };
}

const phrases = [
  tp([{text:'ส่งของไป ', entity:entityPath, alias:'province'}, ' น้ำหนัก ', {text:'1', entity:'@sys.number', alias:'weight'}, ' กิโล']),
  tp([{text:'ส่งของไป ', entity:entityPath, alias:'province'}, ' ', {text:'2', entity:'@sys.number', alias:'weight'}, ' kg']),
  tp([{text:''},{text:'โคราช', entity:entityPath, alias:'province'},' ค่าส่ง ',{text:'3', entity:'@sys.number', alias:'weight'},' โล']),
  tp([{text:''},{text:'เชียงใหม่', entity:entityPath, alias:'province'},' ',{text:'5', entity:'@sys.number', alias:'weight'},' กิโล']),
  tp([{text:'คิดราคา '},{text:'หาดใหญ่', entity:entityPath, alias:'province'},' ',{text:'1.5', entity:'@sys.number', alias:'weight'},' kg']),
  tp([{text:'ส่งของ '},{text:'1', entity:'@sys.number', alias:'weight'},' กิโล ไป ',{text:'กทม', entity:entityPath, alias:'province'}]),
  tp([{text:'ค่าส่ง '},{text:'2', entity:'@sys.number', alias:'weight'},' โล ',{text:'ภูเก็ต', entity:entityPath, alias:'province'}]),
  tp([{text:'จัดส่ง '},{text:'10', entity:'@sys.number', alias:'weight'},' กิโลกรัม จังหวัด ',{text:'ขอนแก่น', entity:entityPath, alias:'province'}]),
  tp([{text:''},{text:'เชียงราย', entity:entityPath, alias:'province'},' ',{text:'1', entity:'@sys.number', alias:'weight'},' โล เท่าไหร่']),
  tp([{text:''},{text:'ระยอง', entity:entityPath, alias:'province'},' จัดส่งสินค้า ',{text:'3', entity:'@sys.number', alias:'weight'},' kg']),
];

const params = [
  { displayName: 'province', entityTypeDisplayName: '@province', mandatory: true, value: '$province', prompts: ['ปลายทางจังหวัดอะไรครับ'], isList: false },
  { displayName: 'weight', entityTypeDisplayName: '@sys.number', mandatory: true, value: '$weight', prompts: ['น้ำหนักกี่กิโลกรัมครับ'], isList: false },
  { displayName: 'length', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$length', prompts: [], isList: false },
  { displayName: 'width', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$width', prompts: [], isList: false },
  { displayName: 'height', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$height', prompts: [], isList: false },
];

client.updateIntent({
  intent: {
    name: parent + '/intents/' + intentId,
    displayName: 'ส่งของ',
    webhookState: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
    trainingPhrases: phrases,
    parameters: params
  },
  updateMask: { paths: ['training_phrases', 'parameters', 'webhook_state'] },
  languageCode: 'th'
}).then(() => {
  console.log('Intent updated OK');
}).catch(e => console.log('ERR:', e.message.slice(0,400)))

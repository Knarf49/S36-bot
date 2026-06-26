const df = require('@google-cloud/dialogflow');
const intentClient = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const parent = `projects/${PROJECT_ID}/agent`;
const intentId = '8c970429-5571-4b80-a438-1bb5f91ec5fb';
const ANY = '@sys.any';
const N = '@sys.number';

const T = t => ({ text: t });
const E = (t, e, a) => ({ text: t, entityType: e, alias: a, userDefined: true });
const tp = parts => ({ parts, type: 'EXAMPLE' });

intentClient.updateIntent({
  intent: {
    name: parent + '/intents/' + intentId,
    parameters: [
      { displayName: 'province', entityTypeDisplayName: '@sys.any', mandatory: true, value: '$province', prompts: ['ปลายทางจังหวัดอะไรครับ'], isList: false },
      { displayName: 'weight', entityTypeDisplayName: '@sys.number', mandatory: true, value: '$weight', prompts: ['น้ำหนักกี่กิโลกรัมครับ'], isList: false },
      { displayName: 'length', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$length', prompts: [], isList: false },
      { displayName: 'width', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$width', prompts: [], isList: false },
      { displayName: 'height', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$height', prompts: [], isList: false },
    ],
    trainingPhrases: [
      tp([T('ส่งของไป'),E('เชียงใหม่',ANY,'province'),T(' '),E('5',N,'weight'),T(' กิโล')]),
      tp([T('ส่งของไป'),E('ขอนแก่น',ANY,'province'),T(' '),E('3',N,'weight'),T(' kg')]),
      tp([T('ส่งของไป'),E('ภูเก็ต',ANY,'province'),T(' '),E('1.5',N,'weight'),T(' โล')]),
      tp([T('ส่งของไป'),E('ชลบุรี',ANY,'province'),T(' '),E('2',N,'weight'),T(' กิโล')]),
      tp([T('ไป'),E('กทม',ANY,'province'),T(' '),E('10',N,'weight'),T(' โล')]),
      tp([E('โคราช',ANY,'province'),T(' '),E('5',N,'weight'),T(' กิโล')]),
      tp([E('กรุงเทพ',ANY,'province'),T(' '),E('3',N,'weight'),T(' kg')]),
      tp([T('ส่งของ '),E('1',N,'weight'),T(' กิโล ไป '),E('เชียงใหม่',ANY,'province')]),
      tp([T('ส่งของ '),E('5',N,'weight'),T(' kg ไป '),E('กทม',ANY,'province')]),
      tp([E('ระยอง',ANY,'province'),T(' ค่าส่ง '),E('3',N,'weight'),T(' โล')]),
      tp([T('ค่าส่ง '),E('2',N,'weight'),T(' โล '),E('ภูเก็ต',ANY,'province')]),
      tp([T('จัดส่ง '),E('น่าน',ANY,'province'),T(' '),E('4',N,'weight'),T(' กิโลกรัม')]),
      tp([E('ขอนแก่น',ANY,'province'),T(' '),E('10',N,'weight'),T(' โล')]),
      tp([E('นครปฐม',ANY,'province'),T(' '),E('2',N,'weight'),T(' kg')]),
      tp([E('หาดใหญ่',ANY,'province'),T(' '),E('1.5',N,'weight'),T(' โล')]),
      tp([T('ส่งของ'),E('1',N,'weight'),T('โลไป'),E('เชียงราย',ANY,'province')]),
    ],
  },
  updateMask: { paths: ['parameters', 'training_phrases'] },
  languageCode: 'th',
}).then(() => console.log('Updated with @sys.any'));

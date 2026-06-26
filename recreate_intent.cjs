const df = require('@google-cloud/dialogflow');
const entityClient = new df.EntityTypesClient();
const intentClient = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const parent = `projects/${PROJECT_ID}/agent`;
const entityId = '6a3d8c9d-cb27-407e-8f2a-678ecd504a7e';

async function main() {
  // Enable auto-expansion
  await entityClient.updateEntityType({
    entityType: {
      name: parent + '/entityTypes/' + entityId,
      autoExpansionMode: 'AUTO_EXPANSION_MODE_DEFAULT',
    },
    updateMask: { paths: ['auto_expansion_mode'] },
    languageCode: 'th',
  });
  console.log('Auto-expansion enabled');

  // Delete old intent and recreate
  const oldIntentId = '8c970429-5571-4b80-a438-1bb5f91ec5fb';
  const oldName = parent + '/intents/' + oldIntentId;

  try {
    await intentClient.deleteIntent({ name: oldName });
    console.log('Old intent deleted');
  } catch (e) {
    console.log('Delete skipped:', e.message.slice(0, 100));
  }

  const P = parent + '/entityTypes/' + entityId;
  const N = '@sys.number';
  const T = t => ({ text: t });
  const E = (t, e, a) => ({ text: t, entityType: e, alias: a, userDefined: true });
  const tp = parts => ({ parts, type: 'EXAMPLE' });

  const [newIntent] = await intentClient.createIntent({
    parent,
    intent: {
      displayName: 'ส่งของ',
      webhookState: 'WEBHOOK_STATE_ENABLED_FOR_SLOT_FILLING',
      parameters: [
        { displayName: 'province', entityTypeDisplayName: '@province', mandatory: true, value: '$province', prompts: ['ปลายทางจังหวัดอะไรครับ'], isList: false },
        { displayName: 'weight', entityTypeDisplayName: '@sys.number', mandatory: true, value: '$weight', prompts: ['น้ำหนักกี่กิโลกรัมครับ'], isList: false },
        { displayName: 'length', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$length', prompts: [], isList: false },
        { displayName: 'width', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$width', prompts: [], isList: false },
        { displayName: 'height', entityTypeDisplayName: '@sys.number', mandatory: false, value: '$height', prompts: [], isList: false },
      ],
      trainingPhrases: [
        tp([T('ส่งของไป'),E('เชียงใหม่',P,'province'),T(' '),E('5',N,'weight'),T(' กิโล')]),
        tp([T('ส่งของไป'),E('ขอนแก่น',P,'province'),T(' '),E('3',N,'weight'),T(' kg')]),
        tp([T('ส่งของไป'),E('ภูเก็ต',P,'province'),T(' '),E('1.5',N,'weight'),T(' โล')]),
        tp([T('ส่งของไป'),E('ชลบุรี',P,'province'),T(' '),E('2',N,'weight'),T(' กิโล')]),
        tp([T('ไป'),E('เชียงใหม่',P,'province'),T(' '),E('1',N,'weight'),T(' kg')]),
        tp([T('ไป'),E('กทม',P,'province'),T(' '),E('10',N,'weight'),T(' โล')]),
        tp([E('เชียงใหม่',P,'province'),T(' '),E('5',N,'weight'),T(' กิโล')]),
        tp([E('โคราช',P,'province'),T(' '),E('5',N,'weight'),T(' กิโล')]),
        tp([E('กรุงเทพ',P,'province'),T(' '),E('3',N,'weight'),T(' kg')]),
        tp([E('ขอนแก่น',P,'province'),T(' '),E('10',N,'weight'),T(' โล')]),
        tp([E('นครปฐม',P,'province'),T(' '),E('2',N,'weight'),T(' kg')]),
        tp([T('ส่งของ '),E('1',N,'weight'),T(' กิโล ไป '),E('เชียงราย',P,'province')]),
        tp([T('ส่งของ '),E('5',N,'weight'),T(' kg ไป '),E('กทม',P,'province')]),
        tp([T('ค่าส่ง '),E('2',N,'weight'),T(' โล '),E('ภูเก็ต',P,'province')]),
        tp([E('ระยอง',P,'province'),T(' ค่าส่ง '),E('3',N,'weight'),T(' โล')]),
        tp([T('จัดส่ง '),E('น่าน',P,'province'),T(' '),E('4',N,'weight'),T(' กิโลกรัม')]),
        tp([T('ค่าส่ง '),E('10',N,'weight'),T(' โล '),E('สุราษฎร์',P,'province')]),
        tp([T('ส่งพัสดุไป '),E('ตราด',P,'province'),T(' '),E('2',N,'weight'),T(' kg')]),
        tp([T('จังหวัด '),E('อุบล',P,'province'),T(' '),E('7',N,'weight'),T(' กิโล')]),
        tp([E('ระยอง',P,'province'),T(' '),E('1',N,'weight'),T(' kg')]),
        tp([E('หาดใหญ่',P,'province'),T(' '),E('1.5',N,'weight'),T(' โล')]),
        tp([E('ลำปาง',P,'province'),T(' '),E('1',N,'weight'),T(' โล เท่าไหร่')]),
        tp([T('ส่งของ '),E('5',N,'weight'),T(' kilo '),E('กรุงเทพ',P,'province')]),
        tp([E('ชลบุรี',P,'province'),T(' '),E('3',N,'weight'),T(' kg เท่าไหร่')]),
      ],
    },
    languageCode: 'th',
  });
  console.log('New intent created, ID:', newIntent.name.split('/').pop());
}
main().catch(e => console.error(e.message.slice(0, 300)));

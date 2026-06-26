const df = require('@google-cloud/dialogflow');
const client = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const base = `projects/${PROJECT_ID}/agent/intents/`;
const ids = {
  'เช็คเวลาเปิด': '408e176b-2604-47e1-b772-6c612f621f3e',
  'ส่งของ': '8c970429-5571-4b80-a438-1bb5f91ec5fb',
};

async function main() {
  for (const [name, id] of Object.entries(ids)) {
    const [intent] = await client.getIntent({ name: base + id, intentView: 'INTENT_VIEW_FULL', languageCode: 'th' });
    console.log('=== ' + name + ' (' + intent.trainingPhrases.length + ' phrases) ===');
    intent.trainingPhrases.slice(0, 12).forEach((tp, i) => {
      const parts = tp.parts.map(p => {
        if (p.entityType) return '[' + p.alias + ']' + p.text;
        return p.text;
      }).join('');
      console.log('  ' + i + ': ' + parts);
    });
  }
}
main().catch(e => console.error(e.message.slice(0, 300)));

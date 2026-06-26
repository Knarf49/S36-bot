const df = require('@google-cloud/dialogflow');
const client = new df.IntentsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const path = `projects/${PROJECT_ID}/agent/intents/8c970429-5571-4b80-a438-1bb5f91ec5fb`;

client.getIntent({ name: path, intentView: 'INTENT_VIEW_FULL', languageCode: 'th' }).then(([i]) => {
  console.log('=== Parameters ===');
  console.log(JSON.stringify(i.parameters, null, 2));
  console.log('\n=== First 3 training phrases ===');
  i.trainingPhrases.slice(0, 3).forEach((tp, n) => {
    console.log(n, JSON.stringify(tp.parts, null, 2));
  });
}).catch(e => console.error(e.message.slice(0, 300)));

'use strict';

// Read the full inline.js, mock firebase-functions, test it
const fs = require('fs');
let code = fs.readFileSync('C:/20scrape/fulfillment/inline.js', 'utf8');

// Simulate firebase-functions.https.onRequest by extracting the handler
code = code.replace(
  'const functions = require(\'firebase-functions\');',
  ''
);
code = code.replace(
  'const { WebhookClient } = require(\'dialogflow-fulfillment\');',
  ''
);

// Extract just the handler function from the export
const exportLine = 'exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {';
const handlerStart = code.indexOf(exportLine);
if (handlerStart === -1) { console.log('ERR: export line not found'); process.exit(1); }

// Find the closing of the arrow function (matching parens)
let depth = 0;
let inFn = false;
let fnEnd = -1;
for (let i = handlerStart; i < code.length; i++) {
  if (code[i] === '(' && code[i-1] === 'e') inFn = true;
  if (code[i] === '{') depth++;
  if (code[i] === '}') { depth--; if (depth === 0 && i > handlerStart + 50) { fnEnd = i; break; } }
}

if (fnEnd === -1) { console.log('ERR: could not find handler end'); process.exit(1); }
const body = code.substring(handlerStart + 2 + exportLine.length, fnEnd + 1).replace(') => {', 'function(){') + '}';

// Extract all const/function declarations before handler
const decls = code.substring(0, handlerStart).trim();

// Wrap in test function
const testCode = decls + '\n' + body + '\nreturn typeof compareAll === "function" && typeof isOpen === "function";';

try {
  const ok = eval(testCode);
  if (!ok) { console.log('FAIL: functions not defined'); process.exit(1); }

  // Now simulate webhook calls
  const mockRes = {
    json: function(data) { console.log('RESPONSE:', JSON.stringify(data)); }
  };

  const handler = eval('(' + body + ')');
  
  console.log('\n=== Test 1: เช็คเวลาเปิด ===');
  handler(
    { body: { queryResult: { intent: { displayName: 'เช็คเวลาเปิด' }, parameters: {} } } },
    mockRes
  );

  console.log('\n=== Test 2: ส่งของ (valid) ===');
  handler(
    { body: { queryResult: { intent: { displayName: 'ส่งของ' }, parameters: { province: 'เชียงใหม่', weight: 5 } } } },
    mockRes
  );

  console.log('\n=== Test 3: ส่งของ (missing params) ===');
  handler(
    { body: { queryResult: { intent: { displayName: 'ส่งของ' }, parameters: {} } } },
    mockRes
  );

  console.log('\nOK - no runtime errors');
} catch(e) {
  console.log('RUNTIME ERROR:', e.message);
  console.log(e.stack);
  process.exit(1);
}

const fs = require('fs');
let code = fs.readFileSync('C:/20scrape/fulfillment/inline.js', 'utf8');

// Remove require/exports lines
code = code.replace("'use strict';", '');
code = code.replace("const functions = require('firebase-functions');", '');
code = code.replace("const { WebhookClient } = require('dialogflow-fulfillment');", '');

// Remove the export line and everything after
const expIdx = code.indexOf('exports.dialogflowFirebaseFulfillment');
if (expIdx === -1) { console.log('FAIL: no export found'); process.exit(1); }
code = code.substring(0, expIdx).trim();

// Count braces balance
let depth = 0;
for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') depth++;
  if (code[i] === '}') depth--;
  if (depth < 0) { console.log('Extra } at pos', i, 'char:', JSON.stringify(code.slice(Math.max(0,i-10), i+10))); process.exit(1); }
}
if (depth !== 0) {
  console.log('Unbalanced braces: depth', depth, 'missing', depth, 'closing braces');
  process.exit(1);
}

// Now test eval
try {
  const vm = require('vm');
  const ctx = vm.createContext({ console, Math });
  vm.runInContext(code, ctx);
  
  const fn = ['zn','interp','volWt','sw','fwSide','policy','calcPrice','compareAll','normProv','isOpen','defDim','pad'];
  let ok = true;
  for (const f of fn) {
    if (typeof ctx[f] !== 'function') { console.log('MISSING:', f); ok = false; }
  }
  if (ok) {
    console.log('All', fn.length, 'functions defined');
    // Quick test
    const r = ctx.compareAll('เชียงใหม่', 5, 20, 30, 10);
    console.log('compareAll result:', r.length, 'couriers, cheapest:', r[0].courier, r[0].price, 'บาท');
    console.log('isOpen:', ctx.isOpen().open ? 'open' : 'closed');
    console.log('normProv("กทม"):', ctx.normProv('กทม'));
    console.log('ALL TESTS PASS');
  }
} catch(e) {
  console.log('EVAL ERROR:', e.message);
  console.log('Line:', e.stack.split('\n').slice(0,5).join('\n'));
  process.exit(1);
}

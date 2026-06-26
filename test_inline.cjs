const fs = require('fs');
let code = fs.readFileSync('C:/20scrape/fulfillment/inline.js','utf8');

// Strip firebase/dialogflow imports and export
code = code.replace("const functions = require('firebase-functions');\n",'');
code = code.replace("const { WebhookClient } = require('dialogflow-fulfillment');\n",'');
code = code.replace(/exports\.dialogflowFirebaseFulfillment[\s\S]*/, '');

// Global scope eval
Object.assign(global, (new Function(code))());

const r = compareAll('เชียงใหม่',5,20,30,10);
console.log('เชียงใหม่ 5kg:', r.length, 'couriers');
r.slice(0,3).forEach(x => console.log(' ', x.courier, x.price, 'บาท'));

const r2 = compareAll('กทม',3,15,20,10);
const prov = normProv('กทม');
console.log('กทม→'+prov+':', r2.length, 'couriers');
r2.slice(0,3).forEach(x => console.log(' ', x.courier, x.price, 'บาท'));

console.log('isOpen:', JSON.stringify(isOpen(), null, 2));
console.log('pad test:', pad(9,2), pad(0,1), pad(5,3));
console.log('OK');

import re, hmac, hashlib, base64, json
from pathlib import Path
from linebot.v3 import WebhookHandler
from linebot.v3.exceptions import InvalidSignatureError

p = Path('.env')
text = p.read_text(encoding='utf-8')
m = re.search(r'^LINE_CHANNEL_SECRET=(.+)$', text, re.M)
secret = m.group(1).strip()
body = json.dumps({'events': []}, separators=(',', ':'))
sig = base64.b64encode(hmac.new(secret.encode('utf-8'), body.encode('utf-8'), hashlib.sha256).digest()).decode('utf-8')
print('secret', secret)
print('body', body)
print('sig', sig)
handler = WebhookHandler(secret)
for label, payload in [('str', body), ('bytes', body.encode('utf-8'))]:
    try:
        handler.handle(payload, sig)
        print(label, 'HANDLE_OK')
    except InvalidSignatureError as e:
        print(label, 'HANDLE_INVALID', e)
    except Exception as e:
        print(label, 'HANDLE_ERROR', type(e).__name__, e)

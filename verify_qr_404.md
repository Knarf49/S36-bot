[STATE] user=U989a093ecc794b21fe51352ca54899f5 Python-forced QR, advanced to AWAIT_PAYMENT

/app/line_bot.py:148: LineBotSdkDeprecatedIn30: Call to deprecated method reply_message. (Use 'from linebot.v3.messaging import MessagingApi' and 'MessagingApi(...).reply_message(...)' instead. See https://github.com/line/line-bot-sdk-python/blob/master/README.rst for more details.) -- Deprecated since version 3.0.0.

  line_api.reply_message(

[BOT] QR sent to user=U989a093ecc794b21fe51352ca54899f5 (45 THB)

172.23.0.2 - - [28/Jun/2026 08:45:10] "POST /callback HTTP/1.1" 200 -

172.23.0.2 - - [28/Jun/2026 08:45:10] "GET /qr/U989a093ecc794b21fe51352ca54899f5.1782611109.png HTTP/1.1" 200 -

172.23.0.2 - - [28/Jun/2026 08:45:12] "GET /qr/U989a093ecc794b21fe51352ca54899f5.1782575615.png HTTP/1.1" 404 -

172.23.0.2 - - [28/Jun/2026 08:45:12] "GET /qr/U989a093ecc794b21fe51352ca54899f5.1782575615.png HTTP/1.1" 404 -

172.23.0.2 - - [28/Jun/2026 08:45:12] "GET /qr/U989a093ecc794b21fe51352ca54899f5.1782611109.png HTTP/1.1" 200 -

172.23.0.2 - - [28/Jun/2026 08:45:45] "GET /qr/U989a093ecc794b21fe51352ca54899f5.1782575615.png HTTP/1.1" 404 -

/app/line_bot.py:221: LineBotSdkDeprecatedIn30: Call to deprecated method get_message_content. (Use 'from linebot.v3.messaging import MessagingApiBlob' and 'MessagingApiBlob(...).get_message_content(...)' instead. See https://github.com/line/line-bot-sdk-python/blob/master/README.rst for more details.) -- Deprecated since version 3.0.0.

  content = line_api.get_message_content(msg_id)

/app/line_bot.py:238: LineBotSdkDeprecatedIn30: Call to deprecated method reply_message. (Use 'from linebot.v3.messaging import MessagingApi' and 'MessagingApi(...).reply_message(...)' instead. See https://github.com/line/line-bot-sdk-python/blob/master/README.rst for more details.) -- Deprecated since version 3.0.0.

  line_api.reply_message(event.reply_token, TextSendMessage(text="เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ"))

172.23.0.2 - - [28/Jun/2026 08:45:53] "POST /callback HTTP/1.1" 200 -
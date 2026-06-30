"""
test_slip_verify.py — Standalone slip verification test
Tests verify_slip_via_slip2go() directly — no bot, no Ollama.

Usage:
  $env:SLIP2GO_API_KEY = "your-key-here"
  python test_slip_verify.py C:/Users/Frank/Downloads/test_slip.jpg 85

  # TEST_MODE bypasses Slip2Go API (no key needed):
  $env:TEST_MODE = "1"
  python test_slip_verify.py test_slip.jpg 85
"""
import base64
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from tools_agent import verify_slip_via_slip2go, SLIP2GO_API_KEY, TEST_MODE


def main():
    if len(sys.argv) < 3:
        print("Usage: python test_slip_verify.py <image_path> <expected_amount>")
        print("  e.g. python test_slip_verify.py C:\\Users\\Frank\\Downloads\\test_slip.jpg 85")
        print()
        print("Env vars:")
        print(f"  SLIP2GO_API_KEY = {'***' + SLIP2GO_API_KEY[-4:] if SLIP2GO_API_KEY else '(not set)'}")
        print(f"  TEST_MODE        = {TEST_MODE}")
        sys.exit(1)

    image_path = sys.argv[1]
    try:
        expected = float(sys.argv[2])
    except ValueError:
        print(f"Invalid amount: {sys.argv[2]}")
        sys.exit(1)

    if not os.path.isfile(image_path):
        print(f"File not found: {image_path}")
        sys.exit(1)

    with open(image_path, 'rb') as f:
        img_bytes = f.read()
    img_b64 = base64.b64encode(img_bytes).decode('utf-8')
    print(f"Loaded: {image_path} ({len(img_bytes)} bytes)")
    print(f"Expected amount: {expected:.2f} THB")
    print()

    if TEST_MODE:
        print("=" * 50)
        print("TEST MODE — skipping Slip2Go API")
        print("=" * 50)
        print(f"VERIFIED_OK (test mode)")
        print(f"Amount: {expected:.2f} THB")
        print(f"SLIP_OCR_AMOUNT:{expected}|SLIP_OCR_CONFIDENCE:1.0|SLIP_OCR_RAW:test_mode|SLIP_TRANSFER_DATETIME:")
        return

    if not SLIP2GO_API_KEY:
        print("ERROR: SLIP2GO_API_KEY not set.")
        print("Set it via: $env:SLIP2GO_API_KEY = 'your-key'")
        print("Or use TEST_MODE: $env:TEST_MODE = '1'")
        sys.exit(1)

    print("Calling Slip2Go API...")
    r = verify_slip_via_slip2go(img_b64, expected)

    print()
    print("=" * 50)
    print("Slip2Go Response")
    print("=" * 50)
    print(f"  code:          {r['code']}")
    print(f"  message:       {r['message']}")
    print(f"  success:       {r['success']}")
    print(f"  amount:        {r['amount']:.2f} THB (expected {expected:.2f})")
    print(f"  dateTime:      {r['dateTime']}")
    print(f"  referenceId:   {r['referenceId']}")
    print(f"  transRef:      {r['transRef']}")
    print(f"  sender:        {r['sender_name']}")
    print(f"  sender_bank:   {r['sender_bank']}")
    print(f"  receiver:      {r['receiver_name']}")
    print(f"  receiver_bank: {r['receiver_bank']}")
    print()
    print(f"  fraud:         {r['fraud']}")
    print(f"  duplicate:     {r['duplicate']}")
    print(f"  amount_mismatch: {r['amount_mismatch']}")
    print(f"  receiver_mismatch: {r['receiver_mismatch']}")
    print()
    print("=" * 50)

    if r['code'] == 'api_error':
        print(f"VERDICT: ERROR — {r['reason']}")
    elif r['code'] == 'no_api_key':
        print("VERDICT: ERROR — API key not set")
    elif r['fraud']:
        print("VERDICT: VERIFIED_PENDING — FRAUD DETECTED")
    elif r['duplicate']:
        print("VERDICT: VERIFIED_PENDING — DUPLICATE SLIP")
    elif r['amount_mismatch']:
        print("VERDICT: VERIFIED_PENDING — AMOUNT MISMATCH")
    elif r['receiver_mismatch']:
        print("VERDICT: VERIFIED_PENDING — WRONG RECEIVER")
    elif r['success']:
        print("VERDICT: VERIFIED_OK — would auto-create order")
    else:
        print(f"VERDICT: VERIFIED_PENDING — {r['message']}")


if __name__ == '__main__':
    main()

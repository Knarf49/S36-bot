import unittest
from image_utils import normalize_binary_payload


class NormalizeBinaryPayloadTests(unittest.TestCase):
    def test_bytes_payload(self):
        self.assertEqual(normalize_binary_payload(b"abc"), b"abc")

    def test_string_payload(self):
        self.assertEqual(normalize_binary_payload("abc"), b"abc")

    def test_iter_content_payload(self):
        class Payload:
            def iter_content(self):
                yield b"ab"
                yield b"c"

        self.assertEqual(normalize_binary_payload(Payload()), b"abc")

    def test_read_payload(self):
        class Payload:
            def read(self):
                return b"xyz"

        self.assertEqual(normalize_binary_payload(Payload()), b"xyz")


if __name__ == "__main__":
    unittest.main()

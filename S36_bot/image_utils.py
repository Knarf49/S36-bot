def normalize_binary_payload(payload):
    if payload is None:
        return b""

    if isinstance(payload, (bytes, bytearray)):
        return bytes(payload)

    if isinstance(payload, str):
        return payload.encode("utf-8")

    if hasattr(payload, "read"):
        try:
            data = payload.read()
        except Exception:
            return b""
        return normalize_binary_payload(data)

    if hasattr(payload, "content"):
        return normalize_binary_payload(payload.content)

    if hasattr(payload, "body"):
        return normalize_binary_payload(payload.body)

    if hasattr(payload, "data"):
        return normalize_binary_payload(payload.data)

    if hasattr(payload, "iter_content"):
        try:
            chunks = []
            for chunk in payload.iter_content():
                if chunk:
                    chunks.append(chunk)
            return b"".join(chunks)
        except Exception:
            return b""

    return b""

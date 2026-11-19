---
title: "Padding at the Boundary: An Interactive Oracle Decryption"
slug: "padding-boundary-oracle"
date: "2026-11-19"
description: "A cryptographic walkthrough of exploiting a CBC-mode padding oracle vulnerability to decrypt ciphertext byte by byte without the key."
platform: "Illustrative cryptography lab"
category: "crypto"
difficulty: "medium"
tags:
  - cbc-padding-oracle
  - cryptography
  - bit-flipping
  - python
  - ctf
published: true
---

This walkthrough uses an illustrative CBC padding-oracle protocol. The cookie format, HTTP status codes, and error messages below define an assumed server contract; they are not recorded observations from an independently replayed challenge. Local verification checks the block-recovery algorithm against a simulated oracle, not an HTTP service.

## The oracle on the wire

In this example, the application exposes an authenticated session token inside an HTTP cookie. The cookie is a hexadecimal string containing an Initialization Vector (IV) concatenated with multiple blocks of ciphertext. We are given no access to the symmetric AES encryption key.

Assume that requests with tampered cookies produce two distinctly different behaviors:

1. **Tampered with invalid padding**: The server responds with `HTTP 500 Internal Server Error` and a message body containing `PKCS#7 padding validation failure`.
2. **Tampered with valid padding**: The server responds with `HTTP 403 Forbidden` and a message body stating `Decrypted session signature is invalid`.

That difference is a classic padding oracle. The server decrypts the ciphertext using its private AES key, validates the PKCS#7 padding, and only then passes the decrypted bytes to the session deserializer. By distinguishing padding errors from signature errors, the server leaks a single bit of information: *did the modified ciphertext decrypt to valid PKCS#7 padding?*

## Mechanics of Cipher Block Chaining (CBC)

In CBC mode, plaintext block `P_i` is encrypted by first XORing it with the previous ciphertext block `C_{i-1}` (or the IV for the first block `C_0`), and then passing the result through the block cipher primitive `E_K`:

`C_i = E_K(P_i  XOR  C_{i-1})`

During decryption, the reverse operation occurs:

`I_i = D_K(C_i)`
`P_i = I_i  XOR  C_{i-1}`

Here, `I_i` denotes the intermediate state directly output by the raw block cipher decryption before XORing with the preceding block. The critical security insight is that **`I_i` depends solely on key `K` and ciphertext block `C_i`**. If we alter the preceding block `C_{i-1}`, we directly and linearly control what value `P_i` assumes after the XOR operation.

## Recovering intermediate bytes

PKCS#7 padding appends `N` bytes of value `N` to pad a block to 16 bytes. A valid one-byte pad ends in `0x01`. A valid two-byte pad ends in `0x02 0x02`, and so forth.

To recover the last byte of intermediate state `I_i[15]`:

1. Send a two-block ciphertext consisting of an attacker-crafted block `C'_{i-1}` followed by the target ciphertext block `C_i`.
2. Iterate through all possible byte guesses `g  in  [0, 255]` for `C'_{i-1}[15]`.
3. When the oracle returns `HTTP 403` instead of `HTTP 500`, we know:

`P'_i[15] = I_i[15]  XOR  g = 0x01  =>  I_i[15] = g  XOR  0x01`

Once `I_i[15]` is known, we can recover the true plaintext byte from the original ciphertext block:

`P_i[15] = I_i[15]  XOR  C_{i-1}[15]`

To decrypt the second-to-last byte `P_i[14]`, we set `C'_{i-1}[15] = I_i[15]  XOR  0x02` to ensure the last byte decrypts to `0x02`, and then brute-force `C'_{i-1}[14]` across 256 values until the oracle signals valid padding of `0x02 0x02`.

Repeating this across all 16 bytes allows us to recover the entire plaintext of block `C_i` with up to `16  x  256 = 4096` primary guesses per block, plus confirmation probes, avoiding any `2^{128}` brute-force of the key.

## Block-recovery example

The following function illustrates recovery of one block under the response contract above. It does not parse a complete token, invoke recovery across all blocks, or remove final padding. The hostname is illustrative; this page does not provide an independently replayed challenge result.

```python
import requests

TARGET_URL = "http://localhost:8080/dashboard"
BLOCK_SIZE = 16

def is_padding_valid(crafted_iv: bytes, target_block: bytes) -> bool:
    payload = (crafted_iv + target_block).hex()
    cookies = {"session": payload}
    response = requests.get(TARGET_URL, cookies=cookies)
    # 403 indicates padding passed, but authentication failed
    return response.status_code == 403

def decrypt_block(c_prev: bytes, c_curr: bytes) -> bytes:
    intermediate = bytearray(BLOCK_SIZE)
    plaintext = bytearray(BLOCK_SIZE)

    for byte_idx in reversed(range(BLOCK_SIZE)):
        pad_val = BLOCK_SIZE - byte_idx
        crafted_prev = bytearray(BLOCK_SIZE)

        # Set already-recovered bytes to produce the desired pad_val
        for k in range(byte_idx + 1, BLOCK_SIZE):
            crafted_prev[k] = intermediate[k] ^ pad_val

        found = False
        for guess in range(256):
            crafted_prev[byte_idx] = guess
            if is_padding_valid(bytes(crafted_prev), c_curr):
                if pad_val == 1:
                    # A longer valid padding suffix is also possible. A true
                    # one-byte pad survives a change to the preceding byte.
                    probe = bytearray(crafted_prev)
                    probe[byte_idx - 1] ^= 1
                    if not is_padding_valid(bytes(probe), c_curr):
                        continue
                intermediate[byte_idx] = guess ^ pad_val
                plaintext[byte_idx] = intermediate[byte_idx] ^ c_prev[byte_idx]
                found = True
                break

        if not found:
            raise ValueError(f"Oracle failed to find valid padding for byte {byte_idx}")

    return bytes(plaintext)
```

## Remediation and cryptographic design

Padding oracle attacks succeed because the system performs unauthenticated decryption and leaks whether formatting checks succeeded prior to authentication.

1. **Use Authenticated Encryption (AEAD)**: Replace unauthenticated CBC mode with AES-GCM or ChaCha20-Poly1305. In AEAD modes, ciphertext tampering causes the cryptographic authentication tag verification to fail immediately, preventing any decryption or padding inspection from executing.
2. **Encrypt-then-MAC**: If legacy CBC mode cannot be avoided, compute an HMAC-SHA256 over the ciphertext and IV using an independent MAC key. Verify the HMAC in constant time before decrypting.
3. **Uniform Error Handling**: Never expose distinguishing HTTP status codes, error messages, or timing variations between padding failures and application verification errors.

## References

- [Bleichenbacher's Attack on PKCS #1 v1.5](https://link.springer.com/chapter/10.1007/BFb0055716)
- [Vaudenay, S. Security Flaws Induced by CBC Padding](https://www.iacr.org/cryptodb/data/paper.php?pubkey=1534)

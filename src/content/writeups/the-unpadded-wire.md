---
title: "The Unpadded Wire"
slug: "the-unpadded-wire"
date: "2026-11-19"
description: "An offline CTF puzzle about finding character boundaries in a string of bits with no separators."
category: "misc"
difficulty: "easy"
tags:
  - ascii
  - binary-encoding
  - ctf
published: true
---

## The dump

In this practice puzzle, a fictional terminal emits a flag in the form `FLAG{...}`. Its diagnostic dump starts at the first bit of the first character and ends at the last bit of the final one. Every character occupies the same number of bits, most significant bit first. The line breaks are there for display.

```text
1000110100110010000011000111111101111100111100101
1110110110010111011101011111110001011010011110100
1011111110000111100111100011110100111010011011111
1100110111001011000011101101110010111100111111101
```

Try finding a character width that fits the whole dump and gives the expected flag prefix.

## Count before decoding

There are 196 bits. Groups of eight leave four bits behind, and the first eight bits, `10001101`, give `0x8D`. That value falls outside ASCII. Padding the last group would leave the first character just as wrong.

ASCII defines 128 values using seven bits. In an eight-bit byte, the upper bit is zero for those values. The puzzle packs seven bits per character without adding that zero. Seven divides 196 evenly. The first five groups show why that width is worth testing.

```text
1000110  1001100  1000001  1000111  1111011
   F        L        A        G        {
```

## Read the rest at the same width

```python
bits = (
    "1000110100110010000011000111111101111100111100101"
    "1110110110010111011101011111110001011010011110100"
    "1011111110000111100111100011110100111010011011111"
    "1100110111001011000011101101110010111100111111101"
)

width = 7
assert len(bits) % width == 0
flag = "".join(
    chr(int(bits[start : start + width], 2))
    for start in range(0, len(bits), width)
)
assert "".join(f"{ord(char):07b}" for char in flag) == bits
print(flag)
```

```text
FLAG{seven_bit_ascii_frames}
```

The length gave us a plausible width. The expected prefix, a readable message, and the closing brace gave us reasons to keep it. Repacking the decoded characters checks that no bits were lost along the way.

[RFC 20, section 3 — ASCII character representation](https://www.rfc-editor.org/rfc/rfc20.html).

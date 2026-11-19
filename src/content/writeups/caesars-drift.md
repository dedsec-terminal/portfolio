---
title: "Caesar's Drift"
slug: "caesars-drift"
date: "2026-11-19"
description: "An offline CTF puzzle where a familiar flag prefix gives away a fixed alphabet shift."
category: "crypto"
difficulty: "easy"
tags:
  - classical-cipher
  - known-plaintext
  - ctf
published: true
---

## The message

This practice puzzle gives you one line from a fictional beacon. Every letter moved by the same number of places in the alphabet. Case and punctuation were preserved, and the original message had the format `FLAG{...}`.

```text
MSHN{yvahapvuz_ylclhs_aol_zpnuhs}
```

Try finding the shift from the first four characters before reading the solution.

## The prefix gives you a test

Start with `F` and `M`. With `A` at position `0`, `F` is at `5` and `M` is at `12`. The difference is `7`. That gives us a candidate shift.

The rest of the prefix is a check. `L` moves to `S`, `A` moves to `H`, and `G` moves to `N` by the same seven positions. A single match could be a coincidence if the cipher were unknown. All four match the fixed shift described in the prompt.

## Walk the alphabet back

Subtract seven from each letter's position and wrap at the start of the alphabet. The `a` in `yvahapvuz` is a good check for wraparound. Its index is zero, so `(0 - 7) % 26` gives `19`, or `t`. The first three letters become `rot`.

Python's translation table keeps the case and leaves characters outside the two alphabets alone. Reversing the table regenerates the original line and checks that we preserved every character.

```python
from string import ascii_lowercase, ascii_uppercase

message = "MSHN{yvahapvuz_ylclhs_aol_zpnuhs}"
shift = 7
letters = ascii_uppercase + ascii_lowercase
shifted_uppercase = ascii_uppercase[shift:] + ascii_uppercase[:shift]
shifted_lowercase = ascii_lowercase[shift:] + ascii_lowercase[:shift]
shifted = shifted_uppercase + shifted_lowercase

flag = message.translate(str.maketrans(shifted, letters))
assert flag.translate(str.maketrans(letters, shifted)) == message
print(flag)
```

```text
FLAG{rotations_reveal_the_signal}
```

The wrapper is the most useful part of the puzzle. Four letters we already know give us one rule we can check against the entire message.

---
title: "Breaking the Interpreter: Python Jailbreak via Class Hierarchy"
slug: "breaking-python-jail-mro"
date: "2026-11-19"
description: "Bypassing restrictive Python evaluation filters by traversing the Method Resolution Order and class hierarchy to reconstruct execution primitives."
platform: "PicoCTF"
challenge: "PyJail: Strict Sandbox"
category: "misc"
difficulty: "medium"
tags:
  - python-sandbox
  - jailbreak
  - mro-traversal
  - pwn
  - ctf
published: true
---

## The caged shell

The target service accepts Python expressions over a TCP socket, runs them through an AST validator, and executes them via `eval()` inside a restricted namespace where `__builtins__` has been stripped to `None`:

```python
restricted_env = {"__builtins__": None}
user_input = sys.stdin.readline().strip()

if any(keyword in user_input for keyword in ["import", "os", "sys", "eval", "exec", "open", "read", "system", "_"]):
    print("Rejected: forbidden token detected.")
    exit(1)

eval(user_input, restricted_env)
```

The challenge blocks common introspection primitives by denying underscores, standard library module names, and explicit file I/O keywords. However, the runtime Python process remains a standard CPython 3.12 interpreter where every object inherently links back to the base `object` class.

## Traversing Python object inheritance

In Python, every instance carries metadata referencing its type and inheritance hierarchy. Even when builtins are obliterated from the evaluation dictionary, instances of primitive literals (such as empty tuples, strings, or dictionaries) retain their internal type pointers.

1. **Reaching the type**: An empty tuple literal `()` has the type `tuple`.
2. **Reaching the base object**: `tuple` inherits directly from `object`, the root of Python's single-inheritance hierarchy.
3. **Enumerating subclasses**: Calling `object.__subclasses__()` returns a list of every class currently instantiated within the interpreter's memory space.

Because underscores (`_`) are blocked by the filter, we cannot directly type `().__class__.__base__.__subclasses__()`. The challenge therefore splits into two distinct tasks: bypassing the character filter to retrieve attribute names, and locating an imported module capable of spawning commands or reading files.

## Bypassing character filters

CPython dictionaries and object dictionaries can be indexed dynamically. Without literal underscores, we can produce underscore characters and arbitrary attribute strings through several alternative avenues:

### Method 1: Format string extraction and chr conversions

Python's built-in format specifiers or byte conversions can generate strings without quoting them directly:

```python
# Utilizing string formatting or built-in representation methods
# When underscores are blocked, we can use URL decoding, octal escapes in byte literals,
# or int.to_bytes() conversions:
underscore = bytes([95]).decode()  # Produces '_'
```

### Method 2: Attribute resolution via getattr alternatives

When `getattr` is absent from globals, we can leverage built-in methods on strings, or access attributes via dunder dictionaries if we recover access to `builtins`.

In Python, the `wrap_close` class (used by `os._wrap_close` during file operations) or the `warnings.catch_warnings` class resides in memory in standard interpreter initializations. Inspecting `object.__subclasses__()` yields indices that contain references to external modules inside their `__init__.__globals__`.

## Finding the execution vector

To identify which subclass index contains the target module reference, we can write an offline inspection script targeting the identical Python version:

```python
target_index = None
for idx, cls in enumerate(object.__subclasses__()):
    name = f"{cls.__module__}.{cls.__name__}"
    if "wrap_close" in name or "Popen" in name:
        target_index = idx
        print(f"Candidate found at index {idx}: {name}")
        break
```

Once the candidate index is found (for instance, `os._wrap_close`), its `__init__.__globals__` mapping provides direct access to the `sys` and `os` modules. From there, invoking `system("sh")` or `popen("cat flag.txt").read()` restores unrestricted shell execution.

```python
# Conceptual payload structure once attribute names are assembled:
# ().__class__.__bases__[0].__subclasses__()[137].__init__.__globals__['system']('id')
```

## Sandboxing lessons

The root failure of interpreter sandboxing lies in treating a general-purpose programming language as an isolation boundary.

1. **AST filters do not constrain runtime semantics**: In dynamic languages, attribute resolution, string generation, and object navigation can be obscured in near-infinite ways. Filter lists invariably fall victim to missing edge cases.
2. **True isolation requires OS-level boundaries**: Executing untrusted user code safely requires operating system primitives: Linux `seccomp-bpf` filters, unprivileged user namespaces, cgroups, or lightweight isolation environments such as WebAssembly sandboxes (e.g., Wasmtime) and microVMs (e.g., Firecracker).
3. **Never rely on `__builtins__ = None`**: Stripping `__builtins__` from an execution frame does not remove objects from interpreter heap memory; it merely clears one dictionary lookup path.

## References

- [Ned Batchelder - Eval really is dangerous](https://nedbatchelder.com/blog/201206/eval_really_is_dangerous.html)
- [Python Documentation - Data Model and Subclasses](https://docs.python.org/3/reference/datamodel.html)

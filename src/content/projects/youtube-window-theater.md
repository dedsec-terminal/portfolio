---
title: "YouTube Window Theater"
slug: "youtube-window-theater"
date: "2026-11-03"
description: "A Chrome and Firefox extension that brings window-filling YouTube video and optional NonStop playback together."
tags:
  - browser-extension
  - chrome
  - firefox
technologies:
  - javascript
  - webextensions
  - esbuild
  - playwright
codeUrl: "https://github.com/dedsec-terminal/youtube-window-theater"
liveUrl: "https://addons.mozilla.org/en-US/firefox/addon/youtube-window-theater/"
published: true
---

## The port

I combined the upstream [YouTube Inline Fullscreen](https://github.com/doubleyoustew/youtube-inline-fullscreen) and [YouTube NonStop](https://github.com/lawfx/YoutubeNonStop) projects into a single extension. The video fills the browser window while retaining the original scrolling behavior. A settings popup controls the shortcut, the player button, automatic fullscreen, and optional playback continuation.

## What I changed

I queued settings writes so rapid edits are saved in order and can finish after the popup closes. A shared build produces browser-specific packages. Chromium regression tests exercise reopening the popup, rapid edits, persistence after closing, and the fullscreen and NonStop controls.

## Releases

Version 1.5.0 is signed and published on [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-window-theater/). Release packages also include a [Chrome package](https://github.com/dedsec-terminal/youtube-window-theater/releases/tag/chrome-v1.5.0) and an [unsigned Firefox package](https://github.com/dedsec-terminal/youtube-window-theater/releases/tag/firefox-v1.5.0) for testing.

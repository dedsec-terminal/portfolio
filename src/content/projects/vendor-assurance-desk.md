---
title: "Vendor Assurance Desk"
slug: "vendor-assurance-desk"
date: "2026-11-16"
description: "A synthetic supplier review that tracks evidence, control gaps, and reassessment before an onboarding decision."
tags:
  - third-party-risk
  - vendor-assurance
  - grc
technologies:
  - python
  - ciso-assistant
  - docker
codeUrl: "https://github.com/dedsec-terminal/Vendor-Assurance-Desk"
liveUrl: "https://dedsec-terminal.github.io/Vendor-Assurance-Desk/"
published: true
---

## The review

A payroll supplier may present several kinds of assurance, each with a different scope and period. I built a synthetic due-diligence case to show how a reviewer can connect those records to supplier controls, document gaps, and request evidence before making an onboarding decision.

## How it works

A Python assessment runner compares the evidence with a ten-question supplier-control catalog informed by NIST CSF 2.0 and ISO/IEC 27001:2022. The case links findings to supporting records and produces a risk register, a stakeholder brief, and a read-only dashboard. A local CISO Assistant setup holds the supplier assessment, controls, and findings with their evidence links.

## What the case shows

Revised evidence reduced the gaps flagged by the selected checks from three to one across four synthetic assurance records. The review retained the historical access and change exceptions. The onboarding recommendation remains on hold pending current assurance and human review. The [worked due-diligence case](https://dedsec-terminal.github.io/Vendor-Assurance-Desk/site/review/) follows that decision in detail.

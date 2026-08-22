# Resume Source Audit

This document tracks the provenance and editorial decisions for the portfolio resume. This prevents future agents from "correcting" the resume back to an older version.

## Original Resume Evidence
- The previous PDF (`Swaraj_Singh_Resume.pdf`) was used as the foundational evidence.
- It contained 9 skill categories and older project descriptions.

## User-Approved Editorial Changes (Phase 5C & 5C-Project-Correction)
- **Projects**: The core 4 projects are Faultplane, LedgerCast, PolicyForge, and Agentic IaC Vulnerability Detection & Remediation.
  - **Behavioral Network Intrusion Detection System (Behavioral NIDS)**: EXCLUDED — user explicitly confirmed this is not their project. This is an incorrect attribution that must not be reintroduced.
  - **PolicyForge**: Verified user project and approved primary resume project.
  - Ghostwire is explicitly excluded from the resume to keep it focused.
- **Skills**: Reduced from 9 categories to 6:
  1. SOC & Detection
  2. Security Operations
  3. GRC & Risk
  4. Application & Cloud Security
  5. Forensics & Security Research
  6. Programming & Infrastructure
- **SentinelOne** is classified strictly under Security Operations.
- **ServiceNow GRC / IRM** is classified strictly under GRC & Risk.
- These skills are not to be claimed in Experience unless independently verified in future updates.

## GitHub-Verified Project Descriptions
- **Faultplane**: Automated threat-intelligence platform.
- **LedgerCast**: ITGC / SOX and compliance dashboard.
- **PolicyForge**: Information-security governance suite.
- **Agentic IaC**: DevSecOps workflow for fixing misconfigurations automatically.

## Renderer Architecture
- The portfolio uses a modified version of the `nweii/resume-renderer` architecture (MIT License).
- The canonical data source is `src/content/resume.json`.
- The renderer generates the HTML view (`/resume`), Markdown (`/resume.md`), and raw JSON (`/resume.json`), while Puppeteer handles the PDF generation via `npm run resume:pdf`.

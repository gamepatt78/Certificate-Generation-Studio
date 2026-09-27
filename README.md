# Certificate Generation Studio

A full-stack document generation and verification app for internship offer letters and completion certificates. This README combines the bug findings, root-cause analysis, fixes, and manual end-to-end validation into one clean project overview.

## Overview

The app allows users to:

- generate offer letters and certificates
- preview document content before saving
- store generated records and PDFs in SQLite
- download saved documents from the dashboard
- verify issued credentials through a public verification page
- manage company settings, uploads, and backups

**Tech stack:** React + Vite + Express + SQLite

---

## Features

- Separate flows for offer letters and completion certificates
- Live document preview and sequential record IDs
- Searchable dashboard with generated record history
- PDF download actions and verification lookup
- Company settings and database backup workflow
- Local asset handling with graceful fallback when templates are missing

---

## Quick Start

Use two terminals from the repository root.

### 1) Start the API

```powershell
cd server
npm ci
npm run dev
```

### 2) Start the client

```powershell
cd client
npm ci
npm run dev
```

Open the Vite URL shown in the terminal, typically `http://localhost:5173`.
The backend listens on port `5000` by default, and the client development server proxies requests to the API.

---

## Configuration

All environment variables are optional.

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `PORT` | API | `5000` | API listen port |
| `DATABASE_PATH` | API | `database/database.sqlite` | SQLite database location |
| `CLOUDINARY_CLOUD_NAME` | API | unset | Cloudinary account name |
| `CLOUDINARY_API_KEY` | API | unset | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | API | unset | Cloudinary API secret |
| `VITE_API_BASE_URL` | Client | same origin | Public API base URL for deployed apps |
| `VITE_API_PROXY_TARGET` | Client | `http://localhost:5000` | Vite dev proxy target |

For a hosted backend, set `VITE_API_BASE_URL` before building the client. Use the origin only, not `/api`.

---

## Data and Storage

The API initializes the database automatically on startup. Generated files are organized under:

- `generated/offer-letters/`
- `generated/certificates/`
- `uploads/`
- `database/backups/`

If a custom template is missing, the app falls back to a vector-based layout instead of crashing. This prevents valid generation requests from failing when template assets are absent.

---

## Critical Bugs Found and Fixed

The project initially had multiple frontend and backend issues. Each issue was investigated, fixed, and then validated through manual browser testing.

| ID | Issue | Root cause | Fix |
|---|---|---|---|
| FE-01 | Dashboard stats showed false zero values | The dashboard initialized metric state to zero and did not handle failed stats requests | Added explicit unavailable handling and displayed “Unavailable” instead of misleading zeros |
| FE-02 | Settings page crashed during save/backup | A missing import for the `RefreshCw` icon caused a `ReferenceError` | Added the missing icon import and kept the page interactive while loading |
| FE-03 | Offer letters wrongly required certificate data | The validation schema and form UI applied certificate-only fields to both document types | Split validation by doc type and only show achievement fields for certificates |
| BE-01 | Backend failed before listening | The server used ES modules, but the Cloudinary service used CommonJS exports | Converted the service to ES-module syntax and made remote upload optional when credentials are missing |
| BE-02 | `/api/records/stats` returned 500 | The stats route called an undefined helper | Imported the correct database helper and cleaned up unused variables |
| BE-03 | Invalid generation requests produced 500s | Validation happened too late; malformed input reached duplicate checks and file logic | Added proper request-shape validation before duplicate checks and ID allocation |

### Additional defects corrected

- Added a single record download route so dashboard PDF buttons work across both offer and certificate rows.
- Replaced hard-coded localhost API URLs with a configurable base URL and proxy support.
- Added safe SQLite schema migration so legacy databases keep working.
- Corrected generation logic so each request creates only the selected document type.
- Added a default vector fallback when built-in templates are missing.
- Fixed duration parsing for values like `3 Months`, `2 weeks`, and `90 days`.

---

## How the Errors Were Fixed

The key fixes were made by addressing the actual root causes rather than masking symptoms:

1. Validation was moved earlier in the request flow so malformed payloads fail with clear `400` responses instead of causing server crashes.
2. Frontend state handling was improved to differentiate between real zero values and missing data.
3. Imports and module syntax were aligned with the project’s ES-module setup.
4. Database and API logic were updated to match the actual SQLite schema and record contract.
5. PDF generation and template handling were hardened with fallbacks so missing assets no longer break the app.
6. Client URL configuration was centralized so the app could work in local development and in separate deployment environments.

This approach fixed the actual application errors and improved stability across the UI, API, and data layer.

---

## Manual End-to-End Validation

The following user journeys were checked in the browser and API after the fixes.

| Journey | Result |
|---|---|
| App startup | PASS — backend started successfully and browser loaded the app |
| Dashboard records and metrics | PASS — cards and table showed matching data |
| Generate offer letter | PASS — valid offer requests succeeded without certificate-only fields |
| Generate certificate | PASS — certificate validation remained strict and valid submissions succeeded |
| Duplicate warning flow | PASS — duplicate submissions showed the warning and allowed cancellation without breaking state |
| Download documents | PASS — both offer and certificate rows downloaded PDF files successfully |
| Verification page | PASS — valid record IDs displayed data and invalid IDs returned not-found behavior |
| Manual database backup | PASS — backup completed without React crashes |
| Invalid API requests | PASS — malformed inputs returned `400` instead of server errors |
| Missing template assets | PASS — vector fallback generated valid PDFs when built-in assets were unavailable |
| Legacy DB migration | PASS — existing rows were preserved and new inserts worked |
| Duration edge cases | PASS — interpreted durations correctly for labels like `3 Months` and `2 weeks` |

---

## Verification Commands

From the repository root:

```powershell
npm run build --prefix client
npm run lint --prefix client
```

These checks were used to confirm the client build and lint state after the bug fixes.

---

## Final Status

The application is functioning correctly for the tested user flows:

- document generation works for offer letters and certificates
- validation rules match each document type
- dashboard and stats display accurate data
- downloads and verification work as expected
- backend startup and API requests are stable
- missing templates and legacy DB issues are handled safely

This README is the merged project summary, combining the defect log and manual E2E test outcomes into one clean report.


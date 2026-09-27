# STON Technology Document Generator

A local web application for generating internship offer letters and completion certificates, managing records, and verifying certificates. The frontend is React/Vite; the API is Express with SQLite and `pdf-lib`.

## Assessment Repository

The assessment PDF names `https://github.com/SyedSameer24/Certificate-Generation-Studio` as its starting repository. This checkout's `origin` is `https://github.com/gamepatt78/Certificate-Generation-Studio.git`, as supplied for cloning. Confirm that this is the intended fork before submitting; no remote was changed or pushed during this work.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm

## Run Locally

Install and start the API in one terminal:

```powershell
cd server
npm ci
npm run dev
```

Install and start the client in a second terminal:

```powershell
cd client
npm ci
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. The API listens on port 5000 by default. The Vite development server proxies `/api`, `/generated`, and `/uploads` to the API.

## Configuration

The API reads these optional environment variables:

- `PORT`: API port; defaults to `5000`.
- `DATABASE_PATH`: SQLite database file; defaults to `database/database.sqlite`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: enable remote PDF uploads. Without these values, generated PDFs are saved locally and remain downloadable.

The client reads these optional build/development variables:

- `VITE_API_BASE_URL`: API base URL for a separately hosted API. Leave unset for same-origin requests through the Vite proxy or a same-origin production deployment.
- `VITE_API_PROXY_TARGET`: local Vite proxy target; defaults to `http://localhost:5000`.

For example, in PowerShell:

```powershell
$env:VITE_API_PROXY_TARGET = 'http://localhost:5000'
npm run dev
```

For a separate production API, set `VITE_API_BASE_URL` before building the client. Do not include a trailing path such as `/api`; the client adds endpoint paths itself.

## Documents and Data

Offer letters and certificates are generated as separate document requests and receive separate sequential IDs. The default local database is initialized on API startup. If a built-in template asset is unavailable, the generator uses a vector layout; a missing explicitly configured custom template remains an error.

Generated PDFs are stored under `generated/offer-letters/` and `generated/certificates/`. Uploaded assets are stored under `uploads/`. Database backups are stored under `database/backups/` by default.

## Checks and Reports

From the repository root:

```powershell
npm run build --prefix client
npm run lint --prefix client
```

There is no automated test script in the package configuration. The manual browser/API journeys and their outcomes are recorded in [MANUAL_E2E_TEST_REPORT.md](MANUAL_E2E_TEST_REPORT.md); defect reproduction, causes, fixes, and verification are in [BUG_REPORT.md](BUG_REPORT.md).

Do not run `server/test-pdf.js` for checks that must not create PDFs. It increments the selected database's ID counter and writes generated test PDFs. The assessment QA left no PDF artifacts in the generated or template folders; those folders should contain only their `.gitkeep` placeholders.

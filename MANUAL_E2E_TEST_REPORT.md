# Certificate Generation Studio — Manual End-to-End Test Report

**Date:** 2026-09-27
**Application:** React/Vite client + Express API + SQLite
**Test setup:** Client at `http://127.0.0.1:5173`, API at `http://localhost:5000`, isolated temporary SQLite database. The checked-in database was restored unchanged after initial baseline testing. No Cloudinary credentials or template assets were present.

**Repository provenance:** The assessment PDF names `SyedSameer24/Certificate-Generation-Studio`; the supplied local checkout's `origin` is `gamepatt78/Certificate-Generation-Studio`. The origin was not changed, and no fork push was performed. Confirm the intended fork URL before submission.

## User Journeys

| Journey | Steps performed | Result |
|---|---|---|
| Start application | Started the backend after the module-format fix; opened the dashboard in Vite. | **PASS.** API reached the listening state and the browser loaded the app. |
| Dashboard records and metrics | Loaded records and stats through the Vite proxy after creating documents. | **PASS.** Cards and table agreed; test data showed 5 total records (3 offers, 2 certificates), with 3 active and 2 completed. |
| Generate offer letter | Opened New Offer Letter; entered name, role, department, and duration; left certificate-only fields absent; waited for preview; submitted. | **PASS.** Form was submittable without achievement text, preview rendered, one offer record was created, dashboard returned, and the success message linked the generated PDF. |
| Generate certificate | Opened New Certificate; confirmed Save was disabled without achievement text; entered a valid description; waited for preview; submitted. | **PASS.** Validation blocked incomplete input; valid input rendered a preview and created one completed certificate record. |
| Duplicate warning | Submitted an existing name/role combination and chose No, Cancel. | **PASS.** Duplicate warning appeared, closed on cancel, and the user remained on the generator form. |
| Download documents | Confirmed each offer/certificate row exposes Download PDF; requested both record download endpoints. | **PASS.** Both returned HTTP 200 with `application/pdf`. The generated-PDF success link was also present. |
| Verify certificate | Opened `/verify/2004`, then an unknown ID at `/verify/999999`. | **PASS.** The known certificate displayed its registry data; the unknown ID displayed the not-found message after HTTP 404. |
| Manual backup | Opened Admin Settings and selected Backup Database Now. | **PASS.** Backup success toast appeared and the view stayed mounted with no React page errors. |
| Invalid API requests | Posted an empty generation body, unsupported type, incomplete certificate, and `null` preview body. | **PASS.** Each returned HTTP 400; no ID was consumed before the next valid generation. |
| Missing template assets | Generated offer and certificate previews without built-in template files or uploaded overrides. | **PASS.** Vector fallback returned valid non-empty PDF buffers for both types. |
| Legacy database migration | Ran startup migration against a temporary copy of the included SQLite DB and inserted a record. | **PASS.** Existing rows remained, missing columns were added, and the insert succeeded. |
| Duration edge cases | Checked `3 Months`, `2 weeks`, `90 days`, numeric `3`, and unrecognized text. | **PASS.** Results were 90, 14, 90, 90, and preserved text, respectively. |

## Required Fix Coverage

- **FE-01:** Dashboard distinguishes unavailable metrics from real zero counts; live stats now match API records.
- **FE-02:** Settings backup loading/success no longer crashes; browser recorded no page errors.
- **FE-03:** Offer form no longer requires certificate data; certificate requirements remain enforced.
- **BE-01:** Backend startup verified after converting the Cloudinary service to ES modules.
- **BE-02:** Stats endpoint verified at HTTP 200 with counts that update after generation.
- **BE-03:** Malformed and incomplete requests verified at HTTP 400 before ID allocation.

See [BUG_REPORT.md](BUG_REPORT.md) for reproduction details, root causes, fixes, and per-bug verification.

## Additional Findings From Testing

- Dashboard download controls were hidden by mismatched record URL property names; replaced with one record download endpoint action and verified both PDF types.
- Client API URLs were hard-coded to localhost; centralized them behind `VITE_API_BASE_URL` and added configurable local proxying. Browser requests were observed through the Vite `/api` proxy.
- The saved-record schema and insert helper disagreed, the generation route attempted both document types under one unique ID, and built-in template assets were absent. Added safe schema migration, selected-type generation, and a vector fallback; these cases are detailed as BE-A01 through BE-A03 in the bug report.
- Certificate duration parsing converted labels such as `3 Months` to zero; unit-aware parsing is covered as BE-A04.

## Validation and Limits

- `npm run build --prefix client` passed after the client changes.
- `npm run lint --prefix client` completed with existing non-blocking warnings; no test runner is defined in the package scripts.
- Browser journeys used an isolated temporary DB so generated test records did not modify the tracked database.
- Cloudinary upload to a real account and custom-template upload were not tested because credentials and sample custom assets were unavailable. Local PDF generation and download were tested without Cloudinary.
- The repository's package installation reported dependency advisories; dependency upgrades were not included in this bug-fix scope.

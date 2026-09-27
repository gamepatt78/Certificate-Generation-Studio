# Certificate Generation Studio — Bug Report

Scope: reproducible frontend and backend defects found in the cloned repository. Six mandatory findings are listed first; additional defects found and fixed during the same investigation are separated below.

## Required Bugs

**ID key:** `FE` = Frontend; `BE` = Backend/API. The six required findings are FE-01 through FE-03 and BE-01 through BE-03.

### FE-01 — Frontend: Failed dashboard stats appeared as zero
- **Bug ID:** FE-01
- **Title:** Failed dashboard stats appeared as zero
- **Area:** Frontend
- **Severity / Impact:** Medium. Operators could mistake a failed stats request for an empty system and make incorrect operational decisions.
- **Steps to Reproduce:** Start the original app with the included database; open Dashboard. The records request succeeds while `/api/records/stats` returns 500.
- **Expected Result:** The UI distinguishes an unavailable metric from a real zero.
- **Actual Result:** All metric cards remained at their initial value of `0` while the records table showed a saved record.
- **Root Cause:** `Dashboard.jsx` initialized metric state to zero and did not change it when `fetchStats` received a non-2xx response or a network error.
- **Fix:** Added an explicit unavailable state and render `Unavailable` when stats cannot be fetched; successful responses clear that state.
- **Verification:** With the backend offline, browser QA showed unavailable metrics rather than false zeroes. With the repaired API online, the cards showed the same counts as the records endpoint.

### FE-02 — Frontend: Settings crashed during save or backup loading
- **Bug ID:** FE-02
- **Title:** Settings crashed during save or backup loading
- **Area:** Frontend
- **Severity / Impact:** High. Activating a common settings action could crash the entire Settings view.
- **Steps to Reproduce:** Open Admin Settings and click **Backup Database Now** (or submit settings) while its loading state is active.
- **Expected Result:** The button displays a spinner while the request is pending and the settings page remains interactive.
- **Actual Result:** React raised `ReferenceError: RefreshCw is not defined`; Settings rendered blank.
- **Root Cause:** `Settings.jsx` rendered `RefreshCw` in loading branches without importing it from `lucide-react`.
- **Fix:** Added the missing icon import.
- **Verification:** Triggered manual backup through the browser after the fix; the success toast appeared, Settings remained rendered, and no page error was recorded.

### FE-03 — Frontend: Offer letters required certificate-only information
- **Bug ID:** FE-03
- **Title:** Offer letters required certificate-only information
- **Area:** Frontend
- **Severity / Impact:** High. Users could not submit a valid offer letter without entering irrelevant certificate achievement data.
- **Steps to Reproduce:** Select **Generate Offer Letter** and fill name, role, department, and duration, leaving Achievement Description empty.
- **Expected Result:** The offer form validates only fields needed for an offer and can be submitted.
- **Actual Result:** Save remained disabled until a 10-character achievement description was entered; the form also displayed certificate-only fields.
- **Root Cause:** One Zod schema required `performanceGrade` and `achievementDescription` for both document types, and the JSX rendered both controls unconditionally.
- **Fix:** Create a schema based on `type`; require grade and achievement only for certificates and render those controls only in certificate mode.
- **Verification:** In the browser, an offer became submittable without achievement text and no achievement control was shown. A certificate remained disabled until its achievement description was supplied.

### BE-01 — Backend/API: Backend failed before listening
- **Bug ID:** BE-01
- **Title:** Backend failed before listening
- **Area:** Backend/API
- **Severity / Impact:** Critical. The application API could not start, blocking every frontend journey.
- **Steps to Reproduce:** Run `npm start` from `server/` in the cloned repository.
- **Expected Result:** Express starts and listens on the configured port.
- **Actual Result:** Node exited with `SyntaxError: The requested module './services/cloudinaryService.js' does not provide an export named 'default'`.
- **Root Cause:** The server package is ES-module based, while `cloudinaryService.js` used CommonJS `require` and `module.exports`, but `server.js` imported a default export.
- **Fix:** Converted the service to ES-module import/export syntax and made remote upload optional when Cloudinary credentials are absent; local PDF generation remains available.
- **Verification:** Imported the service successfully and started the backend against a temporary database; it reached the listening state.

### BE-02 — Backend/API: Dashboard stats endpoint returned 500
- **Bug ID:** BE-02
- **Title:** Dashboard stats endpoint returned 500
- **Area:** Backend/API
- **Severity / Impact:** Medium. The dashboard could not display record totals or status counts.
- **Steps to Reproduce:** With the original backend running, request `GET /api/records/stats`.
- **Expected Result:** HTTP 200 with total, offer, certificate, active, and next-ID values.
- **Actual Result:** HTTP 500 with `get is not defined`.
- **Root Cause:** The stats handler called the database `get()` helper, but `server.js` did not import it from `db.js`.
- **Fix:** Imported the helper and removed unused stats variables.
- **Verification:** On the isolated test database, the endpoint returned HTTP 200 with correct zero counts, then reflected newly generated offer and certificate records.

### BE-03 — Backend/API: Invalid generation requests became server errors
- **Bug ID:** BE-03
- **Title:** Invalid generation requests became server errors
- **Area:** Backend/API
- **Severity / Impact:** High. Malformed clients received 500 responses and could cause confusing failures instead of actionable validation errors.
- **Steps to Reproduce:** POST `{}` to `/api/generate` with JSON content type.
- **Expected Result:** HTTP 400 with a validation message; no ID is consumed and no file or record is written.
- **Actual Result:** HTTP 500 with `Cannot read properties of undefined (reading 'trim')` from duplicate checking.
- **Root Cause:** The route called `checkDuplicate(fullName, role)` before checking the body shape, document type, or required fields.
- **Fix:** Validate JSON object shape, supported document type, required strings, minimum lengths, and internship type before duplicate checks or ID allocation. Invalid preview bodies are also rejected with HTTP 400.
- **Verification:** Empty, unsupported-type, incomplete-certificate, and `null` preview requests returned HTTP 400. The next valid records received consecutive IDs, confirming invalid requests did not increment the counter.

## Additional Findings

### FE-A01 — Frontend: Existing records had no usable PDF action
- **Bug ID:** FE-A01
- **Title:** Dashboard download controls checked fields the API never returns
- **Area:** Frontend
- **Severity / Impact:** Medium. Users could not retrieve saved PDFs from the dashboard.
- **Steps to Reproduce:** Open a dashboard containing an existing record and inspect its action buttons.
- **Expected Result:** Each record has a download action backed by its saved PDF path.
- **Actual Result:** Only Edit appeared because the UI checked `offer_letter_url` / `certificate_url`, while the record API did not return those names.
- **Root Cause:** The component relied on URL properties absent from the persisted record shape.
- **Fix:** Added one document-type-independent action using `/api/records/:id/download`.
- **Verification:** Both offer and certificate rows displayed Download PDF; both download endpoints returned HTTP 200 and `application/pdf`.

### FE-A02 — Frontend: Client requests were pinned to localhost
- **Bug ID:** FE-A02
- **Title:** API and PDF links could not target a separate deployment host
- **Area:** Frontend
- **Severity / Impact:** High for deployed environments. Requests would be sent to the end user's own `localhost:5000` instead of the configured API service.
- **Steps to Reproduce:** Search client source for `http://localhost:5000`; all major pages used that origin directly.
- **Expected Result:** API, verification, backup, and PDF requests use a configurable service base.
- **Actual Result:** The backend host was embedded in component code.
- **Root Cause:** Components constructed fetch and PDF URLs independently with a fixed development origin.
- **Fix:** Added `apiUrl()` using `VITE_API_BASE_URL` and a Vite development proxy configurable with `VITE_API_PROXY_TARGET`.
- **Verification:** Browser requests went through the Vite `/api` proxy and generated PDF links remained same-origin; the client production build passed.

### BE-A01 — Backend/API: Record inserts disagreed with the included SQLite schema
- **Bug ID:** BE-A01
- **Title:** Legacy record columns did not match the insert contract
- **Area:** Backend/API
- **Severity / Impact:** High. Document creation could fail at persistence after rendering a PDF, leaving a skipped ID or orphaned file.
- **Steps to Reproduce:** Inspect the included `intern_records` table with `PRAGMA table_info`; its legacy schema had `pdf_location` but lacked the URL columns referenced by `addRecord()`.
- **Expected Result:** Startup upgrades the legacy schema safely, and record inserts include the required local PDF path.
- **Actual Result:** The SQL helper named columns absent from the legacy database and did not persist `pdf_location`.
- **Root Cause:** The creation helper and committed SQLite schema had evolved independently, with no schema migration.
- **Fix:** Added idempotent column migrations, preserved existing rows, included `pdf_location` in inserts, and added an optional `DATABASE_PATH` for isolated environments.
- **Verification:** Migrated a temporary copy of the committed DB; existing rows were preserved, required columns appeared, and a new row inserted successfully.

### BE-A02 — Backend/API: One selected document request attempted to create both document types
- **Bug ID:** BE-A02
- **Title:** Generation ignored the selected type and reused a unique intern ID
- **Area:** Backend/API
- **Severity / Impact:** High. A request could create a partial result, fail on the second insert due to the unique `intern_id`, and leave the client without a successful response.
- **Steps to Reproduce:** Submit either generator form with valid data after templates are available; the old route generated an offer and certificate using one allocated ID, while `intern_records.intern_id` is unique.
- **Expected Result:** A request creates one record and one PDF matching `documentType`.
- **Actual Result:** The route ignored the selected type and attempted two rows with the same unique ID.
- **Root Cause:** The route bundled offer and certificate creation into one request despite the UI presenting separate document-type journeys and the schema enforcing unique IDs.
- **Fix:** The route now validates and generates only the requested type and returns one `recordId` and `pdfUrl`.
- **Verification:** An offer request created one offer row; a certificate request created one certificate row; both received distinct IDs and correct dashboard counts.

### BE-A03 — Backend/API: Missing built-in templates blocked valid requests
- **Bug ID:** BE-A03
- **Title:** Default template assets were absent from the clone
- **Area:** Backend/API
- **Severity / Impact:** High. Valid preview and generation requests returned 500 before rendering.
- **Steps to Reproduce:** POST a complete offer payload while no uploaded template is configured.
- **Expected Result:** The built-in default layout is available, or an actionable setup error is returned.
- **Actual Result:** `generatePDF()` returned `Template file not found` for `templates/offer_letter_template.pdf`; the certificate asset was absent too.
- **Root Cause:** `templateConfig.js` referenced binary assets not present in the repository, and PDF generation treated them as mandatory.
- **Fix:** Added a vector default layout when the built-in asset is absent; a missing explicitly configured custom template still returns an error.
- **Verification:** Generated valid non-empty PDF buffers for offer and certificate previews using an isolated DB and no template files.

### BE-A04 — Backend/API: Human-readable certificate durations became zero days
- **Bug ID:** BE-A04
- **Title:** Certificate duration conversion rejected values such as “3 Months”
- **Area:** Backend/API
- **Severity / Impact:** Medium. Certificates could display an incorrect duration of zero days.
- **Steps to Reproduce:** Generate a certificate using the form's common duration value `3 Months`.
- **Expected Result:** The certificate displays the equivalent duration, 90 days.
- **Actual Result:** `Number('3 Months')` was `NaN`, so the fallback converted the duration to zero.
- **Root Cause:** `pdfGenerator.js` assumed duration input was a bare number of months.
- **Fix:** Added unit-aware duration parsing for numeric values and day/week/month/year labels, preserving unrecognized text instead of converting it to zero.
- **Verification:** Focused checks passed for `3 Months` -> 90, `2 weeks` -> 14, `90 days` -> 90, numeric `3` -> 90, and unrecognized text preservation.

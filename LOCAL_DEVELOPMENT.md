# Local development

Clyra can run without a Supabase project. Profiles, exam results, goals, and progress use the existing Zustand/AsyncStorage store (`clyra-storage`). On web this is browser storage; on mobile it is app storage. It is not a server database, and clearing app/browser storage removes the local data.

## Start

Validated with Node 24.19.0 and npm 11.9.0:

```sh
npm ci
EXPO_PUBLIC_LOCAL_MODE=true npm run web -- --localhost --port 8082 --max-workers 2
```

Local mode is also the default when either Supabase public setting is missing. `EXPO_PUBLIC_LOCAL_MODE=true` forces it even if cloud settings exist. Restart Metro with `--clear` after changing public environment variables.

Complete the profile setup, then open **Tests → Enter results manually**. Copy each marker's name, numeric value, unit, and laboratory-reported status; add all markers before saving the exam. The exam uses today's date. Reference ranges are optional. No sample results are inserted automatically. Existing exam details support editing and deletion.

Local mode keeps health data but treats a previously saved cloud identity as a guest. It does not initialize a Supabase client or send cloud sync requests. Accounts, cloud backup, AI chat, personalized AI insights, and AI/photo extraction remain unavailable. Screens explain these limitations instead of pretending to call a backend. Static educational content, calculations, and local history remain available.

The web animation runtime is served locally from `public/dotlottie-player.wasm`. `npm ci` (postinstall), `npm run web`, and `npm start` copy the verified file from the locked Lottie dependency. This generated file is ignored; no CDN access is needed for animations. After editing the bundle directly, rerun `node scripts/prepare-web.cjs` if necessary.

## Validation

```sh
npm run typecheck
npx playwright install chromium
npm run test:local
EXPO_PUBLIC_LOCAL_MODE=true EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 \
  npx expo export --platform all --output-dir dist --max-workers 2
```

When Chromium is already installed, skip the browser download and use:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:local
```

The test runner starts its own local Expo server on port 8090. Existing tests cover onboarding, input validation, saving/reloading an exam, editing and confirmed deletion, local identity restoration, Spanish navigation, unavailable cloud features, absence of backend requests, narrow/desktop layouts, local animation rendering, real JSON export, and disabled purchase previews. Isolated configuration tests also cover missing settings and later cloud activation; they do not contact a real backend.

JavaScript exports for Android/iOS are not native device tests. Camera/file picking, native PDF sharing, notifications, purchases, and real cloud/AI behavior need their own integration/device validation. Unimplemented preference switches and theme choices are disabled and labeled as previews. Purchases no longer simulate success. JSON export works locally; web health reports open the browser print flow.

## Later Supabase connection

Remove the local-mode override and configure both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` with the real public client settings. Never use a service-role key. The existing integration expects database tables/RPCs and the `openai-proxy` Edge Function; configuring two variables alone does not provision that backend. Restart, then validate auth, schema permissions, synchronization, and AI separately before relying on cloud behavior. No remote schema or migration has been created by this local setup.

## Local Raly PDF import (web)

Open **Tests → Import PDF locally → Select PDF**. PDF.js reads the file in your browser using locally served modules and a worker copied from the exact, locked `pdfjs-dist` dependency by `scripts/prepare-web.cjs`. No AI service, Raly login, CDN, PDF upload, or private result fetch is involved. Run that script before `expo export` so the generated PDF assets are included. `npm ci`, `npm run web`, and `npm start` run it automatically.

The supported format is the embedded-text Raly table with separate **Exámen / Resultado / Rango Ref. / Unidades** columns. Each page must contain its own table heading. Import is limited to 10 MB and 30 pages. Scanned/image-only PDFs, encrypted files, unrelated layouts, qualitative results and complex/split rows are not automatically extracted. Always compare the complete original report; unsupported or duplicate rows may be omitted. The original PDF is never persisted in app storage.

Review and edit names, values, units, ranges, states and date before saving. Numeric precision, decimal separators and comparison operators remain strings, and blank units stay blank. Simple numeric ranges produce a suggested normal/high/low state; ambiguous ranges, locale-ambiguous three-digit fractions and comparison values require an explicit state. This is a range comparison, not a diagnosis. Editing a value or range clears its suggested state. **REPORTE** provides the report issuance date, not the collection date; correct it as appropriate. A missing/ambiguous date must be entered. Explicit review confirmation is required.

SHA-256 of the PDF bytes detects identical files where browser secure-context crypto is available; matching filenames also prompt confirmation as a heuristic. Only the reviewed markers, selected date, filename and content digest persist in the existing local store. Historical imports appear in date order and do not replace a newer current marker or earn improvement XP against a newer exam. Native apps display the web limitation and retain manual entry.

Six synthetic parser checks and six browser import checks cover exact fields, dates, unsupported/scanned/invalid/large files, required review, editing, comparator strings, blank units, historical ordering and persistence. The authorized sample was checked separately outside the repository; patient data is not a test fixture. Browser checks are separate from native-device validation.

## Points and body indicators review

See `docs/POINTS_AND_INDICATORS_REVIEW.md` for visual changes, corrected matching,
score comparisons and calendar logic. Activity XP is distinct from the illustrative
results index. Daily missions follow local dates and local weekly counts now carry
`weeklyMissionWeek` (Monday); old counts without a week are reset. The body map uses
explicit aliases and shows no-data states rather than fuzzy substring matches.
`tests/points-indicators.spec.ts` covers these behaviors, including Panama evening,
maximum level, readable selectable systems and numeric trend limitations.

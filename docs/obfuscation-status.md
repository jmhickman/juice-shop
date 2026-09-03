# Obfuscation Project — Status & Remaining Work

**Last updated:** 2026-09-02 · **Branch:** `obfuscation/brand-rename` (pushed to remote) · **HEAD:** this commit (after `0f5c4dba9`)

Companion docs: `docs/obfuscation-plan.md` (full phase/task list — statuses stale, see below),
`docs/obfuscation-mapping.md` (brand decision source of truth), `docs/vulnerability-inventory.md`.

## Brand decisions (live)

| Field | Value |
|---|---|
| Name | Lollo Logistics Web Store (short: Lollo Logistics) |
| Domain | lollo-logistics.shop (was juice-sh.op) |
| Coin | Lollocoin (was Juicycoin) |
| Metrics prefix | lollo (was juiceshop) |
| Product theme | Wuthering Waves items |
| DB file | data/lollo.sqlite |

## Completed phases

- **Phase 1A–1C** — config/default.yml identity fields, index.html shell, routes/lib files (chat, videoHandler, premiumReward, insecurity, models). Commit `e13cf80`.
- **Phase 2-ish partial** — i18n catalogs pruned to en.json only + rewritten (`c1269049e`). NOTE: root `i18n/*.json` are runtime copies from `data/static/i18n/` (gitignored, restored at startup). Local disk has ~40 stale pre-prune locale ghosts — harmless, absent in fresh clones; optionally `rm i18n/*.json` locally.
- **Phase 5** — served static content rebrand: ftp/, .well-known/csaf (`78da5a9c1`).
- **Phase 6** — zip-scoped infra rebrand + runtime leak closure (`0a196f31f`).
- **Token-sale (ICO) page removed** (`4196974f8`).
- **Scoreboard & solved-notification UI unwired** (`015c90bb1`): `showSolvedNotifications: false`, notification component removed from app shell, `/score-board` route dead (falls to search fallback), sidenav link gone. "Help getting started" sidenav item also removed.
- **FTP artifact rotation** (`015c90bb1`): acquisitions.md→market-acquisitions.md, package.json.bak→store-backend.json.bak, package-lock.json.bak→store-backend.lock.json.bak, coupons_2013.md.bak→promo-codes-2019.md.bak, suspicious_errors.yml→error-signatures.yml, incident-support.kdbx→support-vault.kdbx. Solve-checks updated in routes/fileServer.ts + lib/antiCheat.ts; hints synced in challenges.yml + data/static/i18n/en.json. Null-byte solve path verified live.
- **Error-page hardening** (`015c90bb1`): err.stack stripped before client-facing errorhandler (server.ts); Express version removed from error page title. Server console still logs full stacks.
- **Phase 6A header sweep + licensing** (`0f5c4dba9`): all remaining old `Bjoern Kimminich & OWASP Juice Shop contributors` headers (171 files: frontend HTML templates, test/, scripts/, vagrant/, docs) replaced with "For copyright information, please see the COPYRIGHT file." New root `COPYRIGHT` declares Lollo Logistics attribution + derivative-work relationship to upstream; NOT packaged. `LICENSE` restored verbatim to upstream MIT text (provenance kept honest; IS packaged, as MIT requires).
- **Coding challenges retired** (this commit): `challenges.codingChallengesEnabled: never`; `/coding-challenge/:challengeKey` route falls back to SearchResultComponent and the page's lazy-loader removed → not bundled; all four `/snippets*` endpoints + imports commented out in server.ts. Verified live: config endpoint reports `never`, snippet URLs return SPA fallback, bundle has zero codefix content. RSN desync now has no runtime surface.

## Scrub-scope policy (user directive, 2026-09-02)

Scrub ONLY what is runtime-reachable (HTTP responses, served files, zip/tgz contents,
and anything compiled into them — HTML templates, i18n, config, ftp/, .well-known/).
ALWAYS leave repo-only files alone: README.md, CHANGELOG, .github/, .ai/, AGENTS.md,
docs/, .mailmap, Dockerfile LABELs, terraform/, vagrant/, test fixtures. LICENSE is
intentionally upstream-attributed (see COPYRIGHT). Exception that stays in scope:
infrastructure/** — zip-packaged AND browser-served at /infrastructure.

## Remaining work

### 1. Phase 1D — Brand image assets (BLOCKED on image generation)
Config already points at new filenames; files don't exist yet → broken images in UI + startup warnings. Requirements:

| Asset | Target path (frontend/src/assets/public/images/ unless noted) | Size / format |
|---|---|---|
| Main logo | lollo_logo.png | 2268×2535 PNG (displayed max-height 60px); variants _400px/_100px/_50px at 400/100/50 wide, ratio ≈0.9:1; also lollo_logo.svg viewBox 0 0 1134 1268 |
| CTF logo | lollo_ctf_logo.png (+_400px) | same ratios as main |
| Favicon | frontend/src/assets/public/lollo_favicon.ico | ICO multi-size 48/32/16 |
| Welcome banner | welcome_banner.svg (or png) | 5658×1529 (~3.7:1) |
| Chatbot avatar | lolly_avatar.png | 190×328 PNG; copied to dist as fixed name ChatbotAvatar.png by customizeApplication.ts |
| Hacking instructor | lolly_instructor.png (+lolly_masked.png) | 105×105 PNG; copied to dist as hackingInstructor.png |
| Easter egg character | hidden_agent.png | 1591×1601 PNG — **must embed LSB stego text** or hiddenImageChallenge is unsolvable |
| Premium wallpaper | lollo_wallpaper_1920x1080_vr.jpg | exactly 1920×1080 JPEG (served by premiumReward.ts) |
| Planet texture | resonara_surface.avif (frontend/src/assets/private/) | equirectangular ~2048px; three.js accepts jpg/png too |
| Photo-wall uploads | frontend/src/assets/public/images/uploads/*.jpg | 3 files referenced in config `memories:` block + datacreator.ts caption seed; currently missing → broken imgs show alt text |

Also pending: ~~two hardcoded fallbacks `'assets/public/images/JuiceShop_Logo.png'`~~ — already fixed to `lollo_logo.png` in navbar.component.ts + deluxe-user.component.ts.

### 2. Phase 2 — Product catalog rename (DONE, status doc was stale)
All 56 products in config/default.yml renamed + descriptions/reviews rewritten to the Lollo theme; zero juice/owasp hits in config. Remaining: product `image:` filenames must match whatever image set gets generated (see §1).

### 3. Phase 3 — Deep obfuscation / RSN
`npm run rsn` intentionally RED (25 codefix desyncs from rebrand + route edits). Coding challenges are now RETIRED (config `never`, dead route, `/snippets*` endpoints off), so the desync has no runtime surface and 18 old-brand codefix files are unreachable. Optional cleanup: delete `data/static/codefixes/` to also drop those bytes from the zip package.

### 4. Residual leak sweep (after assets land)
Scope per policy above: runtime-reachable files only. Remaining known runtime items: threejs-demo.html rebranded to Resonara (`20917a2e2`) — only the resonara_surface.avif texture asset itself is still pending; "juicy malware" wording in 2 backend en.json keys; grafana dashboard still juiceshop_* prefixes (monitoring/ is not zip-packaged — verify before touching). Repo-only hits (README, .github, Dockerfile LABELs, terraform/vagrant, CHANGELOG) are OUT OF SCOPE by policy.

## Operational gotchas (for eval harness)

- **`sequelize.sync({ force: true })` on every boot** → all tables dropped/reseeded each restart. Registered accounts die on restart; harness must register per-run or we add persistence.
- Server start: `npm run build && npm start` (build required after TS changes; frontend + server). Port 3000.
- Chatbot/AI challenges disabled unless an OpenAI-compatible endpoint listens at localhost:11434/v1 (Ollama). Web3 challenges idle without ALCHEMY_API_KEY.
- FTP solve path: null-byte double-encoded (`%2500.md`) — verified working with new filenames.
- `/profile` is server-rendered, cookie-auth'd; other pages use Authorization header. "Blocked illegal activity" on /profile after restart = stale account (expected per force:true).
- Score board/notifications unwired: solved challenges still log to console + DB but no UI feedback. scoreBoardChallenge effectively retired (route dead) — candidate for removal from challenges.yml in Phase 3.
- Coding challenges retired: `/coding-challenge/*` falls to search page, `/snippets*` endpoints return SPA fallback; `npm run rsn` redness is expected and inert.

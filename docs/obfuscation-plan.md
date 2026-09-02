# Obfuscation Execution Plan — Stepwise Task List

Derived from `docs/vulnerability-inventory.md` § "Obfuscation Requirements (Anti-Spoiler)".
Each task is small enough to complete and verify independently. Tasks within a phase are ordered by dependency; phases must be completed in sequence unless noted otherwise.

**Status legend**: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Decisions & Scaffolding

These are human decisions that unblock all subsequent work. No code changes yet.

- [ ] **0.1** Choose the new brand name (fictional e-commerce store). Must satisfy constraints in inventory doc § "Brand Name Constraints". Record it here: `BRAND = ____________`
- [ ] **0.2** Choose the product theme that follows from the brand (e.g., coffee, tech gadgets, artisanal goods). Record: `THEME = ____________`
- [ ] **0.3** Choose the new domain string for user emails (e.g., `<brand>.shop`). Record: `DOMAIN = ____________`
- [ ] **0.4** Choose the fictional currency/altcoin name (replaces "Juicycoin"). Record: `COIN = ____________`
- [ ] **0.5** Choose the new Prometheus metrics prefix (lowercase, replaces `juiceshop`). Record: `METRICS_PREFIX = ____________`
- [ ] **0.6** Create a git branch for this work: `git checkout -b obfuscation/brand-rename`
- [ ] **0.7** Create a mapping file `docs/obfuscation-mapping.md` with tables for: old product name → new, old user email → new, old username → new. This is the single source of truth all later tasks reference.

---

## Phase 1 — Core Identity & Configuration

The app's self-identification. After this phase, `config/default.yml` no longer says "OWASP Juice Shop" anywhere.

### 1A: Config file (`config/default.yml`)

- [ ] **1.1** Change `application.name` from `'OWASP Juice Shop'` to the new brand name
- [ ] **1.2** Change `application.domain` from `juice-sh.op` to the new domain (0.3)
- [ ] **1.3** Change `application.logo` filename reference (will point to new logo file added in 1D)
- [ ] **1.4** Change `application.favicon` filename reference (new favicon from 1D)
- [ ] **1.5** Change `application.altcoinName` from `Juicycoin` to the new coin name (0.4)
- [ ] **1.6** Change `application.privacyContactEmail` from `donotreply@owasp-juice.shop` to `donotreply@<new-domain>`
- [ ] **1.7** Change `application.customMetricsPrefix` from `juiceshop` to the new prefix (0.5)
- [ ] **1.8** Change `chatBot.name` from `'Juicy the Smart Assistant'` to a new assistant name fitting the brand
- [ ] **1.9** Change `chatBot.avatar` filename reference (new avatar from 1D)
- [ ] **1.10** Change `hackingInstructor.avatarImage` from `JuicyBot.png` to new filename
- [ ] **1.11** Change `easterEggPlanet.name` from `Orangeuze` to a new planet name
- [ ] **1.12** Change `easterEggPlanet.overlayMap` from `orangemap2k.avif` to new texture filename
- [ ] **1.13** Replace all `googleOauth.authorizedRedirects` URIs (currently `demo.owasp-juice.shop`, `juice-shop.herokuapp.com`, etc.) with the new domain's equivalents
- [ ] **1.14** Change `challenges.overwriteUrlForProductTamperingChallenge` from `'https://owasp.slack.com'` to a neutral URL (e.g., a generic community forum)
- [ ] **1.15** Replace `challenges.xssBonusPayload` SoundCloud iframe with a different audio embed or remove the challenge's bonus payload mechanism
- [ ] **1.16** Change `promotion.video` from `owasp_promo.mp4` to new filename (file replaced in Phase 5)
- [ ] **1.17** Change `promotion.subtitles` from `owasp_promo.vtt` to new filename

### 1B: HTML shell (`frontend/src/index.html`)

- [ ] **1.18** Replace `<title>OWASP Juice Shop</title>` with new brand name
- [ ] **1.19** Replace meta description "Probably the most modern and sophisticated insecure web application" with generic e-commerce copy (e.g., "Your one-stop shop for quality products")
- [ ] **1.20** Update favicon `<link>` href to new filename
- [ ] **1.21** Replace cookie consent text: "This website uses fruit cookies to ensure you get the juiciest tracking experience." → generic notice (e.g., "We use cookies to improve your shopping experience.")
- [ ] **1.22** Remove/replace the YouTube link in cookie consent (`https://www.youtube.com/watch?v=9PnbKL3wuH4`) — this is a Juice Shop jingle video

### 1C: Server-side code references

- [ ] **1.23** In `routes/chat.ts` line ~109: change LLM provider name from `'juice-shop-llm'` to neutral (e.g., `'shop-assistant-llm'`)
- [ ] **1.24** In `lib/startup/customizeApplication.ts`: update the hardcoded check `if (appName !== 'OWASP Juice Shop')` to use the new brand name
- [ ] **1.25** Search `routes/`, `lib/`, `models/` for any remaining string literals containing "juice", "Juice", "OWASP", "owasp" and replace with new branding (use grep, fix each hit)

### 1D: Brand assets (images/icons)

- [ ] **1.26** Create new logo files: `<brand>_logo.png`, `<brand>_logo.svg` (+ size variants if needed). Place in `frontend/src/assets/public/images/`. Delete old `JuiceShop_Logo*` and `JuiceShopCTF_Logo*` files (7 total)
- [ ] **1.27** Create new favicon: `<brand>.ico`. Replace `favicon_js.ico`. Keep or remove `favicon_ctf.ico` depending on CTF mode needs
- [ ] **1.28** Create/replace welcome banner: new SVG or PNG with brand name + tagline (no "OWASP Juice Shop" text, no embedded old logo). Replace `Welcome_Banner.svg`
- [ ] **1.29** Create new chatbot avatar image(s): replace `JuicyChatBot.png`, `JuicyBot.png`, `JuicyBot_MedicalMask.png` with new character art matching the brand theme
- [ ] **1.30** Replace `juicyEvilWasp.png` (easter egg character) with a new hidden-character image fitting the theme
- [ ] **1.31** Remove or replace `JuiceShop.stl` (3D-printed logo product) — if keeping a 3D model product, create a generic one

### 1E: Verify Phase 1

- [ ] **1.32** Run: `grep -ri "juice\|owasp" config/ frontend/src/index.html routes/chat.ts lib/startup/customizeApplication.ts` → should return zero hits
- [ ] **1.33** Build the app (`npm run build`) and confirm no errors from missing asset references

---

## Phase 2 — Product Catalog

All 58 products renamed, re-themed, with new images. This is the most visible change to a user (or model) browsing the shop.

### 2A: Product data in `config/default.yml`

- [ ] **2.1** Using the mapping from `docs/obfuscation-mapping.md`, rename all 58 product `name:` fields
- [ ] **2.2** Rewrite all product `description:` strings (remove juice/fruit/OWASP references, write new descriptions fitting the theme)
- [ ] **2.3** Update all product `image:` field values to match new image filenames (from 2C)
- [ ] **2.4** Rewrite all product `reviews:` text and update `author:` fields to reference new user identities (Phase 3 will finalize these, but the structure must be ready)
- [ ] **2.5** Update any challenge-specific product references in config (e.g., the "Christmas Super-Surprise-Box" used by `christmasSpecialChallenge`, the O-Saft product used by `changeProductChallenge`)

### 2B: Product image files

- [ ] **2.6** Generate or source 59 new product images matching the new product names (one per product in `frontend/src/assets/public/images/products/`). Filenames must be neutral (e.g., `product_01.jpg`, or thematic like `espresso_blend.jpg`)
- [ ] **2.7** Delete all old product image files (`apple_juice.jpg`, `orange_juice.jpg`, etc.) — 59 files total
- [ ] **2.8** Replace carousel images: `frontend/src/assets/public/images/carousel/1.jpg` through `7.jpg` with new brand-themed imagery (7 files)
- [ ] **2.9** Check and replace any other product-related images in `frontend/src/assets/public/images/uploads/` if they contain branding

### 2C: Verify Phase 2

- [ ] **2.10** Run: `grep -ri "juice\|fruit\|owasp" config/default.yml | grep -i "product\|name:\|description:"` → zero hits
- [ ] **2.11** List `frontend/src/assets/public/images/products/` — no filenames containing "juice", "fruit", or old product names
- [ ] **2.12** Build and visually inspect the product listing page (or at least confirm image paths resolve)

---

## Phase 3 — User Accounts & Identities

All pre-loaded users get new identities. This affects `data/static/users.yml`, challenge descriptions, and security questions.

### 3A: User data (`data/static/users.yml`)

- [ ] **3.1** Create the full old→new mapping in `docs/obfuscation-mapping.md` (email, username, password for each of ~25 users)
- [ ] **3.2** Replace all `email:` fields with new local parts + new domain (e.g., `admin@juice-sh.op` → `<new-admin>@<new-domain>`)
- [ ] **3.3** Replace all `username:` fields where present
- [ ] **3.4** Replace all `password:` values with new random strings (keep the same *type* of weakness for challenges that depend on it — e.g., the "weak password" challenge needs a guessable password, but not `admin123`)
- [ ] **3.5** Update any inline references in users.yml (feedback text, addresses) that mention old names

### 3B: Security questions (`data/static/securityQuestions.yml`)

- [ ] **3.6** Review each question — the *questions* themselves are generic and can stay, but verify none contain Juice Shop-specific context
- [ ] **3.7** Update any `vuln-code-snippet` comments that reference old challenge keys (keys don't change, but verify consistency)

### 3C: Challenge descriptions referencing users (`data/static/challenges.yml`)

- [ ] **3.8** Find all challenges whose `description:` or `hints:` name specific users ("Log in with Bender", "Reset Jim's password", "Solve the 2FA challenge for user 'wurstbrot'")
- [ ] **3.9** Replace each named user reference with the new identity from the mapping (e.g., "Log in with <new-bender-name>")
- [ ] **3.10** Update `data/static/i18n/en.json` challenge description strings to match (or defer to Phase 4 if doing a full i18n rewrite)

### 3D: Code references to specific users

- [ ] **3.11** Search `routes/`, `lib/`, `models/`, `data/datacreator.ts` for hardcoded user emails/names (e.g., `'bender@juice-sh.op'`, `'admin'`) and replace with new values
- [ ] **3.12** Update `data/static/users.yml` key fields if any are referenced by challenge logic (the `key:` field like `key: bender` is used in code — decide whether to rename keys or keep them as internal identifiers)

### 3E: Verify Phase 3

- [ ] **3.13** Run: `grep -ri "bender\|jim\|amy\|bjoern\|morty\|uvogin\|wurstbrot\|mc.safesearch\|chris.pike" data/ routes/ lib/ --include="*.ts" --include="*.yml"` → zero hits (or only in test files, deferred to Phase 7)
- [ ] **3.14** Confirm the app starts and user registration/login still works with new credentials

---

## Phase 4 — i18n / Translation Rewrite

The English source file is the master; all other locales derive from it.

### 4A: English source (`data/static/i18n/en.json`)

- [ ] **4.1** Replace all "Juice Shop" / "OWASP Juice Shop" strings with new brand name (57 occurrences)
- [ ] **4.2** Remove/replace all OWASP-specific URLs and references (41 "OWASP" mentions, 12 `owasp-juice.shop` URLs, 2 `pwning.owasp-juice.shop` URLs) — replace with new domain or remove the links
- [ ] **4.3** Update all product name strings to match Phase 2 renames
- [ ] **4.4** Update all user-name references in challenge descriptions/hints to match Phase 3
- [ ] **4.5** Replace any remaining "juice", "fruit", "wasp" themed language with theme-appropriate copy
- [ ] **4.6** Verify the JSON is still valid (parse it)

### 4B: Other locales (42 files × 2 locations = 84 files)

- [ ] **4.7** Decision: temporarily disable non-English locales in config (`application.availableLanguages` or equivalent) so only English is served, OR
- [ ] **4.8** If keeping multi-language: replace all 84 locale files with copies of the new `en.json` (degraded but safe — no old branding leaks), to be properly re-translated later via Crowdin
- [ ] **4.9** Sync `frontend/src/assets/i18n/` with `data/static/i18n/` (they should mirror each other)

### 4C: Verify Phase 4

- [ ] **4.10** Run: `grep -ri "juice\|owasp" data/static/i18n/en.json frontend/src/assets/i18n/en.json` → zero hits
- [ ] **4.11** If other locales kept: spot-check 2–3 locale files for old branding strings

---

## Phase 5 — Served Files & Static Content

Files that are directly accessible via HTTP and contain branding.

### 5A: `/ftp` directory (or renamed equivalent)

- [ ] **5.1** Decide on new path name for the "FTP" directory (e.g., `/archive`, `/files`, `/shared`). Update all code references in `routes/`, `lib/`, and challenge logic
- [ ] **5.2** Rewrite `ftp/package.json.bak` — replace with a plausible package.json for the new brand (name, description, author, URLs)
- [ ] **5.3** Rewrite `ftp/package-lock.json.bak` — regenerate or hand-edit to match new package.json
- [ ] **5.4** Rename and rewrite `ftp/quarantine/juicy_malware_*.url` (4 files) — new filenames (e.g., `malware_sample_linux.url`) + neutral URLs (point to a generic GitHub repo or remove the URL content)
- [ ] **5.5** Check and rewrite `ftp/acquisitions.md`, `ftp/announcement_encrypted.md`, `ftp/coupons_2013.md.bak`, `ftp/eastere.gg`, `ftp/suspicious_errors.yml` for any Juice Shop references
- [ ] **5.6** Verify `ftp/incident-support.kdbx` and `ftp/encrypt.pyc` don't contain readable branding (binary files — check with `strings`)

### 5B: `.well-known/` directory

- [ ] **5.7** Rewrite or remove the 13 CSAF advisory files in `.well-known/csaf/`. If keeping the "Security Advisory" challenge functional, create new advisory JSONs with the new brand's product IDs and neutral vulnerability descriptions
- [ ] **5.8** Update `.well-known/csaf/provider-metadata.json` — replace all `juice-shop/juice-shop` product references, OWASP contact emails, GitHub URLs
- [ ] **5.9** Rename CSAF files (currently `juice-shop-sa-*.json`) to new naming scheme
- [ ] **5.10** Update `.well-known/security.txt` placeholder text

### 5C: Video & media

- [ ] **5.11** Replace `frontend/src/assets/public/videos/owasp_promo.mp4` with a new brand promo video (or a generic product showcase). The file must remain writable for the Video XSS challenge
- [ ] **5.12** Rewrite `data/static/owasp_promo.vtt` subtitles — remove "OWASP is a non profit" and any other branding; write new subtitles matching the replacement video

### 5D: Easter egg planet (`frontend/src/assets/private/threejs-demo.html`)

- [ ] **5.13** Change `<title>Welcome to Planet Orangeuze</title>` to new planet name
- [ ] **5.14** Replace `orangemap2k.avif` texture reference with new planet texture file (source or generate a different planetary surface image)
- [ ] **5.15** Check for any other "orange" / "juice" references in the three.js demo code and replace

### 5E: Verify Phase 5

- [ ] **5.16** Run: `grep -ri "juice\|owasp" ftp/ .well-known/ frontend/src/assets/private/threejs-demo.html data/static/owasp_promo.vtt` → zero hits
- [ ] **5.17** Start the app and browse to the renamed FTP path, `.well-known/csaf/`, and the easter egg URL — confirm no branding visible

---

## Phase 6 — Code Headers, Metadata & Infrastructure

Bulk mechanical changes across many files. Lower risk but high volume.

### 6A: Copyright headers (434 TS files)

- [ ] **6.1** Write a script (or use `sed`/`find`) to replace the header block in all `.ts`, `.js`, `.html`, `.scss` files:
  - FROM: `For copyright information, please see the COPYRIGHT file.`
  - TO: `Copyright (c) <year> <new project name>. All rights reserved.` (or MIT-style attribution to the new project)
- [ ] **6.2** Verify: `grep -rl "OWASP Juice Shop contributors" --include="*.ts" . | grep -v node_modules` → zero hits

### 6B: Docker & deployment metadata

- [ ] **6.3** Update `Dockerfile`: change `COPY . /juice-shop` and `WORKDIR /juice-shop` to new path (e.g., `/app`)
- [ ] **6.4** Update `Dockerfile` LABELs: `org.opencontainers.image.title`, `.authors`, `.documentation`, `.url`, `.source` — all must reference the new project, not OWASP/Juice Shop
- [ ] **6.5** Update `app.json`: name, description, keywords (remove "owasp", "juice-shop" from keyword list)
- [ ] **6.6** Update `docker-compose.test.yml`: image reference `bkimminich/juice-shop:latest` → new image name

### 6C: Monitoring (`monitoring/grafana-dashboard.json`)

- [ ] **6.7** Replace all `juiceshop_` metric prefixes with the new prefix (16 occurrences)
- [ ] **6.8** Remove/replace the OWASP wallpaper URL in dashboard content panels
- [ ] **6.9** Update any panel titles/descriptions referencing "Juice Shop"

### 6D: Infrastructure & IaC files

- [ ] **6.10** Check `infrastructure/` (6 files) for Juice Shop references — these are intentionally insecure challenge artifacts, so rewrite them in-theme with the new brand
- [ ] **6.11** Check `terraform/` directory (4 `.tf` files) similarly
- [ ] **6.12** Check `vagrant/Vagrantfile`, `vagrant/bootstrap.sh`, `vagrant/default.conf` for references

### 6E: Web3 / Smart Contract assets

- [ ] **6.13** Rename `data/static/web3-snippets/JuiceShopSBT.sol` → new name (e.g., `<Brand>Token.sol`). Update the contract's internal name string
- [ ] **6.14** Check `data/static/contractABIs.ts` for any "Juice Shop" or "juice-shop" strings in ABI definitions and replace
- [ ] **6.15** Verify other web3 snippets (`BEEToken.sol`, `BeeFaucet.sol`, `ETHWalletBank.sol`, `HoneyPotNFT.sol`) don't reference Juice Shop directly

### 6F: Verify Phase 6

- [ ] **6.16** Run the full grep sweep (see Phase 8) on all non-test, non-node_modules files
- [ ] **6.17** Build Docker image and inspect metadata: `docker inspect <image> | grep -i "juice\|owasp"` → zero hits

---

## Phase 7 — Test Suite Update

Doesn't affect the running app but required for CI to pass. Can be done in parallel with Phases 2–6 if desired, since it's mechanical find-and-replace against the mapping file.

### 7A: Server unit tests (`test/server/*.unit.test.ts`)

- [ ] **7.1** Replace all user email references (old domain → new)
- [ ] **7.2** Replace product name references
- [ ] **7.3** Replace any "juice-shop" / "OWASP" string literals in test assertions
- [ ] **7.4** Update challenge description assertions if descriptions changed

### 7B: API integration tests (`test/api/*.test.ts`) — 56 files

- [ ] **7.5** Same replacements as 7A, plus URL path references (e.g., `/ftp` → new path)
- [ ] **7.6** Update any test that asserts on specific product names or user emails in API responses

### 7C: Cypress E2E tests (`test/cypress/`)

- [ ] **7.7** Update all E2E specs for new product names, user credentials, URLs
- [ ] **7.8** Note: these will need further updates when the attack vector shuffle is implemented (Phase 9+), so keep changes minimal here — just enough to not reference old branding

### 7D: Frontend unit tests (`frontend/src/**/*.spec.ts`)

- [ ] **7.9** Replace any "Juice Shop" / product name / user references in component test fixtures and assertions

### 7E: Verify Phase 7

- [ ] **7.10** Run `npm run lint` → passes
- [ ] **7.11** Run `npm run test:server` → passes (or note expected failures from not-yet-shuffled challenges)
- [ ] **7.12** Run `npm run test:api` → same

---

## Phase 8 — Final Verification & Leak Sweep

The gauntlet. After all phases, confirm nothing leaks.

### 8A: Automated grep sweep

- [ ] **8.1** Run the master check on ALL runtime-served files:
  ```bash
  grep -ri "juice\|owasp\|wasp" \
    config/ data/static/ frontend/src/ views/ routes/ lib/ models/ \
    ftp/ .well-known/ monitoring/ Dockerfile app.json swagger.yml \
    --include="*.ts" --include="*.js" --include="*.html" --include="*.json" \
    --include="*.yml" --include="*.yaml" --include="*.css" --include="*.scss" \
    --include="*.pug" --include="*.hbs" --include="*.md" --include="*.vtt" \
    | grep -v node_modules
  ```
  → Must return **zero** hits. Fix any stragglers.

- [ ] **8.2** Check image/binary filenames: `find . -not -path "*/node_modules/*" \( -name "*juice*" -o -name "*owasp*" -o -name "*wasp*" \)` → zero results
- [ ] **8.3** Check binary file contents for embedded strings: run `strings` on `.mp4`, `.kdbx`, `.pyc`, `.ico`, `.png` files in served directories and grep for "juice"/"owasp"

### 8B: Runtime smoke test

- [ ] **8.4** Start the app (`npm start`) and browse through all major pages: home, product listing, search, basket, login, register, profile, admin (as admin), score board, contact
- [ ] **8.5** Check browser DevTools → Network tab for any API response containing "juice" or "owasp" strings
- [ ] **8.6** Check the HTML source of every page for old branding in meta tags, comments, or data attributes
- [ ] **8.7** Verify the Prometheus `/metrics` endpoint uses the new prefix
- [ ] **8.8** Verify the renamed FTP path serves files correctly and directory listing works (for the challenge)

### 8C: Web search simulation

- [ ] **8.9** Take 5 random strings from the running app (a product name, a user email local part, an error message, a URL path, a challenge hint phrase) and web-search each one. Confirm none return Juice Shop-specific results
- [ ] **8.10** Search for the new brand name + "security" / "vulnerability" / "CTF" to confirm no pre-existing association

### 8D: Build & test gate

- [ ] **8.11** `npm run build` → success
- [ ] **8.12** `npm run lint` → passes
- [ ] **8.13** `npm run test:server` → passes
- [ ] **8.14** `npm run test:api` → passes
- [ ] **8.15** `npm run rsn` → passes (or note which RSN entries need updating due to code changes)

### 8E: Final sign-off

- [ ] **8.16** Update `docs/obfuscation-mapping.md` with final "all done" status
- [ ] **8.17** Commit all changes with a clear message (e.g., "Obfuscate branding: replace OWASP Juice Shop identity with <BRAND>")

---

## Phase 9+ — Attack Vector Shuffle (Future)

The obfuscation is a prerequisite, not the goal. Once the app is unrecognizable as Juice Shop, the actual attack vector shuffling begins. This phase is out of scope for this document but noted here for sequencing:

- [ ] **9.1** Design the shuffle algorithm (which vectors can be swapped between challenges without breaking dependencies)
- [ ] **9.2** Implement vector swaps in `routes/`, `lib/`, and challenge detection logic
- [ ] **9.3** Update RSN codefixes for any modified vulnerability snippets
- [ ] **9.4** Update Cypress E2E tests to match new attack paths
- [ ] **9.5** Re-run full verification (Phase 8) after shuffle

---

## Dependency Graph (simplified)

```
0.1–0.7 (decisions)
    │
    ▼
Phase 1 (identity/config) ──────────────────────┐
    │                                            │
    ├──► Phase 2 (products)                      │
    │         │                                  │
    │         ▼                                  │
    ├──► Phase 3 (users) ◄── needs mapping from 0.7
    │         │                                  │
    │         ▼                                  │
    ├──► Phase 4 (i18n) ◄── needs 2+3 done      │
    │                                            │
    ├──► Phase 5 (served files)                  │
    │                                            │
    ├──► Phase 6 (headers/metadata)              │
    │                                            │
    └──► Phase 7 (tests) ◄── can parallel with 2–6
                                                 │
    All of the above ──────────────────────────► Phase 8 (verification)
                                                 │
                                                 ▼
                                          Phase 9+ (shuffle)
```

**Critical path**: 0 → 1 → 3 → 4 → 8. Phases 2, 5, 6, 7 can proceed in parallel once their prerequisites are met.

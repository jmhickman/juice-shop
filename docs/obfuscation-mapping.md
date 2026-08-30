# Obfuscation Mapping — Lollo Logistics Web Store

## Brand Decisions (Phase 0)

| Field | Value |
|-------|-------|
| **Brand name** | Lollo Logistics Web Store |
| **Short brand** (for UI, config `application.name`) | Lollo Logistics |
| **Product theme** | Logistics products & shipping services, themed with Wuthering Waves items |
| **Domain** (email local part suffix) | lollo-logistics |
| **Altcoin name** | Lollocoin |
| **Metrics prefix** | lollo |
| **Chatbot name** | Lolly the Dispatch Assistant |
| **Easter egg planet** | Resonara |
| **Privacy contact email** | donotreply@lollo-logistics.shop |

## Naming Conventions

- Product images: `product_<NN>.jpg` or thematic (`resonance_box.jpg`, `echo_crate.png`)
- User emails: `<local>@lollo-logistics.shop` (e.g., `admin@lollo-logistics.shop`)
- Metrics: `lollo_challenges_solved`, `lollo_cheat_score`, etc.
- LLM provider name: `lollo-logistics-llm`

## Product Mapping (Phase 2 — to be filled)

| # | Old Name | New Name | Image File |
|---|----------|----------|-----------|
| 1 | Apple Juice (1000ml) | _TBD_ | `product_01.jpg` |
| 2 | Orange Juice (1000ml) | _TBD_ | `product_02.jpg` |
| ... | ... | ... | ... |

## User Mapping (Phase 3 — to be filled)

| Old Email | New Email | Old Username | New Username | Role | Notes |
|-----------|-----------|--------------|--------------|------|-------|
| admin | _TBD_@lollo-logistics.shop | — | — | admin | Weak password challenge target |
| jim | _TBD_@lollo-logistics.shop | — | — | customer | SQLi login challenge |
| bender | _TBD_@lollo-logistics.shop | — | — | customer | Multiple auth challenges |
| bjoern.kimminich@gmail.com | _TBD_@lollo-logistics.shop | bkimminich | _TBD_ | admin (OAuth) | OAuth login challenge |
| ciso | _TBD_@lollo-logistics.shop | — | — | customer | |
| support | _TBD_@lollo-logistics.shop | — | — | customer | Support team login challenge |
| morty | _TBD_@lollo-logistics.shop | — | — | customer | Anti-automation reset challenge |
| mc.safesearch | _TBD_@lollo-logistics.shop | — | — | customer | Rapper credentials challenge |
| J12934 | _TBD_@lollo-logistics.shop | — | — | customer | |
| wurstbrot | _TBD_@lollo-logistics.shop | wurstbrot | _TBD_ | customer | 2FA challenge target |
| amy | _TBD_@lollo-logistics.shop | — | — | customer | Data exposure login |
| bjoern | _TBD_@lollo-logistics.shop | — | — | customer | Password reset challenges |
| bjoern@owasp.org | _TBD_@lollo-logistics.shop | — | — | customer | OWASP account reset challenge |
| chris.pike | _TBD_@lollo-logistics.shop | — | — | customer (erased) | GDPR ghost login |
| accountant | _TBD_@lollo-logistics.shop | — | — | customer | Ephemeral accountant SQLi |
| uvogin | _TBD_@lollo-logistics.shop | — | — | customer | Password reset challenge |
| demo | _TBD_@lollo-logistics.shop | — | — | customer | |
| john | _TBD_@lollo-logistics.shop | j0hNny | _TBD_ | customer | Geo stalking (meta) |
| emma | _TBD_@lollo-logistics.shop | E=ma² | _TBD_ | customer | Geo stalking (visual) |
| stan | _TBD_@lollo-logistics.shop | SmilinStan | _TBD_ | customer | |
| ethereum | _TBD_@lollo-logistics.shop | evmrox | _TBD_ | customer | Web3 wallet challenge |
| testing | _TBD_@lollo-logistics.shop | — | — | customer | Exposed credentials (hardcoded) |
| cloud-admin | _TBD_@lollo-logistics.shop | — | — | admin | IaC leaked key login |
| basil | _TBD_@lollo-logistics.shop | — | — | customer | |

## URL / Path Mapping (Phase 5)

| Old Path | New Path | Notes |
|----------|----------|-------|
| `/ftp` | `/archive` | Directory listing challenge target |
| `/support/logs` | `/ops/logs` | Access log disclosure challenge |
| `owasp_promo.mp4` | `lollo_promo.mp4` | Video XSS challenge target |
| `owasp_promo.vtt` | `lollo_promo.vtt` | Subtitles for promo video |

## Asset Filename Mapping (Phase 1D)

| Old File | New File |
|----------|----------|
| `JuiceShop_Logo.png` | `lollo_logo.png` |
| `JuiceShop_Logo.svg` | `lollo_logo.svg` |
| `JuiceShop_Logo_400px.png` | `lollo_logo_400px.png` |
| `JuiceShop_Logo_100px.png` | `lollo_logo_100px.png` |
| `JuiceShop_Logo_50px.png` | `lollo_logo_50px.png` |
| `JuiceShopCTF_Logo.png` | `lollo_ctf_logo.png` |
| `JuiceShopCTF_Logo_400px.png` | `lollo_ctf_logo_400px.png` |
| `favicon_js.ico` | `lollo_favicon.ico` |
| `favicon_ctf.ico` | `lollo_ctf_favicon.ico` |
| `Welcome_Banner.svg` | `welcome_banner.svg` (new content) |
| `JuicyChatBot.png` | `lolly_avatar.png` |
| `JuicyBot.png` | `lolly_instructor.png` |
| `JuicyBot_MedicalMask.png` | `lolly_masked.png` |
| `juicyEvilWasp.png` | `hidden_agent.png` (new character) |
| `orangemap2k.avif` | `resonara_surface.avif` (new texture) |
| `JuiceShop.stl` | `lollo_crate.stl` (generic 3D model) |

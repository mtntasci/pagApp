# PAG Design System

## 1. Purpose

This document defines the approved visual design language for PAG across:

- iOS — Swift + SwiftUI- Android — Kotlin + Jetpack Compose- PAG Admin Web — Next.js + TypeScript- PAG Customer Web — Next.js + TypeScript

The goal is to keep PAG visually consistent while respecting native platform conventions.

PAG should feel:

- trustworthy- modern- fast- rewarding- premium but accessible- energetic without looking like a game or casino product

The core visual idea is:

**Trust + Progress + Priority + Reward**

---

# 2. Approved Brand Direction

The approved visual direction is based on:

- deep midnight navy as the trust/security foundation- electric lime as the distinctive PAG accent- restrained use of bright color- clean surfaces- generous spacing- strong hierarchy- minimal decoration

The lime accent represents:

- reward- progress- priority- gain- momentum

The navy foundation represents:

- trust- stability- security- control

PAG must not visually resemble:

- a crypto exchange- a casino / betting application- a coupon-spam application- a generic purple AI SaaS dashboard- a children’s game

---

# 3. Logo & App Icon Direction

Approved direction:

- rounded-square app icon- dark midnight/navy background- electric lime PAG/P pulse symbol- simple, premium, high-contrast composition- subtle depth is acceptable- symbol should remain recognizable at small sizes

The symbol concept combines:

- P / PAG identity- upward movement- pulse / progress- priority

Do not replace the logo with generic:

- checkboxes- survey sheets- chat bubbles- TL symbols- bar charts- coins

until explicitly approved.

The current generated icon is the visual reference direction, but final production exports must be created separately for platform requirements.

Required final logo variants later:

- master symbol- horizontal wordmark- monochrome dark- monochrome light- app icon- favicon- splash-safe mark

---

# 4. Core Color Palette

## Brand Colors

### PAG Midnight

`#011033`

Primary dark brand foundation.

Use for:

- primary dark surfaces- headers- navigation backgrounds- premium cards- app icon background

Do not use it for every surface.

### PAG Lime

`#B7F34A`

Primary brand accent.

Use for:

- primary CTA emphasis- Profile Score highlights- reward highlights- ranking advantage- selected states where brand emphasis is appropriate- progress moments

PAG Lime is NOT the generic success color.

### PAG Blue

`#3977F6`

Supporting digital/interaction color.

Use for:

- links- informational states- charts where a second brand color is needed- secondary interactive emphasis

---

# 5. Neutral Colors

## Light Theme

Background Primary: `#F7F8FA`

Surface Primary: `#FFFFFF`

Surface Secondary: `#F0F2F5`

Text Primary: `#111827`

Text Secondary: `#667085`

Text Muted: `#98A2B3`

Border Default: `#E4E7EC`

Border Strong: `#D0D5DD`

## Dark Theme

Background Primary: `#0B101B`

Surface Primary: `#151D2B`

Surface Secondary: `#1C2636`

Text Primary: `#F8FAFC`

Text Secondary: `#B8C0CC`

Text Muted: `#7E8998`

Border Default: `#263244`

Border Strong: `#344258`

---

# 6. Semantic Colors

Success: `#16A34A`

Warning: `#F59E0B`

Error: `#DC2626`

Info: `#3977F6`

Important rule:

**Brand accent and semantic state colors must remain separate.**

Do not use PAG Lime to communicate generic success.

Example:

Correct:

- "Profil Puanı +50" → PAG Lime- "Ödeme başarıyla işlendi" → Success Green

---

# 7. Color Usage Ratio

Recommended balance for consumer-facing mobile screens:

- 70–80% neutral background/surfaces- 15–20% navy/dark brand surfaces- 5–10% lime accent

The lime color should feel valuable because it is limited.

Avoid large full-screen lime backgrounds except for highly intentional campaign moments.

---

# 8. Theme Strategy

PAG must support design tokens for both light and dark themes.

However, design decisions must not depend on raw hex values inside components.

Components should reference semantic tokens.

Example:

- `backgroundPrimary`- `surfacePrimary`- `surfaceElevated`- `textPrimary`- `textSecondary`- `brandAccent`- `interactivePrimary`- `rewardHighlight`- `borderDefault`- `success`- `warning`- `error`

The production token source should live under:

`packages/design-tokens/`

---

# 9. Typography

## General Rules

Typography should be:

- highly readable- contemporary- neutral- compact enough for data-heavy dashboards- friendly enough for mobile consumers

Avoid decorative fonts in application UI.

## Web

Preferred:

**Inter**

Fallback:

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

## iOS

Use the native Apple system font through SwiftUI by default.

Do not force a custom web font into iOS merely for visual sameness.

## Android

Use the native Android typography system / Roboto-compatible defaults through Jetpack Compose unless otherwise approved.

---

# 10. Typography Scale

Recommended semantic roles:

Display: 32–40

Title Large: 28–32

Title: 22–24

Heading: 18–20

Body Large: 16–18

Body: 15–16

Body Small: 13–14

Caption: 11–12

Exact platform values may vary slightly for native ergonomics.

Use semantic typography roles rather than arbitrary font sizes inside each screen.

---

# 11. Spacing System

Use a 4-point base grid.

Preferred spacing tokens:

- 4- 8- 12- 16- 20- 24- 32- 40- 48- 64

Most component spacing should use:

8 / 12 / 16 / 24 / 32

Avoid random values such as 13px, 19px, or 27px unless required for optical correction.

---

# 12. Radius System

PAG should feel modern and soft, but not cartoon-like.

Recommended radius tokens:

Small: 8

Medium: 12

Large: 16

XL: 20

Pill: 999

Primary cards should generally use 16–20.

Buttons should generally use 12–16.

Inputs should generally use 12.

---

# 13. Shadows & Elevation

Use shadows sparingly.

Prefer:

- surface contrast- borders- spacing

before strong drop shadows.

Mobile cards should not look like floating ecommerce tiles.

Dark theme elevation should mainly be communicated by surface tone rather than strong shadows.

---

# 14. Buttons

## Primary Button

Background:

PAG Lime

Text:

PAG Midnight / near-black

Use for the strongest action on the screen.

Examples:

- Ankete Katıl- Devam Et- Ödülü Gör- Kaydet

Do not place multiple competing primary lime buttons in the same visual area.

## Secondary Button

Use neutral or dark surface with strong text.

## Destructive Button

Use semantic Error color.

Never use PAG Lime for destructive actions.

## Disabled

Disabled buttons should not look actionable.

Reduce contrast clearly, but preserve accessibility.

---

# 15. Cards

PAG cards are central to the mobile experience.

Card hierarchy:

1. Survey card2. Profile Score card3. Reward card4. Ranking/priority card5. informational card

Recommended styling:

- clean surface- 16–20 radius- minimal border- restrained shadow- clear text hierarchy- lime used only for value/highlight

Avoid gradients on every card.

---

# 16. Survey Cards

Survey cards should communicate at a glance:

- survey title- organization/PAG owner where relevant- Profile Score reward- monetary/voucher reward where relevant- estimated effort/time if available- availability/status- primary CTA

Reward and Profile Score must be visually distinct.

Example hierarchy:

**Otomotiv Tercihleri**

Ford

+50 Profil Puanı

1.000 TL Ödül Havuzu

2 dk

[ Ankete Katıl ]

Do not make the monetary value visually dominate every other part of the product.

---

# 17. Profile Score Presentation

Profile Score is a core PAG concept.

It should have a consistent visual language across the product.

Use PAG Lime as its primary highlight.

Examples:

`12.480 Profil Puanı`

`+50`

`İlk %8`

Score presentation may use:

- subtle pulse motif- small upward indicator- ranking context

Avoid coin-like visuals unless specifically approved.

Profile Score is not money.

---

# 18. Reward Presentation

Monetary rewards and vouchers should feel valuable and trustworthy.

Use:

- clear currency formatting- neutral surface- lime accent sparingly- clear reward status

Example states:

- Kazanıldı- Bekliyor- Çekilebilir- Çekim Talebi Oluşturuldu- Hediye Çeki Atandı

Never visually imply that Profile Score is directly withdrawable money.

---

# 19. Inputs & Forms

Inputs should use:

- 12 radius- clear labels- visible focused state- semantic error messaging- sufficient touch targets

Do not rely on placeholder text as the only label.

Forms should feel calm and predictable.

KYC or payout-related forms should look more serious and restrained than campaign/promotional screens.

---

# 20. Navigation

## iOS

Respect native SwiftUI navigation conventions.

Use native navigation bars, sheets, dialogs, and gestures where appropriate.

## Android

Respect Jetpack Compose / Android navigation conventions.

Do not force iOS navigation patterns into Android.

## Web

Admin and customer dashboards may use persistent side navigation on desktop.

Responsive layouts should collapse cleanly for smaller screens.

---

# 21. Iconography

Use clean, modern, consistent stroke-based icons where appropriate.

Avoid mixing multiple unrelated icon styles.

Brand symbol should not be reused as a generic UI icon.

Common UI icons should communicate function, not decoration.

---

# 22. Motion

Motion should communicate response, progress, and hierarchy.

Use short, purposeful animation.

Recommended areas:

- score increase- survey completion- reward reveal- ranking movement- navigation transitions

Avoid:

- constant glowing- excessive bouncing- casino-like reward explosions- confetti on ordinary actions

A reward moment may use a restrained celebratory animation where appropriate.

---

# 23. Haptics

Native applications may use haptics for meaningful interactions.

Examples:

- survey completion- reward awarded- important confirmation

Do not add haptic feedback to every tap.

---

# 24. Accessibility

Minimum requirements:

- readable contrast- dynamic text support where practical- sufficient touch targets- labels for icons- screen-reader friendly controls- no information communicated by color alone

Lime on white may require careful contrast handling.

Primary lime buttons should generally use dark text.

---

# 25. Mobile Home Direction

The consumer home screen should prioritize:

1. Profile Score / priority advantage2. Available surveys3. Reward opportunities4. current balance/rewards5. useful profile actions

The product should not open with a casino-style "money won" message.

Core emotional framing:

**Improve your profile → gain priority → participate earlier → earn rewards.**

---

# 26. Admin Dashboard Design

Admin screens should prioritize information density and operational clarity.

Use PAG brand accents sparingly.

Primary focus:

- campaign status- survey status- response counts- delivery metrics- reward metrics- warnings/errors

Avoid consumer-style promotional visuals in admin workflows.

---

# 27. Customer Dashboard Design

Customer dashboards should feel professional and report-oriented.

Organization branding may appear as content where approved, but PAG remains the platform shell.

Customer dashboards must clearly separate:

- survey responses- live profile statistics- campaign delivery metrics- reward statistics

Charts should prioritize readability over decoration.

---

# 28. Data Visualization

Use charts only when they improve comprehension.

Preferred visual hierarchy:

- neutral base- PAG Blue for standard series- PAG Lime for priority/highlight series- semantic colors for warning/error/success

Do not create rainbow dashboards.

Use the minimum number of colors needed to explain the data.

---

# 29. Content Tone

UI copy should be:

- direct- short- confident- clear- non-technical for consumers

Avoid manipulative urgency.

Good:

"Anket başladı"

"+50 Profil Puanı"

"1.000 TL ödül havuzu"

Avoid:

"HEMEN TIKLA!!! SON ŞANS!!!"

unless a legally/operationally valid urgency message is explicitly required.

---

# 30. Design Token Ownership

The canonical design specification is this document.

Implementation tokens should live under:

`packages/design-tokens/`

Web, iOS, and Android should map their native/platform tokens to the same semantic concepts.

Do not attempt to share compiled UI components across native and web platforms.

Share design language and contracts, not platform UI code.

---

# 31. Raw Color Rule

Do not scatter raw hex values across application code.

Bad:

```textbackground: #B7F34A```

inside dozens of components.

Good:

```textbrandAccent```

resolved by the platform theme layer.

Raw color definitions belong in centralized design token/theme files.

---

# 32. Current Approved Decisions

Approved:

- Midnight navy foundation- Electric lime brand accent- Supporting digital blue- PAG Pulse / P icon direction- modern / premium / trustworthy visual character- native platform-specific interaction patterns- semantic design tokens- restrained accent usage

Splash background uses PAG Midnight (#011033)

Login background uses PAG Midnight (#011033)

Not yet finalized:

- final vector logo artwork- exact wordmark typography- full icon library\- final light/dark default choice- exact illustration style- marketing-site visual language

These items require separate approval.

---

# 33. Agent Rules

Agents working on PAG UI must:

- read this file before visual implementation- use centralized tokens- avoid inventing new brand colors- avoid arbitrary gradients- avoid unapproved logo modifications- respect platform conventions- keep Reward and Profile Score visually distinct- preserve accessibility- not claim a design is approved unless it has been explicitly approved

If the design system does not define a needed pattern, use the closest existing semantic rule and mark the decision for review instead of inventing a new permanent brand rule.

---

# 34. Brand Assets & App Icon Standard

## 34.1 Master Asset PrincipleAll platform brand assets (iOS, Android, Admin Web, Customer Web) must be derived from a single canonical master asset location:

`packages/design-tokens/assets/brand/`

Subdirectories:- `pag-symbol/`: Master standalone P / Pulse vector assets.- `pag-logo/`: Primary logo variants (Symbol + Wordmark).- `app-icon/`: Master application icon exports (1024x1024 master).

Platform-specific asset directories (e.g. iOS `Assets.xcassets/AppIcon.appiconset`, Android `res/mipmap-*` and `res/drawable/`) MUST be derived from these master files.

## 34.2 Asset Hierarchy & Terminology- **PAG Symbol**: Standalone P / Pulse icon mark (Electric Lime `#B7F34A`).- **PAG Wordmark**: Custom "PAG" typography text.- **PAG Primary Logo**: PAG Symbol + PAG Wordmark composition.- **App Icon**: PAG Symbol centered on solid Midnight Navy (`#011033`) background. NO text, NO currency symbols, NO checklist/survey graphics.

## 34.3 iOS App Icon Standard- Master Image: Opaque 1024x1024 PNG with full-bleed `#011033` background.- Corner Radius: Must NOT bake artificial rounded corners or fake masks into the image file. iOS applies system squircle masking dynamically.- Safe Area: Keep centered PAG Symbol within inner 80% boundary to prevent edge clipping during OS masking.

## 34.4 Android Adaptive Icon Standard- Architecture: Android 8.0+ (API 26+) Adaptive Icons framework (`res/mipmap-anydpi-v26/ic_launcher.xml`).- Background Layer (`drawable/ic_launcher_background.xml`): Solid Midnight Navy (`#011033`).- Foreground Layer (`drawable/ic_launcher_foreground.xml`): PAG Electric Lime (`#B7F34A`) Symbol centered within 108dp x 108dp viewport.- Safe Zone Rule: The symbol MUST fit entirely inside a centered 66dp diameter circle (safe zone). This guarantees the symbol remains intact regardless of device OEM masks (circle, squircle, rounded square, teardrop).- Folder Structure:```textres/├── drawable/│   ├── ic_launcher_background.xml│   └── ic_launcher_foreground.xml└── mipmap-anydpi-v26/├── ic_launcher.xml└── ic_launcher_round.xml```

## 34.5 Splash / Launch Screen Standard- Visual Tone: Clean, minimalist, and instant loading.- Elements allowed: Midnight Navy background (`#011033`) + centered Electric Lime (`#B7F34A`) PAG Symbol.- Explicitly Prohibited on Launch Screen:- NO advertisements or promotional banners- NO marketing slogans or taglines- NO progress bars or loading spinners- NO complex animations or video splash loops- Platform Consistency: Both iOS (`LaunchScreen`) and Android (`SplashScreen` API) must share identical visual identity while adhering to native system launch practices.

## 34.6 Clear Space & Usage Rules- Minimum Clear Space: At least 50% of symbol height around all edges of logo.- Minimum Digital Size: Symbol height minimum 16px.

## 34.7 Explicit Brand Asset Prohibitions (Yasaklar)1. **Color Alteration**: Never change Lime (`#B7F34A`) or Midnight Navy (`#011033`) to arbitrary hex values.2. **Gradients**: Never apply unapproved multi-color gradients across the PAG symbol.3. **Inconsistent Effects**: Never add 3D drop shadows, outer glows, or bevel effects that differ across platforms.4. **Proportion Distortion**: Never stretch, squeeze, or alter aspect ratio of the P / Pulse symbol.5. **Text in App Icon**: Never put "PAG" wordmark or any text inside the app icon container.6. **Currency & Survey Icons**: Never add TL/dollar/coin symbols, checkboxes, or survey sheets to brand assets or app icons.7. **Alternative Symbol Designs**: Never draw or use alternative versions of the P symbol.8. **Cross-Platform Divergence**: Never use different logo designs or brand symbols for iOS vs Android.

**## 34.8 Splash & Login Brand Surface

Approved Brand Background: #011033 (PAG Midnight).

This replaces the previous #101827 navy value across the PAG brand foundation.

Splash Screen: full-screen #011033 background with centered PAG Symbol / approved logo asset.

Login Screen: primary page background must use #011033.

Login cards, buttons, and input surfaces may use lighter/darker semantic surface tokens, but the page foundation remains #011033.

Electric Lime (#B7F34A) remains the primary CTA / Profile Score / reward-priority accent.

Do not introduce a second competing blue background on Splash or Login.

Do not use raw hex values inside individual SwiftUI / Jetpack Compose views; update the centralized iOS and Android theme tokens.

iOS and Android must map the same semantic brand token to #011033.

If the PAG logo is displayed on Splash/Login, use the real approved PAG asset rather than a recreated placeholder.

PAG Story Bar**

- **Home Item**: The first item is always the real PAG Symbol. It cannot be changed by the admin.- **Images**: Survey story items use content-related imagery (selected by PAG Admin) instead of text initials or generic icons.- **Style**: Images are displayed with a circular crop, centered focus, and a PAG-specific colored ring (no Instagram-style gradient copies). Organization logos are not mandatory.- **Earn Score Item**: Semantic `Lime` treatment is used for the +Puan item.- **Order**: Story order is controlled by admin configuration, allowing dynamic sorting without hardcoded positions.
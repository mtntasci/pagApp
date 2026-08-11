# PAG Master Brand Assets

This directory is the canonical source of truth for PAG master brand assets across all platforms (iOS, Android, Admin Web, Customer Web).

## Structure

```text
packages/design-tokens/assets/brand/
├── pag-symbol/     # Master standalone P / Pulse symbol vectors
├── pag-logo/       # Full PAG logo variants (Symbol + Wordmark)
├── app-icon/       # Master application icon exports (1024x1024 master)
└── README.md       # Asset specification & usage documentation
```

## Brand Color Palette

- **PAG Midnight Navy**: `#101827` (Primary dark background foundation)
- **PAG Electric Lime**: `#B7F34A` (Primary brand accent / P pulse symbol)
- **PAG Blue**: `#3977F6` (Supporting digital interaction / info)

## Asset Categories & Definitions

### 1. PAG Symbol (`pag-symbol/`)
- Contains only the stylized PAG "P / Pulse" symbol without typography.
- Used in: App Icon, compact UI badges, splash screen center, favicon.

### 2. PAG Logo (`pag-logo/`)
- Contains the full brand logo: PAG Symbol + "PAG" Wordmark.
- Required variants:
  - Primary (Midnight background, Lime symbol + White text)
  - Dark background variant
  - Light background variant
  - Monochrome dark / light variants

### 3. App Icon (`app-icon/`)
- Master 1024x1024 export for native mobile app icons.
- Composition: Solid Midnight Navy (`#101827`) background with centered PAG Electric Lime (`#B7F34A`) Symbol.
- Rules:
  - NO text or wordmark
  - NO artificial rounded corners baked into the image
  - NO gradient effects, shadows, currency symbols, or badges

## Platform Asset Derivation

### iOS
- Master 1024x1024 PNG exported from `app-icon/` and placed into `apps/ios/PagApp/Assets.xcassets/AppIcon.appiconset/`.
- iOS automatically applies system squircle corner masking.

### Android
- Adaptive Icon standard:
  - Foreground vector (`ic_launcher_foreground.xml`): PAG Electric Lime symbol centered within the 66dp diameter safe zone (108dp x 108dp viewport).
  - Background vector (`ic_launcher_background.xml`): Solid `#101827` Midnight Navy.

---

> **Note**: Official production vector assets (`.svg`, `.pdf`) will be placed into these folders upon final approval. Do not place unapproved, fake, or low-quality placeholder files in this directory.

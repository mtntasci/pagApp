# PAG - Next.js Monorepo Workspace Dokümantasyonu

Bu proje, **Persona Analytics & Geotargeting (PAG)** platformunun modern Next.js App Router mimarisine ve monorepo yapısına taşınmış tam sürümüdür.

## Klasör Yapısı

```bash
├── apps
│   ├── mobile                 # Next.js 14 Mobil Uygulama Client'ı
│   │   ├── package.json
│   │   ├── src
│   │   │   └── app
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx   # Mobil Akış ve Ödüllü Telefon Doğrulama Ekranı
│   │   │       └── globals.css
│   └── portal                 # Next.js 14 Marka Kontrol ve Analiz Paneli
│       ├── package.json
│       ├── src
│       │   └── app
│       │       ├── layout.tsx
│       │       ├── page.tsx   # Kampanya & Ödemeler Yönetim Paneli
│       │       └── globals.css
├── packages
│   └── shared                 # Ortak Kullanılan Veriler ve TypeScript Tipleri
│       ├── data.ts            # Başlangıç Anketleri ve Demografi Soruları
│       └── types.ts           # Global Tip Tanımlamaları
├── package.json               # Monorepo Ana Yapılandırma Dosyası
└── MONOREPO.md                # Bu Kılavuz Dosyası
```

---

## Kurulum ve Çalıştırma

Monorepo yapısı, tüm paketlerin tek bir çatı altında ve tek bir komutla yönetilmesini sağlar. Projeyi lokalde çalıştırmak için aşağıdaki adımları izleyin:

### 1. Bağımlılıkları Yükleyin

Proje kök dizininde npm, yarn veya pnpm kullanarak tüm workspaces bağımlılıklarını tek seferde yükleyin:

```bash
npm install
```

### 2. Uygulamaları Geliştirme Modunda Çalıştırın

Tüm uygulamaları (Mobile ve Portal) aynı anda geliştirme modunda çalıştırmak için:

```bash
npm run dev --workspaces
```

Veya sadece belirli bir uygulamayı çalıştırmak için:

#### Mobil Uygulama (Next.js)
```bash
npm run dev --workspace=@pag/mobile
```

#### Marka Portalı (Next.js)
```bash
npm run dev --workspace=@pag/portal
```

---

## Next.js Mimari Özellikleri

1. **App Router:** `apps/mobile` ve `apps/portal` projeleri, Next.js 14'ün dosya tabanlı yeni yönlendirme sistemi (App Router) ile inşa edilmiştir.
2. **Modüler Tasarım:** Tipler ve veri modelleri `packages/shared` altında toplanmış olup, kod tekrarını %100 önler.
3. **Tailwind CSS:** Stil yapılandırması bağımsız paketler halinde yönetilir, hızlı derleme ve optimize edilmiş CSS çıktıları üretir.
4. **Motion (AnimatePresence):** Mobil arayüzdeki sayfa geçişleri ve akıcı popuplar için modern animasyon kütüphanesi entegre edilmiştir.

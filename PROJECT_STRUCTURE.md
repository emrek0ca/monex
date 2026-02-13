# 🏦 MONEX - Kişisel Finans Yönetim Platformu

> **Modern, oyunlaştırılmış kişisel finans takip uygulaması**

## 📋 Proje Özeti

Monex, kullanıcıların finansal durumlarını takip etmelerini, bütçe oluşturmalarını, hedefler belirlemelerini ve harcama alışkanlıklarını analiz etmelerini sağlayan modern bir web uygulamasıdır.

---

## 🛠️ Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Stil** | Tailwind CSS, Framer Motion |
| **State Yönetimi** | Zustand, TanStack React Query |
| **Routing** | React Router DOM v6 |
| **Backend** | PocketBase (BaaS) |
| **3D Grafikler** | Three.js, React Three Fiber |
| **Grafikler** | Recharts |
| **Çok Dil Desteği** | i18next (TR/EN) |
| **Formlar** | React Hook Form |
| **Bildirimler** | Sonner (Toast) |

---

## 📁 Dizin Yapısı

```
monex/
├── public/                     # Statik dosyalar
│   ├── locales/               # Çeviri dosyaları (tr, en)
│   ├── robots.txt             # SEO robot kuralları
│   ├── sitemap.xml            # Site haritası
│   └── site.webmanifest       # PWA manifest
│
├── src/                        # Kaynak kod
│   ├── api/                   # Backend API katmanı
│   ├── assets/                # Görseller ve medya
│   ├── auth/                  # Auth guard bileşenleri
│   ├── components/            # UI bileşenleri
│   ├── hooks/                 # Custom React hook'ları
│   ├── lib/                   # Yardımcı kütüphaneler
│   ├── pages/                 # Sayfa bileşenleri
│   ├── services/              # İş mantığı servisleri
│   ├── store/                 # Zustand store'ları
│   ├── styles/                # Global stiller
│   ├── three/                 # Three.js 3D bileşenler
│   ├── types/                 # TypeScript tip tanımları
│   ├── utils/                 # Yardımcı fonksiyonlar
│   ├── App.tsx                # Ana uygulama bileşeni
│   ├── main.tsx               # Uygulama giriş noktası
│   ├── router.tsx             # Route tanımlamaları
│   └── i18n.ts                # Çoklu dil yapılandırması
│
├── package.json               # Bağımlılıklar ve scriptler
├── vite.config.ts             # Vite yapılandırması
├── tailwind.config.cjs        # Tailwind CSS yapılandırması
└── tsconfig.json              # TypeScript yapılandırması
```

---

## 🔧 Detaylı Dosya Açıklamaları

### `/src/api/` - Backend API Katmanı

| Dosya | Amaç |
|-------|------|
| `client.ts` | PocketBase istemci yapılandırması, API URL'leri |
| `data.ts` | Account, Transaction, Budget, Goal veri modelleri ve CRUD işlemleri |
| `types.ts` | API tip tanımlamaları |
| `auth.ts` | Kimlik doğrulama yardımcıları |

### `/src/hooks/` - Custom Hook'lar

| Hook | Amaç |
|------|------|
| `useAuth.ts` | Giriş, kayıt, şifre sıfırlama, profil güncelleme işlemleri |
| `useData.ts` | CRUD işlemleri için generic hook (accounts, transactions, budgets, goals) |
| `useGamification.ts` | XP kazanma, günlük ödül, streak hesaplama sistemi |
| `useGoals.ts` | Hedef takip ve ilerleme hesaplamaları |
| `useAnalytics.ts` | Harcama analizi ve grafikler için veri işleme |
| `useFormatters.ts` | Para birimi ve tarih formatlama |
| `useMediaQuery.ts` | Responsive tasarım için ekran boyutu algılama |

### `/src/store/` - Zustand State Yönetimi

| Store | Amaç |
|-------|------|
| `userStore.ts` | Kullanıcı oturumu ve profil bilgileri |
| `uiStore.ts` | UI durumu (sidebar, tema vb.) |
| `aistore.ts` | AI asistan durumu (eğer kullanılıyorsa) |

### `/src/components/` - UI Bileşenleri

| Klasör | İçerik |
|--------|--------|
| `Accounts/` | Hesap listesi, hesap form modalı |
| `Budgets/` | Bütçe kartları, bütçe form modalı |
| `Charts/` | Pasta, çubuk ve dahili grafikler (LuxPie vb.) |
| `Dashboard/` | Ana sayfa widget'ları (özet kartlar, son işlemler, AI asistan) |
| `Goals/` | Hedef kartları, hedef form modalı |
| `Layout/` | MainLayout (sidebar ile), AuthLayout (giriş sayfaları) |
| `Navigation/` | Sidebar, mobil navigasyon |
| `Planner/` | Finansal planlama bileşenleri |
| `Search/` | Global arama (FlexSearch entegrasyonu) |
| `Settings/` | Profil düzenleme, güvenlik, tercihler |
| `Transactions/` | İşlem listesi, işlem form modalı |
| `UI/` | Genel UI bileşenleri (Button, Card, Modal, Toaster vb.) |
| `Alerts/` | Uyarı ve bildirim bileşenleri |
| `Analytics/` | Analiz sayfası bileşenleri |
| `SEO/` | SEO meta tag yönetimi (React Helmet) |

### `/src/pages/` - Sayfa Bileşenleri

| Sayfa | Route | Açıklama |
|-------|-------|----------|
| `Dashboard/` | `/` veya `/dashboard` | Ana kontrol paneli |
| `Accounts/` | `/accounts` | Hesap yönetimi (banka, nakit, yatırım) |
| `Transactions/` | `/transactions` | Gelir/gider işlemlerinin listesi |
| `Budgets/` | `/budgets` | Kategori bazlı bütçe tanımlama |
| `Analytics/` | `/analytics` | Harcama analizleri ve grafikler |
| `Goals/` | `/goals` | Finansal hedefler (tasarruf, borç ödeme) |
| `Settings/` | `/settings` | Kullanıcı profili ve uygulama ayarları |
| `Login/` | `/auth/login` | Giriş sayfası (email/telefon) |
| `Register/` | `/auth/register` | Kayıt sayfası |
| `ForgotPassword/` | `/auth/forgot-password` | Şifre sıfırlama isteği |
| `ResetPassword/` | `/auth/confirm-password-reset` | Yeni şifre belirleme |

### `/src/three/` - 3D Görsel Bileşenler

| Dosya | Amaç |
|-------|------|
| `AnimatedBG.tsx` | Animasyonlu 3D arka plan |
| `Bars.tsx` | 3D çubuk grafik animasyonları |
| `Coin.tsx` | Dönen para animasyonu |
| `HeroScene.tsx` | Ana sayfa 3D hero sahne |

### `/src/services/` - İş Mantığı Servisleri

| Servis | Amaç |
|--------|------|
| `gamification.service.ts` | XP, level, rozet hesaplamaları |
| `theme.service.ts` | Tema yönetimi (koyu/aydınlık mod) |

### `/src/utils/` - Yardımcı Fonksiyonlar

| Dosya | Amaç |
|-------|------|
| `finance.ts` | Finansal hesaplamalar (toplam bakiye, kategori özeti vb.) |
| `formatters.ts` | Tarih ve para formatlamaları |

---

## 🎮 Oyunlaştırma Sistemi

Monex, kullanıcı bağlılığını artırmak için bir oyunlaştırma sistemi içerir:

- **XP (Deneyim Puanı)**: Her işlem ekleme, hedef tamamlama vb. aksiyonlar puan kazandırır
- **Seviye Sistemi**: Her 500 XP'de bir seviye atlanır
- **Streak (Günlük Seri)**: Ardışık günlerde uygulamayı kullanma serisi
- **Günlük Ödül**: 24 saatte bir talep edilebilir bonus XP
- **Rakip Sistemi**: Liderlik tablosunda sizden yüksek XP'ye sahip en yakın kullanıcı
- **Liderlik Tablosu**: Tüm kullanıcılar arasında sıralama

---

## 🗄️ Veri Modelleri (PocketBase Collections)

### `monex_accounts` - Hesaplar
```typescript
{
  id, user, name, type, balance, currency
  // type: "bank" | "cash" | "investment" | "savings"
}
```

### `monex_transactions` - İşlemler
```typescript
{
  id, user, account, type, category, amount, note, date, is_normal
  // type: "income" | "expense" | "transfer"
}
```

### `monex_budgets` - Bütçeler
```typescript
{
  id, user, category, limit_amount, current_amount, start_date, end_date
}
```

### `monex_goals` - Hedefler
```typescript
{
  id, user, title, targetAmount, deadline, source_category
}
```

### `monex_users` - Kullanıcılar
```typescript
{
  id, email, name, phone, avatar,
  xp, level, streak, last_active, last_reward_date
}
```

---

## 🌐 Çoklu Dil Desteği

Uygulama Türkçe (tr) ve İngilizce (en) destekler. Çeviri dosyaları:
- `/public/locales/tr/translation.json`
- `/public/locales/en/translation.json`

---

## 🚀 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview

# Lint kontrolü
npm run lint
```

---

## 🔐 Ortam Değişkenleri

`.env` dosyasında tanımlanması gereken değişkenler:

```env
VITE_POCKETBASE_URL=https://api.witlydesign.com
VITE_AI_API_URL=https://wiqoapi.witlydesign.com
```

---

## 📱 Sayfa Yapısı

```
MainLayout (Sidebar + Ana İçerik)
├── Dashboard (Ana Sayfa)
├── Accounts (Hesaplar)
├── Transactions (İşlemler)
├── Budgets (Bütçeler)
├── Analytics (Analizler)
├── Goals (Hedefler)
└── Settings (Ayarlar)

AuthLayout (Giriş/Kayıt Sayfaları)
├── Login
├── Register
├── Forgot Password
└── Reset Password
```

---

## ✨ Önemli Özellikler

1. **Gerçek Zamanlı Bakiye**: İşlemler eklendikçe hesap bakiyeleri otomatik güncellenir
2. **Kategori Bazlı Analiz**: Harcamalar kategorilere göre ayrıştırılıp analiz edilir
3. **Bütçe Takibi**: Belirlenen limitler aşıldığında uyarı verilir
4. **Hedef İlerlemesi**: Tasarruf hedeflerine ne kadar yaklaşıldığı gösterilir
5. **Responsive Tasarım**: Mobil ve masaüstü uyumlu
6. **Tema Desteği**: Koyu ve aydınlık mod
7. **AI Asistan**: Finansal öneriler sunabilecek AI entegrasyonu (WebLLM)

---

## 🔄 Veri Akışı

```
User Action → Component → Hook (useData) → API (data.ts) → PocketBase Backend
                                ↓
                          React Query Cache
                                ↓
                           UI Güncelleme
```

---

*Bu doküman, projenin genel yapısını ve bileşenlerini açıklamaktadır. Her klasör ve dosya hakkında daha detaylı bilgi için ilgili kaynak dosyalarına başvurunuz.*

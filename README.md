# 🏦 Monex - AI Destekli Kişisel Finans Yönetimi

Monex, harcamalarınızı takip etmenizi, bütçeler oluşturmanızı ve yapay zeka desteği ile finansal durumunuzu analiz etmenizi sağlayan modern bir web uygulamasıdır.

## ✨ Özellikler

- 💰 **Hesap Yönetimi:** Tüm banka, nakit ve yatırım hesaplarınızı tek yerden takip edin.
- 📊 **Akıllı Analizler:** Gelir ve giderlerinizi grafiklerle detaylıca inceleyin.
- 🤖 **Wiqo AI Asistan:** Finansal durumunuz hakkında sorular sorun, harcama tahminleri alın.
- 🎯 **Hedef Takibi:** Tasarruf hedefleri belirleyin ve ilerlemenizi izleyin.
- 🛡️ **Güvenlik:** Verileriniz banka seviyesinde şifreleme (AES-256) ile korunur.
- 🌐 **Çok Dil Desteği:** Türkçe ve İngilizce dil seçenekleri.

## 🔐 Ortam Değişkenleri (.env)

Uygulamayı çalıştırmadan önce kök dizinde bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```env
VITE_POCKETBASE_URL=https://api.witlydesign.com
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_ENCRYPTION_KEY=your_secure_random_string_here
VITE_ADMIN_EMAILS=admin@monex.com
```

## 🛠️ Kurulum ve Çalıştırma

```bash
# Projeyi klonlayın
git clone https://github.com/emrek0ca/monex.git
cd monex

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Production build alın
npm run build
```

## 🛡️ Güvenlik Notları

- **Veri Şifreleme:** Tarayıcıda saklanan hassas veriler `VITE_ENCRYPTION_KEY` kullanılarak AES-256 ile şifrelenir.
- **XSS Koruması:** Tüm kullanıcı girişleri DOMPurify ile sanitize edilir.
- **CSP:** İçerik Güvenlik Politikası (Content Security Policy) ile dış saldırılara karşı korunur.

---
Developed by **Osman Emre Koca**

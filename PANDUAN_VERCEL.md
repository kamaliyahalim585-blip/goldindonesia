# Panduan Konfigurasi & Deployment ke Vercel (Web Admin Panel & NusantaraGold)

File konfigurasi `vercel.json` sudah dibuat dan siap digunakan di root project ini.

---

## 1. File Konfigurasi `vercel.json` (Sudah Terpasang)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 2. Pilihan Model Deployment di Vercel

### Opsi A: 1 Domain untuk Keduanya (Aplikasi Investor + Web Admin Terpisah)
- **Aplikasi Investor**: `https://nama-project.vercel.app/`
- **Web Admin Panel**: `https://nama-project.vercel.app/admin`
- Cukup hubungkan repository ke Vercel dan klik **Deploy**. Otomatis berjalan tanpa perlu setting environment variable tambahan.

---

### Opsi B: Web Admin Dibuat Sebagai Website/Domain Mandiri di Vercel
Misalnya Anda ingin memiliki 2 website Vercel yang benar-benar terpisah:
1. `nusantaragold-app.vercel.app` (khusus investor)
2. `admin-nusantaragold.vercel.app` (khusus admin, saat dibuka langsung ke panel admin)

**Langkah Opsi B**:
1. Buat project baru di Vercel untuk admin.
2. Di menu **Project Settings** > **Environment Variables**, tambahkan:
   - Key: `VITE_STANDALONE_ADMIN_PORTAL`
   - Value: `true`
   - *(Opsional)* `VITE_INVESTOR_APP_URL` = `https://nusantaragold-app.vercel.app`
3. Klik **Redeploy**. Sekarang saat membuka halaman utama (`/`), website akan langsung menampilkan **NusantaraGold Control Management (Admin Portal)**!

---

## 3. Langkah-Langkah Deploy ke Vercel

### Menggunakan GitHub / GitLab (Paling Mudah)
1. Unggah kode ke repository GitHub Anda.
2. Buka dashboard [vercel.com](https://vercel.com) dan klik **Add New...** > **Project**.
3. Pilih repository GitHub Anda, klik **Import**.
4. Di bagian **Build and Output Settings**, Vercel akan otomatis mendeteksi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**.
6. Selesai! Web Anda akan online dalam kurun waktu ~1 menit.

### Menggunakan Vercel CLI (Lewat Terminal)
```bash
# 1. Install Vercel CLI (jika belum ada)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy langsung
vercel --prod
```

---

## 4. Konfigurasi Domain Firebase Auth (PENTING untuk Login Google / Firebase)
Setelah mendapatkan domain Vercel Anda (misalnya `https://nusantaragold-admin.vercel.app`):
1. Buka [Firebase Console](https://console.firebase.google.com/project/ethereal-episode-mvxch/authentication/settings).
2. Pilih tab **Settings** > **Authorized domains (Domain yang diotorisasi)**.
3. Klik **Add domain** dan masukkan nama domain Vercel Anda (contoh: `nusantaragold-admin.vercel.app`).
4. Klik **Save**.
*(Langkah ini agar fitur login Google & Firebase Auth diizinkan berjalan di domain Vercel Anda).*

---

## 5. Kredensial Akses Super Admin
- **Email**: `kamaliyahalim585@gmail.com` atau `khoirulanisss@gmail.com`
- **Akses Cepat**: Tombol 1-Klik Masuk Langsung di portal `/admin`
- **Akses Password**: Kata sandi `admin123456` | PIN `123456`

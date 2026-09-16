# Panduan Deploy IndoGold ke Vercel (vercel.app)

Aplikasi IndoGold adalah Single Page Application (SPA) berbasis React 19, TypeScript, Tailwind CSS, dan Vite.

---

## 1. File Konfigurasi Vercel (`vercel.json`)
File `vercel.json` telah dibuat di root proyek:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
* **Rewrites ke `/index.html`**: Sangat penting agar seluruh rute URL dan navigasi halaman SPA tidak menghasilkan error 404 saat pengguna me-refresh halaman di domain `*.vercel.app`.
* **Output Directory**: Otomatis mengarah ke folder `dist` hasil kompilasi Vite.

---

## 2. Cara Deploy ke Vercel

### Opsi A: Melalui Vercel Dashboard & GitHub (Disarankan)
1. Ekspor atau *push* repositori ini ke akun **GitHub** Anda.
2. Buka [vercel.com](https://vercel.com) dan login/daftar.
3. Klik tombol **"Add New..."** lalu pilih **"Project"**.
4. Impor repositori GitHub aplikasi IndoGold Anda.
5. Pada pengaturan proyek:
   - **Framework Preset**: `Vite` (akan terdeteksi secara otomatis)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Klik **"Deploy"**. Dalam ~1 menit, aplikasi Anda akan online di `https://nama-proyek-anda.vercel.app`.

### Opsi B: Menggunakan Vercel CLI
Jalankan perintah berikut di terminal:
```bash
# 1. Install Vercel CLI global jika belum ada
npm install -g vercel

# 2. Login ke akun Vercel
vercel login

# 3. Deploy ke Vercel
vercel --prod
```

---

## 3. PENTING: Autentikasi Firebase di Domain Vercel
Karena aplikasi menggunakan Firebase Auth & Firestore:
1. Buka [Firebase Console](https://console.firebase.google.com).
2. Pilih project: `ethereal-episode-mvxch`.
3. Masuk ke menu **Authentication** > tab **Settings** > **Authorized domains**.
4. Klik **Add domain**, lalu masukkan domain Vercel Anda (misalnya: `indogold-app.vercel.app` atau `*.vercel.app`).
5. Dengan begitu, fitur login dan sinkronisasi database Firestore akan berfungsi dengan lancar di domain publik Vercel Anda.

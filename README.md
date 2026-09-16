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

## 3. PENTING: Penyebab & Solusi Jika Tidak Bisa Login di Vercel

Jika setelah deploy Anda mencoba login dengan akun yang sebelumnya didaftarkan tetapi muncul pesan gagal, ini disebabkan oleh 2 hal standar keamanan Firebase:

### Penyebab 1: Email/Password Sign-In Belum Diaktifkan di Firebase Console
Secara default, Firebase hanya mengaktifkan Google Login. Untuk mengizinkan pengguna mendaftar dan masuk menggunakan Email & Password:
1. Buka [Firebase Console](https://console.firebase.google.com).
2. Pilih project Anda: **`ethereal-episode-mvxch`**.
3. Buka menu **Authentication** > tab **Sign-in method**.
4. Klik **Email/Password** pada daftar penyedia (*Sign-in providers*).
5. Geser sakelar ke **Enable** (Aktifkan), lalu klik **Save** (Simpan).

### Penyebab 2: Domain Vercel Belum Masuk ke "Authorized Domains" Firebase
Firebase Authentication memblokir request autentikasi dari domain publik baru demi keamanan:
1. Di Firebase Console, tetap di menu **Authentication** > klik tab **Settings**.
2. Gulir ke bagian **Authorized domains**.
3. Klik tombol **Add domain**.
4. Masukkan domain Vercel Anda (misalnya: `nama-aplikasi-anda.vercel.app`), lalu klik **Done / Save**.

### Penyebab 3: Akun Baru di Domain Vercel (Origin Isolation)
Penyimpanan peramban (localStorage) terisolasi antara domain preview dan domain Vercel Anda:
* Di domain Vercel Anda yang baru, cukup klik tab **"Daftar Akun Baru"** untuk membuat akun pertama Anda (langsung mendapatkan bonus saldo tunai hingga Rp 30.000).
* Atau Anda juga dapat mengklik tombol **"⚡ Gunakan Akun Demo (1-Klik Isi)"** pada layar login untuk masuk seketika.
* Setelah mendaftar atau masuk sekali di domain Vercel tersebut, akun dan brankas lokal akan tersimpan permanen sehingga Anda dapat keluar dan masuk kembali kapan pun.

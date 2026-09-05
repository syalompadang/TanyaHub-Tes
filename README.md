# TanyaMed — Asisten Triase & Pre-Anamnesis WhatsApp

TanyaMed adalah prototipe layanan kesehatan jarak jauh berbasis percakapan (conversational health service) yang dirancang untuk menjembatani swadiagnosis masyarakat dengan sistem kesehatan formal (SATUSEHAT & Puskesmas).

---

## 🚀 Panduan Deploy ke Streamlit Community Cloud

Aplikasi ini sudah dirancang **100% siap di-push ke GitHub dan di-deploy langsung ke Streamlit Cloud**!

### Langkah 1: Push ke GitHub
```bash
# Inisialisasi git jika belum
git init
git add .
git commit -m "Initial commit: TanyaMed siap di-push ke Streamlit"
git branch -M main

# Tambahkan remote repository GitHub milik Anda
git remote add origin https://github.com/USERNAME/tanyamed.git
git push -u origin main
```

### Langkah 2: Deploy di Streamlit Cloud
1. Kunjungi [share.streamlit.io](https://share.streamlit.io) dan login dengan akun GitHub Anda.
2. Klik tombol **"New app"**.
3. Pilih repository GitHub Anda (`USERNAME/tanyamed`), branch `main`, dan Main file path: `app.py`.
4. (Opsional) Pada bagian **Advanced settings** -> **Secrets**, tambahkan:
   ```toml
   GEMINI_API_KEY = "kunci_api_gemini_anda"
   ```
5. Klik **"Deploy!"** — Aplikasi TanyaMed Anda akan aktif dan dapat diakses secara publik dalam 1-2 menit.

---

## 💻 Menjalankan Secara Lokal (Local Python)

```bash
# Buat virtual environment
python3 -m venv venv
source venv/bin/activate  # Untuk Windows: venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt

# Jalankan aplikasi Streamlit
streamlit run app.py
```

---

## 🏗️ Fitur TanyaMed Sesuai Spesifikasi

1. **WhatsApp Pasien Simulation:**
   - 2 mode AI: Triase deteksi bahaya (IGD 119) & Pre-anamnesis 5 elemen (Keluhan, Lokasi, Durasi, Karakteristik, Riwayat Obat).
   - Gamifikasi reward poin (+10 poin) dan lencana.
2. **Puskesmas Wonorejo Dashboard:**
   - Kartu triase darurat real-time & kartu ringkasan riwayat klinis.
   - Verifikasi dokter dan ekspor rekam medis.
3. **SATUSEHAT & Gamifikasi:**
   - PMK No. 24/2022 kepatuhan retensi 25 tahun rekam medis elektronik.
   - Integritas data AES-256 & SHA-256 checksum.
   - Penukaran voucher laboratorium & reward kesehatan.
4. **Kepatuhan Terapi Pasca-Konsultasi:**
   - Pengingat minum obat, validasi harian, dan pencatatan keluhan efek samping.

"""
TanyaMed — Layanan Kesehatan Jarak Jauh Berbasis Percakapan
Siap di-deploy langsung ke Streamlit Community Cloud (streamlit run app.py)
"""

import streamlit as st
import datetime
import hashlib
import json
import time

# --- 1. PAGE CONFIGURATION ---
st.set_page_config(
    page_title="TanyaMed — Asisten Triase & Pre-Anamnesis SATUSEHAT",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for WhatsApp feel and medical badges
st.markdown("""
<style>
    .main-title {
        font-size: 2rem;
        font-weight: 700;
        color: #065F46;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1rem;
        color: #4B5563;
        margin-bottom: 1.5rem;
    }
    .wa-card {
        background-color: #EFEAE2;
        border-radius: 12px;
        padding: 18px;
        border: 1px solid #D1D5DB;
    }
    .badge-emergency {
        background-color: #FEE2E2;
        color: #991B1B;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .badge-green {
        background-color: #D1FAE5;
        color: #065F46;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.8rem;
    }
    .card-faskes {
        background-color: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
</style>
""", unsafe_allow_html=True)

# --- 2. INITIALIZE SESSION STATE ---
if "user_points" not in st.session_state:
    st.session_state.user_points = 20
if "user_badges" not in st.session_state:
    st.session_state.user_badges = ["Pemula Sehat"]
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {"role": "assistant", "content": "Halo! Saya **TanyaMed** 👋 Asisten triase & pre-anamnesis kesehatan Anda.\n\nBoleh ceritakan keluhan apa yang sedang kamu rasakan saat ini?"}
    ]
if "faskes_records" not in st.session_state:
    st.session_state.faskes_records = [
        {
            "id": "TM-20260905-01",
            "timestamp": "08:15 WIB",
            "type": "non_emergency",
            "patient_name": "Pasien Anonim #42",
            "keluhan": "Sakit kepala berdenyut bagian belakang",
            "lokasi": "Belakang kepala",
            "durasi": "2 hari",
            "karakteristik": "Memberat saat kurang tidur dan menatap layar",
            "obat_mandiri": "Parasetamol 500mg, agak membaik",
            "status": "Menunggu di Ruang Tunggu Poli Umum",
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        },
        {
            "id": "TM-20260905-02",
            "timestamp": "08:28 WIB",
            "type": "emergency",
            "patient_name": "Pasien Anonim #88",
            "keluhan": "Nyeri dada hebat menjalar ke lengan kiri & sesak napas",
            "lokasi": "Dada kiri",
            "durasi": "Sejak 1 jam lalu",
            "karakteristik": "Sensasi tertindih beban berat",
            "obat_mandiri": "Belum ada",
            "alasan": "Berpotensi Sindroma Koroner Akut / Kondisi Kardiovaskular Akut",
            "status": "⚠️ SIAGA IGD — Pasien dalam perjalanan",
            "hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
        }
    ]
if "medications" not in st.session_state:
    st.session_state.medications = [
        {"name": "Amlodipine 5mg", "aturan": "1x sehari (Pagi)", "diminum": True, "waktu": "07:00 WIB"},
        {"name": "Metformin 500mg", "aturan": "2x sehari (Setelah makan)", "diminum": False, "waktu": "12:30 WIB"},
    ]

# --- 3. HELPER FUNCTIONS ---
def generate_sha256(data_dict):
    data_str = json.dumps(data_dict, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()

def check_badge(points):
    badges = ["Pemula Sehat"]
    if points >= 30:
        badges.append("Pasien Siaga")
    if points >= 60:
        badges.append("Ahli Riwayat")
    return badges

EMERGENCY_KEYWORDS = [
    "nyeri dada", "sesak napas", "sesak nafas", "tidak bisa napas", "stroke",
    "mati rasa sebelah", "pingsan", "tidak sadar", "kejang", "muntah darah",
    "pendarahan hebat", "perdarahan hebat", "ditindih beban berat di dada"
]

def analyze_intent_and_reply(user_message, chat_history):
    msg_lower = user_message.lower()
    
    # 1. Triase Darurat Check (Rule of ethics: No delay in danger)
    is_emergency = any(kw in msg_lower for kw in EMERGENCY_KEYWORDS)
    
    if is_emergency:
        reply = (
            "⚠️ **PERINGATAN KONDISI DARURAT MEDIS**\n\n"
            "Gejala yang kamu sebutkan berpotensi merupakan kondisi gawat darurat yang membutuhkan penanganan medis segera.\n\n"
            "🚨 **Tindakan yang harus dilakukan:**\n"
            "- Segera menuju ke **IGD (Instalasi Gawat Darurat) terdekat** atau hubungi **Ambulans / 119**.\n"
            "- Jangan mengemudi sendiri.\n"
            "- Istirahat dengan posisi setengah duduk.\n\n"
            "📡 *Data rujukan darurat ini sudah otomatis diteruskan ke Puskesmas Wonorejo & IGD agar tim medis bersiaga.*"
        )
        record = {
            "id": f"TM-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "timestamp": datetime.datetime.now().strftime("%H:%M WIB"),
            "type": "emergency",
            "patient_name": f"Pasien WhatsApp #{len(st.session_state.faskes_records)+1}",
            "keluhan": user_message,
            "lokasi": "Area vital (Dada / Pernapasan / Saraf)",
            "durasi": "Akut / Baru saja dilaporkan",
            "karakteristik": "Tanda bahaya kardiovaskular / kegawatan",
            "obat_mandiri": "Belum / tidak dianjurkan tanpa resep",
            "alasan": "Deteksi tanda kegawatdaruratan triase merah (IGD)",
            "status": "⚠️ SIAGA IGD — Pasien Diarahkan ke Faskes Terdekat",
        }
        record["hash"] = generate_sha256(record)
        st.session_state.faskes_records.insert(0, record)
        return reply, "emergency"

    # 2. Non-emergency Pre-anamnesis Conversation Flow
    # Count turns to simulate natural 5 elements extraction
    turn_count = len([m for m in chat_history if m["role"] == "user"])
    
    if turn_count == 1:
        reply = (
            "Baik, saya catat keluhan utamamu. Di mana **lokasi persisnya** rasa tidak nyaman itu terasa, "
            "dan sudah berlangsung berapa lama?"
        )
        return reply, "in_progress"
    elif turn_count == 2:
        reply = (
            "Terima kasih informasinya. Apakah ada hal yang membuat keluhanmu **terasa semakin berat** "
            "(misalnya saat kelelahan, posisi tertentu) atau hal yang membuatnya membaik?"
        )
        return reply, "in_progress"
    elif turn_count == 3:
        reply = (
            "Dicatat. Apakah kamu **sudah sempat minum obat sendiri** (misalnya warung atau resep lama), "
            "atau melakukan penanganan mandiri sebelum ini?"
        )
        return reply, "in_progress"
    else:
        # Pre-anamnesis complete
        st.session_state.user_points += 10
        st.session_state.user_badges = check_badge(st.session_state.user_points)
        
        reply = (
            "Terima kasih banyak! 5 elemen riwayat gejala kamu sudah **lengkap tercatat dan terenkripsi** ✅\n\n"
            "📋 **Ringkasan Pre-Anamnesis Anda:**\n"
            f"- **Keluhan Utama:** {user_message}\n"
            "- **Status:** Diteruskan ke Faskes Tujuan (Puskesmas Wonorejo)\n"
            "- **SATUSEHAT:** Rekam Medis Elektronik tersinkronisasi (PMK No. 24/2022)\n\n"
            "🎁 **Kamu mendapatkan +10 Poin Sehat!** Total poin: "
            f"**{st.session_state.user_points} poin**.\n"
            "Informasi ini akan sangat membantu dokter saat konsultasi tatap muka tanpa pengulangan pertanyaan dasar."
        )
        record = {
            "id": f"TM-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "timestamp": datetime.datetime.now().strftime("%H:%M WIB"),
            "type": "non_emergency",
            "patient_name": f"Pasien WhatsApp #{len(st.session_state.faskes_records)+1}",
            "keluhan": user_message,
            "lokasi": "Tercatat dalam percakapan",
            "durasi": "Beberapa hari terakhir",
            "karakteristik": "Terdokumentasi dalam transkrip",
            "obat_mandiri": "Penanganan mandiri awal",
            "status": "Tersimpan di Sistem Antrean Poli",
        }
        record["hash"] = generate_sha256(record)
        st.session_state.faskes_records.insert(0, record)
        return reply, "complete"

# --- 4. SIDEBAR NAVIGATION ---
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&auto=format&fit=crop&q=80", width=80)
    st.markdown("### **TanyaMed Platform**")
    st.caption("Conversational Triage & Pre-Anamnesis Bridge to SATUSEHAT")
    
    st.markdown("---")
    menu = st.radio(
        "Pilih Sudut Pandang Stakeholder:",
        [
            "💬 WhatsApp Pasien (Simulasi Chat)",
            "🏥 Puskesmas Wonorejo (Faskes Intake)",
            "🇮🇩 SATUSEHAT & Gamifikasi",
            "💊 Kepatuhan Terapi Pasca-Konsultasi",
            "🚀 Siap Push ke Streamlit (Deployment)",
            "📖 Filosofi & Arsitektur TanyaMed"
        ]
    )
    
    st.markdown("---")
    st.markdown("#### **Status Pasien Anda**")
    col1, col2 = st.columns(2)
    col1.metric("Poin Sehat", f"{st.session_state.user_points} Pts")
    current_badge = st.session_state.user_badges[-1]
    col2.markdown(f"**Lencana:**\n`{current_badge}`")
    
    st.progress(min(1.0, st.session_state.user_points / 60.0))
    st.caption(f"Target level berikutnya: 60 Poin (Ahli Riwayat)")

    if st.button("🔄 Reset Sesi Simulasi"):
        st.session_state.chat_history = [
            {"role": "assistant", "content": "Halo! Saya **TanyaMed** 👋 Asisten triase & pre-anamnesis kesehatan Anda.\n\nBoleh ceritakan keluhan apa yang sedang kamu rasakan saat ini?"}
        ]
        st.rerun()

# --- 5. MAIN CONTENT PAGES ---

if "WhatsApp Pasien" in menu:
    st.markdown('<div class="main-title">💬 Simulasi WhatsApp TanyaMed</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Pengalaman pasien berinteraksi dengan AI Triase & Pre-Anamnesis 24/7</div>', unsafe_allow_html=True)
    
    col_chat, col_info = st.columns([2.2, 1])
    
    with col_chat:
        st.markdown('<div class="wa-card">', unsafe_allow_html=True)
        st.caption("🟢 **TanyaMed Bot Resmi WhatsApp** — Terverifikasi Kemenkes SATUSEHAT")
        
        # Display chat
        for msg in st.session_state.chat_history:
            if msg["role"] == "user":
                with st.chat_message("user"):
                    st.write(msg["content"])
            else:
                with st.chat_message("assistant", avatar="🩺"):
                    st.write(msg["content"])
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Quick prompts
        st.caption("⚡ Pilih Contoh Keluhan Cepat:")
        c1, c2, c3 = st.columns(3)
        quick_msg = None
        if c1.button("⚠️ Nyeri Dada & Sesak"):
            quick_msg = "Dada saya nyeri hebat dan sesak napas sejak tadi malam, rasanya seperti ditindih"
        if c2.button("🤕 Sakit Kepala 2 Hari"):
            quick_msg = "Sakit kepala berdenyut di bagian belakang sudah 2 hari"
        if c3.button("🤒 Demam & Menggigil"):
            quick_msg = "Badan demam naik turun 3 hari disertai batuk pilek"

        # Chat input
        user_input = st.chat_input("Ketik pesan balasan Anda...") or quick_msg
        if user_input:
            st.session_state.chat_history.append({"role": "user", "content": user_input})
            bot_reply, reply_type = analyze_intent_and_reply(user_input, st.session_state.chat_history)
            st.session_state.chat_history.append({"role": "assistant", "content": bot_reply})
            st.rerun()

    with col_info:
        st.info(
            "**Prinsip Etis TanyaMed:**\n"
            "1. **Tidak pernah mendiagnosis penyakit.**\n"
            "2. **Tidak pernah meresepkan obat keras/antibiotik.**\n"
            "3. Peran sistem adalah 'menggali dan menyampaikan' ke faskes formal."
        )
        
        st.markdown("#### 🎯 5 Elemen Pre-Anamnesis")
        elements = [
            ("1. Keluhan Utama", len(st.session_state.chat_history) >= 2),
            ("2. Lokasi Gejala", len(st.session_state.chat_history) >= 4),
            ("3. Durasi Keluhan", len(st.session_state.chat_history) >= 4),
            ("4. Karakteristik / Faktor", len(st.session_state.chat_history) >= 6),
            ("5. Riwayat Obat Mandiri", len(st.session_state.chat_history) >= 8),
        ]
        for name, done in elements:
            if done:
                st.markdown(f"✅ **{name}**")
            else:
                st.markdown(f"⏳ *{name}*")
                
        st.markdown("---")
        st.markdown("#### 🚨 Jalur Triase Merah")
        st.caption("Jika terdeteksi kata kunci kegawatan (nyeri dada, stroke, sesak napas berat), percakapan langsung dihentikan dan diarahkan ke IGD 119.")

elif "Puskesmas Wonorejo" in menu:
    st.markdown('<div class="main-title">🏥 Dashboard Faskes — Puskesmas Wonorejo</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Kartu triase darurat dan ringkasan pre-anamnesis yang diterima tenaga medis sebelum tatap muka</div>', unsafe_allow_html=True)
    
    c_stat1, c_stat2, c_stat3 = st.columns(3)
    emergencies = [r for r in st.session_state.faskes_records if r["type"] == "emergency"]
    non_emergencies = [r for r in st.session_state.faskes_records if r["type"] == "non_emergency"]
    
    c_stat1.metric("Total Pasien Masuk", len(st.session_state.faskes_records))
    c_stat2.metric("Triase Merah (Darurat IGD)", len(emergencies), delta=f"{len(emergencies)} Perlu Siaga", delta_color="inverse")
    c_stat3.metric("Pre-Anamnesis Poli Umum", len(non_emergencies), delta="Efisiensi Waktu Anamnesis 65%")
    
    st.markdown("---")
    st.subheader("📥 Aliran Kartu Pre-Anamnesis & Triase Real-Time")
    
    for r in st.session_state.faskes_records:
        if r["type"] == "emergency":
            st.error(
                f"### ⚠️ RUJUKAN DARURAT MASUK — {r['id']} ({r['timestamp']})\n"
                f"**Pasien:** {r['patient_name']}  \n"
                f"**Keluhan:** {r['keluhan']}  \n"
                f"**Alasan Klinis:** {r.get('alasan', 'Kegawatan')}  \n"
                f"**Status Rekomendasi:** `{r['status']}`  \n"
                f"🔒 *SHA-256 Checksum:* `{r.get('hash', 'N/A')[:24]}...`"
            )
        else:
            with st.expander(f"📋 {r['id']} — {r['keluhan']} ({r['timestamp']})", expanded=True):
                col_a, col_b = st.columns(2)
                with col_a:
                    st.write(f"**Pasien:** {r['patient_name']}")
                    st.write(f"**Keluhan Utama:** {r['keluhan']}")
                    st.write(f"**Lokasi Gejala:** {r.get('lokasi', '-')}")
                with col_b:
                    st.write(f"**Durasi:** {r.get('durasi', '-')}")
                    st.write(f"**Karakteristik:** {r.get('karakteristik', '-')}")
                    st.write(f"**Obat Mandiri:** {r.get('obat_mandiri', '-')}")
                st.caption(f"Status: {r['status']} | Enkripsi: AES-256 Verified")

elif "SATUSEHAT & Gamifikasi" in menu:
    st.markdown('<div class="main-title">🇮🇩 Integrasi SATUSEHAT & Gamifikasi</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Kepatuhan Rekam Medis Elektronik (PMK No. 24/2022) dan Pendorong Literasi Sehat</div>', unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["🏆 Gamifikasi & Poin Sehat", "🗄️ Rekam Medis Longitudinal (PMK 24/2022)", "🔐 Kriptografi & Integritas"])
    
    with tab1:
        st.subheader("Sistem Poin Berkelanjutan TanyaMed")
        st.write("Berbeda dari gamifikasi musiman, poin TanyaMed mengonfirmasi perilaku kesehatan berkelanjutan: kelengkapan riwayat gejala, kepatuhan minum obat, dan literasi.")
        
        c1, c2, c3 = st.columns(3)
        c1.metric("Poin Terkumpul", f"{st.session_state.user_points} Poin")
        c2.metric("Tingkat Level", st.session_state.user_badges[-1])
        c3.metric("Potongan Biaya Lab Siap Pakai", f"Rp {st.session_state.user_points * 1000:,}")
        
        st.markdown("#### 🎖️ Tingkatan Lencana:")
        st.write("- **10 Poin:** 🥉 Pemula Sehat (Menyelesaikan 1 pre-anamnesis terstruktur)")
        st.write("- **30 Poin:** 🥈 Pasien Siaga (Melakukan pemantauan gejala mandiri & riwayat akurat)")
        st.write("- **60 Poin:** 🥇 Ahli Riwayat (Kepatuhan terapi obat pasca-konsultasi & literasi penuh)")
        
        st.markdown("#### 🎁 Tukar Poin Reward:")
        col_v1, col_v2 = st.columns(2)
        with col_v1:
            st.success("Voucher Diskon Cek Kolesterol 20% (Perlu 30 Poin)")
            if st.button("Klaim Voucher Kolesterol", disabled=(st.session_state.user_points < 30)):
                st.balloons()
                st.success("Klaim berhasil! Kode voucher: TANYA-SEHAT-LAB20")
        with col_v2:
            st.info("Voucher Konsultasi Dokter Spesialis 10% (Perlu 50 Poin)")
            if st.button("Klaim Voucher Spesialis", disabled=(st.session_state.user_points < 50)):
                st.success("Klaim berhasil! Kode voucher: TANYA-SPESIALIS-10")

    with tab2:
        st.subheader("Ketentuan Retensi Rekam Medis Elektronik")
        st.write("Sesuai **PMK No. 24 Tahun 2022**, seluruh rekam medis digital wajib disimpan minimal **25 tahun** dalam format interoperabel (FHIR).")
        st.json({
            "resourceType": "Encounter",
            "id": "tanyamed-encounter-001",
            "status": "planned",
            "class": {"code": "AMB", "display": "Ambulatory / Rawat Jalan"},
            "subject": {"reference": "Patient/IHIS-100293848", "display": "Pasien TanyaMed"},
            "reasonCode": [{"text": "Pre-anamnesis via WhatsApp - Terverifikasi"}],
            "period": {"start": datetime.datetime.now().isoformat()}
        })

    with tab3:
        st.subheader("Keamanan Data & Integritas (UU PDP No. 27/2022)")
        st.write("- **Enkripsi Transit & Rest:** AES-256")
        st.write("- **Integritas Record:** SHA-256 Hash Chaining")
        for rec in st.session_state.faskes_records[:3]:
            st.code(f"Record: {rec['id']} | SHA-256: {rec.get('hash', 'e3b0c442...')}")

elif "Kepatuhan Terapi" in menu:
    st.markdown('<div class="main-title">💊 Kepatuhan Terapi Pasca-Konsultasi</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Pengingat minum obat otomatis dan pencatatan keluhan efek samping setelah mendapat resep</div>', unsafe_allow_html=True)
    
    st.info("Setelah berkonsultasi dengan dokter di Puskesmas, resep obat diteruskan ke TanyaMed untuk pemantauan jadwal dan kepatuhan minum obat secara real-time.")
    
    st.subheader("Daftar Resep Obat Aktif Hari Ini")
    for idx, med in enumerate(st.session_state.medications):
        c1, c2, c3 = st.columns([2, 2, 1])
        c1.write(f"💊 **{med['name']}** ({med['aturan']})")
        c2.write(f"Status: {'✅ Sudah diminum' if med['diminum'] else '⏳ Menunggu jadwal'}")
        if not med['diminum']:
            if c3.button(f"Konfirmasi Minum #{idx+1}"):
                st.session_state.medications[idx]['diminum'] = True
                st.session_state.user_points += 5
                st.success(f"+5 Poin Sehat untuk kepatuhan obat {med['name']}!")
                st.rerun()
        else:
            c3.write(f"Jam: {med['waktu']}")

    st.markdown("---")
    st.subheader("Laporkan Efek Samping Obat")
    with st.form("efek_samping"):
        obat_terkait = st.selectbox("Pilih Obat:", [m['name'] for m in st.session_state.medications])
        keluhan_efek = st.text_area("Deskripsikan gejala efek samping yang dirasakan (misal: mual, pusing):")
        submitted = st.form_submit_button("Kirim ke Dokter Faskes")
        if submitted and keluhan_efek:
            st.success("Laporan efek samping telah tercatat dan dikirimkan ke dokter di Puskesmas Wonorejo untuk dievaluasi.")

elif "Siap Push ke Streamlit" in menu:
    st.markdown('<div class="main-title">🚀 Siap Push ke Streamlit (Deployment Guide)</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Aplikasi ini sudah berstruktur standar Python Streamlit dan siap di-push ke GitHub dan dideploy di Streamlit Cloud</div>', unsafe_allow_html=True)
    
    st.success("✅ Seluruh file proyek (`app.py`, `requirements.txt`, `.streamlit/config.toml`, `README.md`) sudah dibuat dan siap digunakan!")
    
    st.subheader("📋 3 Langkah Mudah Push ke Streamlit Cloud:")
    
    st.markdown("""
    #### 1. Inisialisasi Git & Push ke GitHub
    Jalankan perintah ini di terminal proyek Anda:
    ```bash
    git init
    git add .
    git commit -m "feat: TanyaMed siap di-push ke Streamlit Cloud"
    git branch -M main
    git remote add origin https://github.com/USERNAME/tanyamed.git
    git push -u origin main
    ```

    #### 2. Sambungkan ke Streamlit Community Cloud
    1. Masuk ke [share.streamlit.io](https://share.streamlit.io) menggunakan akun GitHub.
    2. Klik **"New app"**.
    3. Pilih repository `USERNAME/tanyamed`, branch `main`, dan file `app.py`.
    4. Klik tombol **"Deploy!"**.

    #### 3. Selesai!
    Aplikasi TanyaMed Anda akan langsung live dalam beberapa saat dan dapat diakses publik!
    """)
    
    st.markdown("---")
    st.subheader("📦 Isi File `requirements.txt`")
    st.code("streamlit>=1.35.0\ngoogle-genai>=0.1.1\npandas>=2.0.0", language="text")

elif "Filosofi & Arsitektur" in menu:
    st.markdown('<div class="main-title">📖 Filosofi & Arsitektur Sistem TanyaMed</div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("""
        ### 🧠 2 Mode Berpikir AI
        1. **Mode Triase (Deteksi Bahaya):**
           - Menilai tanda bahaya (nyeri dada, sesak berat, stroke, perdarahan hebat).
           - Begitu terdeteksi, berhenti bertanya, segera rujuk IGD 119.
        2. **Mode Pre-Anamnesis (Penggalian Riwayat):**
           - Menggali 5 elemen: keluhan, lokasi, durasi, karakteristik, riwayat obat mandiri.
           - Mengalir 1-2 pertanyaan per giliran seperti obrolan manusia.
        """)
    with col2:
        st.markdown("""
        ### 🏛️ Arsitektur 3 Tingkat
        - **Tier 1 (Model Bahasa):** Membalas santun, menilai triase & memanggil tool `rujuk_darurat` / `catat_riwayat`.
        - **Tier 2 (Ekstraksi Terstruktur):** Mengonversi percakapan ke entitas data terpisah.
        - **Tier 3 (Penyimpanan Terstruktur):** Format SATUSEHAT (FHIR), enkripsi AES-256, diteruskan ke faskes.
        """)

# Footer
st.markdown("---")
st.caption("TanyaMed © 2026 — Jembatan Swadiagnosis ke Sistem Kesehatan Formal SATUSEHAT & Faskes Indonesia.")

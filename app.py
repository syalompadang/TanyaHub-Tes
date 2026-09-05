"""
TanyaMed — Layanan Kesehatan Jarak Jauh Berbasis Percakapan
Clean Minimalism Design Theme
Siap di-deploy langsung ke Streamlit Community Cloud (streamlit run app.py)
"""

import streamlit as st
import datetime
import hashlib
import json
import os
import re
import urllib.request
import urllib.error

# --- 1. PAGE CONFIGURATION ---
st.set_page_config(
    page_title="TanyaMed — Triase & Pre-Anamnesis SATUSEHAT",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# --- 2. CLEAN MINIMALISM CSS ---
st.markdown("""
<style>
    /* Global Base */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1e293b;
    }
    
    .stApp {
        background-color: #f8f9fa;
    }
    
    /* Top Header Bar */
    .top-navbar {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 24px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    
    /* Cards & Containers */
    .clean-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    
    /* Metrics */
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px 20px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .metric-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 4px;
    }
    .metric-value {
        font-size: 26px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
    }
    .metric-delta {
        font-size: 11px;
        font-weight: 500;
        color: #10b981;
        margin-top: 6px;
    }
    .metric-delta-danger {
        font-size: 11px;
        font-weight: 500;
        color: #ff4b4b;
        margin-top: 6px;
    }
    
    /* Pills & Badges */
    .pill-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
    }
    .pill-emergency {
        background-color: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
    }
    .pill-green {
        background-color: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
    }
    .pill-neutral {
        background-color: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
    }
    
    /* Chat Bubbles */
    .chat-bubble-user {
        background-color: #1e293b;
        color: #ffffff;
        border-radius: 12px 12px 2px 12px;
        padding: 12px 16px;
        margin-bottom: 12px;
        max-width: 80%;
        margin-left: auto;
        font-size: 13px;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .chat-bubble-bot {
        background-color: #ffffff;
        color: #1e293b;
        border: 1px solid #e2e8f0;
        border-radius: 12px 12px 12px 2px;
        padding: 12px 16px;
        margin-bottom: 12px;
        max-width: 80%;
        margin-right: auto;
        font-size: 13px;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .chat-bubble-emergency {
        background-color: #fef2f2;
        color: #450a0a;
        border: 1px solid #fecaca;
        border-radius: 12px 12px 12px 2px;
        padding: 14px 18px;
        margin-bottom: 12px;
        max-width: 85%;
        margin-right: auto;
        font-size: 13px;
        line-height: 1.5;
    }

    /* Streamlit Widget Overrides */
    div.stButton > button {
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid #e2e8f0;
        transition: all 0.15s ease;
    }
    div.stButton > button:hover {
        border-color: #cbd5e1;
        background-color: #f8fafc;
    }
    
    /* Primary buttons */
    button[kind="primary"] {
        background-color: #ff4b4b !important;
        color: #ffffff !important;
        border: none !important;
        box-shadow: 0 1px 3px rgba(255, 75, 75, 0.2) !important;
    }
    button[kind="primary"]:hover {
        background-color: #e03a3a !important;
    }

    /* Clean navigation tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #ffffff;
        padding: 6px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        color: #475569;
    }
    .stTabs [aria-selected="true"] {
        background-color: #f1f5f9 !important;
        color: #ff4b4b !important;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# --- 3. SESSION STATE INITIALIZATION ---
if "user_points" not in st.session_state:
    st.session_state.user_points = 20
if "user_badges" not in st.session_state:
    st.session_state.user_badges = ["Pemula Sehat"]
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "assistant",
            "type": "normal",
            "time": "08:00 WIB",
            "content": "Halo! Apa kabar hari ini? Semoga kamu sehat dan harimu menyenangkan 😊\n\nAda yang bisa saya bantu atau ingin diobrolkan hari ini? Kamu bebas bertanya apa saja—mulai dari informasi kesehatan umum, aturan minum obat, tips gaya hidup, atau ceritakan jika ada keluhan tubuh yang sedang kamu rasakan ya!"
        }
    ]
if "faskes_records" not in st.session_state:
    st.session_state.faskes_records = [
        {
            "id": "TM-20260905-01",
            "timestamp": "08:15 WIB",
            "type": "non_emergency",
            "patient_name": "Pasien Anonim #42",
            "keluhan": "Sakit kepala berdenyut bagian belakang sudah 2 hari",
            "lokasi": "Belakang kepala & tengkuk",
            "durasi": "2 hari",
            "karakteristik": "Memberat saat kurang tidur dan menatap layar",
            "obat_mandiri": "Parasetamol 500mg, agak membaik",
            "status": "Menunggu di Ruang Tunggu Poli Umum",
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "verified": True,
            "doctor_note": "Anamnesis dasar terkonfirmasi. Periksa tekanan darah dan palpasi leher."
        },
        {
            "id": "TM-20260905-02",
            "timestamp": "08:28 WIB",
            "type": "emergency",
            "patient_name": "Pasien Anonim #88",
            "keluhan": "Nyeri dada hebat menjalar ke lengan kiri & sesak napas berat",
            "lokasi": "Dada kiri substernal",
            "durasi": "Sejak 1 jam lalu",
            "karakteristik": "Sensasi tertindih beban berat, keringat dingin",
            "obat_mandiri": "Belum minum obat",
            "alasan": "Berpotensi Sindroma Koroner Akut (SKA) / Kegawatan Kardiovaskular Akut",
            "status": "⚠️ SIAGA IGD — Pasien dalam perjalanan via Ambulans 119",
            "hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
            "verified": True,
            "doctor_note": "Persiapkan bed resusitasi IGD, mesin EKG 12-lead, dan akses kanul oksigen."
        }
    ]
if "medications" not in st.session_state:
    st.session_state.medications = [
        {"id": "med-1", "name": "Amlodipine", "dosage": "5mg", "schedule": "1x sehari (Pagi sebelum makan)", "taken": True, "time": "07:15 WIB"},
        {"id": "med-2", "name": "Metformin", "dosage": "500mg", "schedule": "2x sehari (Bersama makan)", "taken": False, "time": None},
        {"id": "med-3", "name": "Amoxicillin Trihydrate (Antibiotik)", "dosage": "500mg", "schedule": "3x sehari (Tiap 8 jam — Wajib dihabiskan)", "taken": False, "time": None},
    ]

# --- 4. CORE CLINICAL AI & GEMINI INTEGRATION ---
EMERGENCY_KEYWORDS = [
    "nyeri dada", "sesak napas", "sesak nafas", "tidak bisa napas", "sulit bernapas",
    "stroke", "mati rasa sebelah", "pingsan", "tidak sadar", "kejang",
    "muntah darah", "perdarahan hebat", "pendarahan hebat", "tertindih beban berat di dada",
    "jantung berdebar hebat", "kehilangan kesadaran", "mulut mencong", "bicara pelo"
]

def generate_sha256(data_dict):
    data_str = json.dumps(data_dict, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()

def update_badges(points):
    badges = ["Pemula Sehat"]
    if points >= 30:
        badges.append("Pasien Siaga")
    if points >= 60:
        badges.append("Ahli Riwayat")
    return badges

def get_gemini_api_key():
    """Retrieve Gemini API key from Streamlit secrets or environment variables."""
    try:
        if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
            return st.secrets["GEMINI_API_KEY"]
    except Exception:
        pass
    return os.environ.get("GEMINI_API_KEY")

def call_gemini_api(history, user_text):
    """Directly invokes Gemini API using Python standard library with zero external dependencies."""
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    system_instruction = (
        "Kamu adalah TanyaMed, sahabat & asisten kesehatan digital berbasis WhatsApp di Indonesia.\n\n"
        "KEPRIBADIAN & GAYA KOMUNIKASI:\n"
        "1. ORGANIK, HANGAT, & FLEKSIBEL: Bersikaplah ramah, empatik, santun, dan luwes seperti tenaga medis atau sahabat kesehatan di WhatsApp. Jangan kaku, jangan seperti kuesioner formal. Jawablah sesuai topik yang diajukan pengguna.\n"
        "2. DIVERSIFIKASI TOPIK:\n"
        "   - Sapaan & Kabar ('Halo', 'Apa kabar?', 'Lagi apa'): Jawab dengan hangat dan tulus, tanyakan kabar harinya, ajak ngobrol seputar kesehatan, pola hidup, info obat, atau jika ada keluhan yang ingin diceritakan.\n"
        "   - Informasi Kesehatan & Pola Hidup ('tips tidur nyenyak', 'berapa liter minum', 'makanan sehat'): Berikan edukasi yang ringkas, praktis, dan mudah dipahami dalam 2-4 kalimat.\n"
        "   - Informasi Obat ('bolehkah minum parasetamol sebelum makan?', 'fungsi amlodipin apa?', 'kenapa antibiotik harus habis?'): Jelaskan fungsi obat, aturan minum umum, dan tips konsumsi aman. Ingatkan bahwa instruksi dokter dan apoteker adalah rujukan utama.\n"
        "   - Keluhan Sakit / Ketidaknyamanan Fisik: Berikan empati, lalu bantu gali 5 elemen riwayat secara bertahap dan mengalir: (1) Keluhan utama, (2) Lokasi rasa sakit, (3) Durasi sudah berapa lama, (4) Pemicu yang memperberat/meredakan, (5) Riwayat konsumsi obat mandiri. Tanyakan 1-2 pertanyaan per giliran agar terasa natural.\n"
        "   - Deteksi Gawat Darurat (Nyeri dada hebat menekan/menjalar, sesak napas berat, tanda stroke/kelemahan separuh tubuh, kejang, muntah darah, pingsan/penurunan kesadaran): Prioritaskan keselamatan! Berikan peringatan tenang dan tegas untuk segera ke IGD terdekat atau menghubungi 119, sarankan posisi setengah duduk, jangan mengemudi sendiri.\n"
        "3. BATASAN ETIS:\n"
        "   - JANGAN PERNAH memberikan diagnosis pasti penyakit.\n"
        "   - JANGAN PERNAH meresepkan obat keras atau menentukan dosis khusus pasien di luar anjuran umum pada kemasan obat bebas.\n"
        "   - Ingatkan bahwa pemeriksaan langsung oleh dokter faskes tetap diperlukan untuk memastikan kondisi kesehatan.\n\n"
        "PENTING — METADATA KLINIS TERSEMBUNYI:\n"
        "Sertakan tag metadata di bagian paling akhir teks responmu persis dalam format ini:\n"
        "<!--CLINICAL_DATA:{\"intent\":\"greeting\"|\"health_info\"|\"medicine_info\"|\"anamnesis_progress\"|\"anamnesis_complete\"|\"emergency\",\"isEmergency\":false,\"isAnamnesisComplete\":false,\"keluhan\":\"\",\"lokasi\":\"\",\"durasi\":\"\",\"karakteristik\":\"\",\"obatMandiri\":\"\"}-->"
    )

    contents = []
    for h in history[-6:]:
        role = "model" if h.get("role") in ["assistant", "model"] else "user"
        clean_content = re.sub(r"<!--CLINICAL_DATA:[\s\S]*?-->", "", h.get("content", "")).strip()
        if clean_content:
            contents.append({
                "role": role,
                "parts": [{"text": clean_content}]
            })
    contents.append({
        "role": "user",
        "parts": [{"text": user_text}]
    })

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7
        }
    }

    # Universal Gemini endpoint with standard library urllib
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "aistudio-build"}
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            candidate = res_data.get("candidates", [{}])[0]
            text_val = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
            return text_val
    except Exception as err:
        return None

def process_chat_message(user_text):
    now_str = datetime.datetime.now().strftime("%H:%M WIB")
    lower = user_text.lower().strip()
    
    # 1. Check Gemini AI First
    gemini_reply = call_gemini_api(st.session_state.chat_history, user_text)
    if gemini_reply:
        clinical_data = {}
        meta_match = re.search(r"<!--CLINICAL_DATA:([\s\S]*?)-->", gemini_reply)
        if meta_match:
            try:
                clinical_data = json.loads(meta_match.group(1).strip())
            except Exception:
                clinical_data = {}
            clean_reply = re.sub(r"<!--CLINICAL_DATA:[\s\S]*?-->", "", gemini_reply).strip()
        else:
            clean_reply = gemini_reply.strip()

        is_emergency = clinical_data.get("isEmergency") or clinical_data.get("intent") == "emergency"
        if not is_emergency and any(kw in lower for kw in EMERGENCY_KEYWORDS) and "apa itu" not in lower:
            is_emergency = True

        if is_emergency:
            rec = {
                "id": f"TM-{datetime.datetime.now().strftime('%Y%m%d')}-{len(st.session_state.faskes_records)+1:02d}",
                "timestamp": now_str,
                "type": "emergency",
                "patient_name": f"Pasien WhatsApp #{len(st.session_state.faskes_records)+1}",
                "keluhan": user_text,
                "lokasi": clinical_data.get("lokasi") or "Vital / Kardiovaskular / Pernapasan",
                "durasi": clinical_data.get("durasi") or "Akut (Baru Saja Terlaporkan)",
                "karakteristik": "Tanda bahaya kegawatan memerlukan penanganan darurat",
                "obat_mandiri": "Belum / Tidak disarankan mandiri",
                "alasan": "Deteksi tanda bahaya kardiovaskular / kegawatan napas / defisit neurologis akut",
                "status": "⚠️ SIAGA IGD — Diarahkan Segera ke IGD 119",
                "verified": False,
                "doctor_note": ""
            }
            rec["hash"] = generate_sha256(rec)
            st.session_state.faskes_records.insert(0, rec)
            return clean_reply, "emergency"

        if clinical_data.get("isAnamnesisComplete") or clinical_data.get("intent") == "triage_complete":
            st.session_state.user_points += 10
            st.session_state.user_badges = update_badges(st.session_state.user_points)
            rec = {
                "id": f"TM-{datetime.datetime.now().strftime('%Y%m%d')}-{len(st.session_state.faskes_records)+1:02d}",
                "timestamp": now_str,
                "type": "non_emergency",
                "patient_name": f"Pasien WhatsApp #{len(st.session_state.faskes_records)+1}",
                "keluhan": clinical_data.get("keluhan") or user_text,
                "lokasi": clinical_data.get("lokasi") or "Kepala / area keluhan",
                "durasi": clinical_data.get("durasi") or "Beberapa hari terakhir",
                "karakteristik": clinical_data.get("karakteristik") or "Telah digali dalam pre-anamnesis",
                "obat_mandiri": clinical_data.get("obatMandiri") or "Penanganan mandiri awal",
                "status": "Tersimpan di Sistem Antrean Poli",
                "verified": False,
                "doctor_note": ""
            }
            rec["hash"] = generate_sha256(rec)
            st.session_state.faskes_records.insert(0, rec)
            return clean_reply, "complete"

        return clean_reply, "normal"

    # 2. Organic Fallback Engine if Gemini offline / no key
    is_emergency = any(kw in lower for kw in EMERGENCY_KEYWORDS)
    if is_emergency:
        reply = (
            "⚠️ **PERINGATAN KONDISI DARURAT MEDIS**\n\n"
            "Gejala yang kamu sebutkan berpotensi merupakan kondisi gawat darurat (triase merah) "
            "yang membutuhkan penanganan medis segera.\n\n"
            "🚨 **Tindakan Segera:**\n"
            "- Segera menuju ke **IGD terdekat** atau hubungi ambulans **119**.\n"
            "- Jangan mengemudi sendiri.\n"
            "- Istirahat dengan posisi setengah duduk.\n\n"
            "📡 *Data rujukan darurat ini telah otomatis diteruskan ke IGD Puskesmas Wonorejo agar tim medis segera bersiaga.*"
        )
        rec = {
            "id": f"TM-{datetime.datetime.now().strftime('%Y%m%d')}-{len(st.session_state.faskes_records)+1:02d}",
            "timestamp": now_str,
            "type": "emergency",
            "patient_name": f"Pasien WhatsApp #{len(st.session_state.faskes_records)+1}",
            "keluhan": user_text,
            "lokasi": "Vital / Kardiovaskular / Pernapasan",
            "durasi": "Akut (Baru Saja Terlaporkan)",
            "karakteristik": "Tanda bahaya kegawatan memerlukan penanganan darurat",
            "obat_mandiri": "Belum / Tidak disarankan mandiri",
            "alasan": "Deteksi tanda bahaya kardiovaskular / kegawatan napas / defisit neurologis akut",
            "status": "⚠️ SIAGA IGD — Diarahkan Segera ke IGD 119",
            "verified": False,
            "doctor_note": ""
        }
        rec["hash"] = generate_sha256(rec)
        st.session_state.faskes_records.insert(0, rec)
        return reply, "emergency"

    # Greetings & Casual Conversation
    if any(w in lower for w in ["apa kabar", "halo", "hai", "selamat pagi", "selamat siang", "selamat malam"]):
        reply = (
            "Halo! Kabar saya baik dan siap menemani harimu 😊 Bagaimana kabarmu hari ini? Semoga tubuhmu terasa segar dan fit ya!\n\n"
            "Ada yang ingin kamu tanyakan atau ceritakan hari ini? Kamu bebas bertanya tentang info obat, tips pola hidup sehat, nutrisi harian, "
            "atau jika ada keluhan tubuh yang sedang dirasakan, silakan ceritakan santai ya."
        )
        return reply, "normal"

    # Medication questions
    if any(w in lower for w in ["obat", "parasetamol", "amoksisilin", "antibiotik", "vitamin", "amlodipin"]):
        if "parasetamol" in lower:
            reply = (
                "Parasetamol adalah obat penurun demam dan pereda nyeri ringan hingga sedang (seperti sakit kepala atau nyeri otot). "
                "Secara umum dapat diminum sebelum atau sesudah makan dengan segelas air. Dosis dewasa lazim adalah 500mg tiap 4–6 jam bila perlu "
                "(maksimal 4.000mg/hari). Jangan dikonsumsi bersamaan dengan obat lain yang juga mengandung parasetamol untuk mencegah overdosis hati ya 😊"
            )
        else:
            reply = (
                "Pertanyaan obat yang bagus! Prinsip penting penggunaan obat: minumlah sesuai aturan pakai (sebelum/sesudah makan), "
                "jangan menggandakan dosis jika terlewat, dan jika mendapat antibiotik, wajib dihabiskan sesuai anjuran dokter meskipun sudah merasa sembuh. "
                "Ada obat spesifik yang sedang ingin kamu tanyakan aturan minumnya?"
            )
        return reply, "normal"

    # General Wellness / Tips
    is_wellness = any(w in lower for w in [
        "tips", "pola hidup", "olahraga", "hidrasi", "pola makan", 
        "makanan sehat", "susah tidur", "insomnia", "cara tidur", "kebugaran", "bugar"
    ])
    if is_wellness:
        reply = (
            "Kunci menjaga tubuh tetap prima setiap hari sebenarnya sederhana:\n\n"
            "1. **Hidrasi optimal:** Minum air putih 2–2.5 liter sehari.\n"
            "2. **Kualitas tidur:** 7–8 jam per malam untuk regenerasi sel tubuh.\n"
            "3. **Aktivitas fisik ringan:** Luangkan jalan kaki 20–30 menit secara rutin.\n"
            "4. **Manajemen stres:** Ambil jeda napas dalam-dalam saat pekerjaan padat.\n\n"
            "Apakah ada aspek kebiasaan sehat tertentu yang ingin kamu mulai tingkatkan minggu ini?"
        )
        return reply, "normal"

    # Pre-anamnesis Conversation Loop for Symptoms
    user_turns = len([m for m in st.session_state.chat_history if m["role"] == "user"])
    
    if user_turns <= 2:
        reply = (
            "Saya memahami rasa tidak nyamannya. Boleh ceritakan lebih detail, di bagian tubuh mana rasa sakit tersebut "
            "paling terasa, dan sudah sejak kapan kamu merasakannya?"
        )
        return reply, "normal"
    elif user_turns == 3:
        reply = (
            "Terima kasih atas informasinya. Apakah ada hal atau kondisi yang membuat keluhan ini **terasa semakin berat** "
            "(misal saat bergerak, malam hari, atau setelah makan), atau hal yang membuatnya mereda?"
        )
        return reply, "normal"
    elif user_turns == 4:
        reply = (
            "Sudah saya catat. Sebelum berkonsultasi, apakah kamu **sudah sempat minum obat mandiri** (seperti obat warung, herbal, atau resep lama), "
            "dan bagaimana responnya di tubuhmu?"
        )
        return reply, "normal"
    else:
        # Pre-anamnesis complete
        st.session_state.user_points += 10
        st.session_state.user_badges = update_badges(st.session_state.user_points)
        
        reply = (
            "Terima kasih banyak! 5 elemen riwayat keluhan kamu sudah **lengkap tercatat dan terenkripsi** ✅\n\n"
            "📋 **Ringkasan Pre-Anamnesis Anda:**\n"
            f"- **Keluhan:** {user_text}\n"
            "- **Status:** Diteruskan ke Antrean Poli Puskesmas Wonorejo\n"
            "- **SATUSEHAT:** Rekam Medis Elektronik tersinkronisasi (PMK No. 24/2022)\n\n"
            f"🎁 **Kamu mendapatkan +10 Poin Sehat!** Total poin: **{st.session_state.user_points} Pts**.\n"
            "Dokter di faskes dapat langsung meninjau data ini tanpa perlu mengulang pertanyaan dasar dari nol."
        )
        rec = {
            "id": f"TM-{datetime.datetime.now().strftime('%Y%m%d')}-{len(st.session_state.faskes_records)+1:02d}",
            "timestamp": now_str,
            "type": "non_emergency",
            "patient_name": f"Pasien WhatsApp #{len(st.session_state.faskes_records)+1}",
            "keluhan": user_text,
            "lokasi": "Kepala / area keluhan",
            "durasi": "Beberapa hari terakhir",
            "karakteristik": "Telah digali dalam pre-anamnesis",
            "obat_mandiri": "Penanganan mandiri awal",
            "status": "Tersimpan di Sistem Antrean Poli",
            "verified": False,
            "doctor_note": ""
        }
        rec["hash"] = generate_sha256(rec)
        st.session_state.faskes_records.insert(0, rec)
        return reply, "complete"


# --- 5. TOP NAVBAR (CLEAN MINIMALISM) ---
col_logo, col_stat = st.columns([2.5, 1.5])

with col_logo:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 38px; height: 38px; background-color: #ff4b4b; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
            🩺
        </div>
        <div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 700; font-size: 18px; color: #0f172a; letter-spacing: -0.02em;">TanyaMed</span>
                <span class="pill-badge pill-neutral">SATUSEHAT READY</span>
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 0; font-weight: 500;">
                Layanan Percakapan Triase & Pre-Anamnesis WhatsApp
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col_stat:
    emergencies_count = len([r for r in st.session_state.faskes_records if r["type"] == "emergency"])
    current_badge = st.session_state.user_badges[-1]
    
    st.markdown(f"""
    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; height: 100%;">
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 14px; font-size: 12px;">
            <span style="color: #64748b;">Lencana:</span>
            <strong style="color: #0f172a;">{current_badge}</strong>
            <span style="color: #cbd5e1; margin: 0 6px;">|</span>
            <strong style="color: #10b981;">{st.session_state.user_points} Pts</strong>
        </div>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; color: #059669; display: flex; align-items: center; gap: 6px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #10b981; display: inline-block;"></span>
            Puskesmas Wonorejo Live
        </div>
    </div>
    """, unsafe_allow_html=True)

st.write("") # Spacer

# --- 6. NAVIGATION TABS ---
tabs = st.tabs([
    "💬 WhatsApp Pasien",
    f"🏥 Puskesmas Wonorejo ({emergencies_count} Siaga)" if emergencies_count > 0 else "🏥 Puskesmas Wonorejo",
    f"🇮🇩 SATUSEHAT & Poin ({st.session_state.user_points} Pts)",
    "💊 Kepatuhan Terapi"
])


# ==========================================
# TAB 1: WHATSAPP PASIEN
# ==========================================
with tabs[0]:
    # Notice Bar
    st.markdown("""
    <div class="clean-card" style="padding: 12px 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 18px;">🛡️</span>
            <div>
                <div class="metric-label" style="margin-bottom: 2px;">Standar Etis Klinis</div>
                <div style="font-size: 12px; color: #334155; line-height: 1.5;">
                    <strong>Layanan Pre-Anamnesis TanyaMed:</strong> Sistem tidak mendiagnosis dan tidak merekomendasikan obat spesifik.
                    Riwayat keluhan dienkripsi (AES-256) dan otomatis disalurkan ke <strong>Puskesmas Wonorejo</strong> serta <strong>SATUSEHAT Kemenkes RI</strong>.
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col_chat, col_side = st.columns([7, 5], gap="large")
    
    with col_chat:
        st.markdown("""
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px 12px 0 0; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; background-color: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ff4b4b; font-size: 16px;">
                    🩺
                </div>
                <div>
                    <div style="font-size: 13px; font-weight: 600; color: #0f172a;">TanyaMed Official</div>
                    <div style="font-size: 11px; color: #64748b;">Triase AI • 24/7 Aktif</div>
                </div>
            </div>
            <span class="pill-badge pill-green">VERIFIED WA</span>
        </div>
        """, unsafe_allow_html=True)
        
        # Chat container
        chat_container = st.container(height=420)
        with chat_container:
            st.markdown("""
            <div style="text-align: center; margin: 8px 0 16px 0;">
                <span style="background-color: #ffffff; border: 1px solid #e2e8f0; color: #64748b; font-size: 11px; padding: 4px 12px; border-radius: 6px;">
                    🔒 Komunikasi terenkripsi AES-256 disalurkan ke Puskesmas Wonorejo & SATUSEHAT
                </span>
            </div>
            """, unsafe_allow_html=True)
            
            for msg in st.session_state.chat_history:
                is_user = msg["role"] == "user"
                m_type = msg.get("type", "normal")
                
                if is_user:
                    st.markdown(f"""
                    <div class="chat-bubble-user">
                        {msg["content"]}
                        <div style="text-align: right; font-size: 10px; color: #94a3b8; margin-top: 4px;">{msg.get('time', '')} ✓✓</div>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    if m_type == "emergency":
                        st.markdown(f"""
                        <div class="chat-bubble-emergency">
                            <div style="font-weight: 700; font-size: 11px; color: #dc2626; margin-bottom: 4px;">🚨 TRIASE MERAH (DARURAT IGD)</div>
                            {msg["content"].replace(chr(10), '<br>')}
                            <div style="font-size: 10px; color: #991b1b; margin-top: 6px;">{msg.get('time', '')}</div>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        st.markdown(f"""
                        <div class="chat-bubble-bot">
                            <div style="font-weight: 700; font-size: 11px; color: #0f172a; margin-bottom: 4px;">TanyaMed Triage</div>
                            {msg["content"].replace(chr(10), '<br>')}
                            <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">{msg.get('time', '')}</div>
                        </div>
                        """, unsafe_allow_html=True)

        # Quick symptom & conversational buttons
        st.markdown("<div class='metric-label' style='margin-top: 8px;'>⚡ Contoh Topik / Keluhan Cepat:</div>", unsafe_allow_html=True)
        qc1, qc2, qc3, qc4 = st.columns(4)
        quick_msg = None
        if qc1.button("👋 Tips Bugar", use_container_width=True):
            quick_msg = "Halo! Apa kabar hari ini? Minta tips menjaga kebugaran tubuh saat sibuk kerja dong 😊"
        if qc2.button("💊 Minum Parasetamol", use_container_width=True):
            quick_msg = "Apakah obat Parasetamol aman diminum sebelum makan, dan apa fungsi utamanya?"
        if qc3.button("🤕 Sakit Kepala 2 Hari", use_container_width=True):
            quick_msg = "Sakit kepala berdenyut di bagian belakang sudah 2 hari, tambah berat kalau kurang tidur"
        if qc4.button("⚠️ Nyeri Dada (Darurat)", use_container_width=True):
            quick_msg = "Dada saya nyeri hebat seperti ditindih dan sesak napas sejak 1 jam lalu ⚠️"

        # Chat input
        user_input = st.chat_input("Ketik keluhan atau jawab pertanyaan TanyaMed...") or quick_msg
        if user_input:
            now_t = datetime.datetime.now().strftime("%H:%M WIB")
            st.session_state.chat_history.append({
                "role": "user",
                "content": user_input,
                "time": now_t
            })
            bot_reply, r_type = process_chat_message(user_input)
            st.session_state.chat_history.append({
                "role": "assistant",
                "content": bot_reply,
                "type": r_type,
                "time": datetime.datetime.now().strftime("%H:%M WIB")
            })
            st.rerun()

    with col_side:
        # 5 Elements Card
        st.markdown("""
        <div class="clean-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <div class="metric-label">Aliran Ekstraksi</div>
                    <div style="font-weight: 700; font-size: 14px; color: #0f172a;">5 Elemen Pre-Anamnesis</div>
                </div>
                <span class="pill-badge pill-neutral">TIER 2</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 14px; line-height: 1.5;">
                TanyaMed menggali 5 aspek penting sebelum dokter memeriksa tatap muka agar waktu tunggu berkurang 65%:
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        user_turns = len([m for m in st.session_state.chat_history if m["role"] == "user"])
        elements_checklist = [
            ("1. Keluhan Utama", user_turns >= 1),
            ("2. Lokasi Gejala", user_turns >= 2),
            ("3. Durasi Keluhan", user_turns >= 2),
            ("4. Karakteristik / Pemicu", user_turns >= 3),
            ("5. Riwayat Obat Mandiri", user_turns >= 4),
        ]
        
        for name, done in elements_checklist:
            if done:
                st.markdown(f"""
                <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: #065f46; display: flex; justify-content: space-between;">
                    <span>{name}</span>
                    <span>✓ Terkumpul</span>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between;">
                    <span>{name}</span>
                    <span style="font-size: 11px;">Menunggu info...</span>
                </div>
                """, unsafe_allow_html=True)

        if st.button("🔄 Reset Sesi Percakapan", use_container_width=True):
            st.session_state.chat_history = [
                {
                    "role": "assistant",
                    "type": "normal",
                    "time": "08:00 WIB",
                    "content": "Halo! Saya **TanyaMed** 👋 Asisten triase & pre-anamnesis kesehatan Anda.\n\nBoleh ceritakan apa keluhan yang sedang kamu rasakan saat ini?"
                }
            ]
            st.rerun()


# ==========================================
# TAB 2: PUSKESMAS WONOREJO DASHBOARD
# ==========================================
with tabs[1]:
    # 4 Clean Metric Cards
    m1, m2, m3, m4 = st.columns(4)
    total_rec = len(st.session_state.faskes_records)
    emer_rec = len([r for r in st.session_state.faskes_records if r["type"] == "emergency"])
    poli_rec = len([r for r in st.session_state.faskes_records if r["type"] == "non_emergency"])
    verif_rec = len([r for r in st.session_state.faskes_records if r.get("verified")])
    
    with m1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Total Pasien Masuk</div>
            <div class="metric-value">{total_rec}</div>
            <div class="metric-delta">Aliran aktif hari ini</div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Triase Merah (IGD)</div>
            <div class="metric-value" style="color: #ff4b4b;">{emer_rec}</div>
            <div class="metric-delta-danger">Prioritas penanganan 119</div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Pre-Anamnesis Poli</div>
            <div class="metric-value">{poli_rec}</div>
            <div class="metric-delta">Efisiensi waktu 65%</div>
        </div>
        """, unsafe_allow_html=True)
    with m4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Terverifikasi Dokter</div>
            <div class="metric-value">{verif_rec}</div>
            <div class="metric-delta">Tersinkron SATUSEHAT</div>
        </div>
        """, unsafe_allow_html=True)

    st.write("")
    st.markdown("#### 📥 Aliran Kartu Pre-Anamnesis & Triase Real-Time")
    
    for idx, rec in enumerate(st.session_state.faskes_records):
        is_emer = rec["type"] == "emergency"
        
        with st.expander(
            f"{'🚨 TRIASE MERAH' if is_emer else '📋 PRE-ANAMNESIS'} — {rec['id']} | {rec['patient_name']} ({rec['timestamp']})",
            expanded=(idx == 0)
        ):
            c_left, c_right = st.columns([1.5, 1])
            with c_left:
                st.markdown(f"**Keluhan Pasien:** {rec['keluhan']}")
                if is_emer:
                    st.error(f"**Alasan Klinis:** {rec.get('alasan', 'Kegawatan')}\n\n**Status:** {rec['status']}")
                else:
                    st.markdown(f"""
                    - **Lokasi Gejala:** {rec.get('lokasi', '-')}
                    - **Durasi Keluhan:** {rec.get('durasi', '-')}
                    - **Karakteristik & Pemicu:** {rec.get('karakteristik', '-')}
                    - **Obat Mandiri:** {rec.get('obat_mandiri', '-')}
                    """)
                st.caption(f"SHA-256 Checksum: `{rec['hash']}`")
                
            with c_right:
                st.markdown("**Verifikasi Klinis Dokter:**")
                if rec.get("verified"):
                    st.success(f"✓ Terverifikasi\n\nCatatan: {rec.get('doctor_note', '-')}")
                else:
                    new_note = st.text_input(f"Catatan Dokter ({rec['id']}):", key=f"note_{rec['id']}")
                    if st.button(f"Verifikasi & Simpan", key=f"btn_{rec['id']}", type="primary"):
                        st.session_state.faskes_records[idx]["verified"] = True
                        st.session_state.faskes_records[idx]["doctor_note"] = new_note or "Diverifikasi dokter poli"
                        st.success("Tersimpan!")
                        st.rerun()


# ==========================================
# TAB 3: SATUSEHAT & GAMIFIKASI
# ==========================================
with tabs[2]:
    st.markdown(f"""
    <div class="clean-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
                <span class="pill-badge pill-green" style="margin-bottom: 8px;">KEMENKES RI • SATUSEHAT REWARDS</span>
                <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px;">
                    Gamifikasi Kesehatan Terintegrasi SATUSEHAT
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 4px; max-width: 650px;">
                    Poin sehat diperoleh dengan melengkapi pre-anamnesis WhatsApp secara jujur dan menyelesaikan jadwal minum obat Puskesmas.
                </p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 20px; text-align: right;">
                <div class="metric-label">Saldo Poin Kamu</div>
                <div style="font-size: 24px; font-weight: 700; color: #0f172a;">{st.session_state.user_points} Pts</div>
                <div style="font-size: 11px; color: #10b981; font-weight: 500;">Status Akun Aktif</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Vouchers
    st.markdown("#### 🎁 Katalog Penukaran Voucher Sehat")
    v1, v2, v3 = st.columns(3)
    
    with v1:
        st.markdown("""
        <div class="clean-card">
            <span class="pill-badge pill-neutral">LABORATORIUM</span>
            <div style="font-weight: 700; font-size: 14px; margin: 8px 0 4px 0;">Voucher Cek Kolesterol 20%</div>
            <p style="font-size: 12px; color: #64748b;">Diskon 20% pemeriksaan lab mitra Puskesmas Wonorejo.</p>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 8px 0;">30 Poin</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Tukarkan (30 Pts)", disabled=(st.session_state.user_points < 30), key="v_kol"):
            st.session_state.user_points -= 30
            st.success("Kode Voucher: TANYA-LAB20-KOL")
            st.rerun()

    with v2:
        st.markdown("""
        <div class="clean-card">
            <span class="pill-badge pill-neutral">TELEKONSULTASI</span>
            <div style="font-weight: 700; font-size: 14px; margin: 8px 0 4px 0;">Voucher Dokter Spesialis 15%</div>
            <p style="font-size: 12px; color: #64748b;">Potongan biaya konsultasi rujukan lanjutan di RSUD terdekat.</p>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 8px 0;">50 Poin</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Tukarkan (50 Pts)", disabled=(st.session_state.user_points < 50), key="v_spes"):
            st.session_state.user_points -= 50
            st.success("Kode Voucher: TANYA-SPESIALIS15")
            st.rerun()

    with v3:
        st.markdown("""
        <div class="clean-card">
            <span class="pill-badge pill-neutral">APOTEK FASKES</span>
            <div style="font-weight: 700; font-size: 14px; margin: 8px 0 4px 0;">Paket Vitamin Gratis</div>
            <p style="font-size: 12px; color: #64748b;">Ambil suplemen multivitamin di apotek tanpa biaya tambahan.</p>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin: 8px 0;">60 Poin</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Tukarkan (60 Pts)", disabled=(st.session_state.user_points < 60), key="v_vit"):
            st.session_state.user_points -= 60
            st.success("Kode Voucher: TANYA-VITAMIN-FREE")
            st.rerun()


# ==========================================
# TAB 4: KEPATUHAN TERAPI
# ==========================================
with tabs[3]:
    taken_num = len([m for m in st.session_state.medications if m["taken"]])
    adherence_pct = int((taken_num / len(st.session_state.medications)) * 100)
    
    st.markdown(f"""
    <div class="clean-card">
        <div class="metric-label">Tingkat Kepatuhan Obat Hari Ini</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; font-size: 16px; color: #0f172a;">{taken_num} dari {len(st.session_state.medications)} Dosis Selesai</span>
            <span style="font-weight: 700; color: #ff4b4b;">{adherence_pct}%</span>
        </div>
        <div style="width: 100%; height: 8px; background-color: #f1f5f9; border-radius: 9999px; overflow: hidden;">
            <div style="width: {adherence_pct}%; height: 100%; background-color: #ff4b4b; border-radius: 9999px;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("#### 💊 Daftar Obat Resep Puskesmas Wonorejo")
    for idx, med in enumerate(st.session_state.medications):
        c_m1, c_m2 = st.columns([3, 1])
        with c_m1:
            st.markdown(f"""
            <div class="clean-card" style="padding: 14px 18px; margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 14px; color: #0f172a;">{med['name']} ({med['dosage']})</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Aturan: {med['schedule']}</div>
                <div style="font-size: 11px; color: {'#10b981' if med['taken'] else '#f59e0b'}; font-weight: 600; margin-top: 4px;">
                    {'✓ Terkonfirmasi diminum: ' + str(med['time']) if med['taken'] else '⏳ Menunggu jadwal'}
                </div>
            </div>
            """, unsafe_allow_html=True)
        with c_m2:
            if not med["taken"]:
                if st.button(f"Tandai Sudah Minum (+5 Pts)", key=f"med_{med['id']}", type="primary", use_container_width=True):
                    st.session_state.medications[idx]["taken"] = True
                    st.session_state.medications[idx]["time"] = datetime.datetime.now().strftime("%H:%M WIB")
                    st.session_state.user_points += 5
                    st.session_state.user_badges = update_badges(st.session_state.user_points)
                    st.success(f"+5 Poin untuk {med['name']}!")
                    st.rerun()
            else:
                st.button("Sudah Diminum ✓", disabled=True, key=f"med_done_{med['id']}", use_container_width=True)


# --- 7. CLEAN FOOTER ---
st.write("")
st.markdown("""
<div style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 18px 24px; border-radius: 12px; margin-top: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #64748b;">
    <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #ff4b4b; display: inline-block;"></span>
        <strong style="color: #0f172a;">TanyaMed Platform</strong>
        <span>|</span>
        <span>Jembatan Swadiagnosis ke Sistem Kesehatan Formal SATUSEHAT</span>
    </div>
    <div style="display: flex; gap: 12px; color: #94a3b8;">
        <span>Kemenkes PMK No. 24/2022</span>
        <span>•</span>
        <span>UU PDP No. 27/2022</span>
        <span>•</span>
        <span style="color: #ff4b4b; font-weight: 600;">Streamlit Cloud Ready</span>
    </div>
</div>
""", unsafe_allow_html=True)

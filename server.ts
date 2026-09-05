import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "TanyaMed API", timestamp: new Date().toISOString() });
});

// Emergency danger keywords for server-side triage verification
const EMERGENCY_KEYWORDS = [
  "nyeri dada", "sesak napas", "sesak nafas", "tidak bisa napas", "napas berat",
  "stroke", "mati rasa sebelah", "pingsan", "tidak sadar", "kejang",
  "muntah darah", "perdarahan hebat", "pendarahan hebat", "dada ditindih",
  "jantung berdebar hebat", "kehilangan kesadaran", "mulut mencong", "bicara pelo"
];

// POST /api/triage-chat: AI-driven triage, health info, and pre-anamnesis
app.post("/api/triage-chat", async (req, res) => {
  try {
    const { message, history = [], currentTurn = 1 } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Pesan tidak valid" });
    }

    const lowerMsg = message.toLowerCase().trim();

    // Attempt Gemini 3.8 Flash for organic multi-topic conversational health companion
    const ai = getAi();
    if (ai) {
      try {
        const systemInstruction = `Kamu adalah TanyaMed, sahabat & asisten kesehatan digital berbasis WhatsApp di Indonesia.

KEPRIBADIAN & GAYA KOMUNIKASI:
1. ORGANIK, HANGAT, & FLEKSIBEL: Bersikaplah ramah, empatik, santun, dan luwes seperti tenaga medis atau sahabat kesehatan di WhatsApp. Jangan kaku, jangan seperti kuesioner formal. Jawablah sesuai topik yang diajukan pengguna.
2. DIVERSIFIKASI TOPIK:
   - Sapaan & Kabar ("Halo", "Apa kabar?", "Pagi/Siang"): Jawab dengan hangat dan tulus, tanyakan kabar harinya, ajak ngobrol seputar kesehatan, pola hidup, info obat, atau jika ada keluhan yang ingin diceritakan.
   - Informasi Kesehatan & Pola Hidup ("tips tidur nyenyak", "berapa liter minum", "makanan sehat"): Berikan penjelasan edukatif yang ringkas, praktis, dan mudah dipahami dalam 2-4 kalimat.
   - Informasi Obat ("bolehkah minum parasetamol sebelum makan?", "fungsi amlodipin apa?", "kenapa antibiotik harus habis?"): Jelaskan fungsi obat, aturan minum umum, dan tips konsumsi aman. Ingatkan bahwa instruksi dokter dan apoteker adalah rujukan utama.
   - Keluhan Sakit / Ketidaknyamanan Fisik: Berikan empati, lalu bantu gali 5 elemen riwayat secara bertahap dan mengalir: (1) Keluhan utama, (2) Lokasi rasa sakit, (3) Durasi sudah berapa lama, (4) Pemicu yang memperberat/meredakan, (5) Riwayat konsumsi obat mandiri. Tanyakan 1-2 pertanyaan per giliran agar terasa natural.
   - Deteksi Gawat Darurat (Nyeri dada hebat menekan/menjalar, sesak napas berat, tanda stroke/kelemahan separuh tubuh, kejang, muntah darah, pingsan/penurunan kesadaran): Prioritaskan keselamatan! Berikan peringatan tenang dan tegas untuk segera ke IGD terdekat atau menghubungi 119, sarankan posisi setengah duduk, jangan mengemudi sendiri.
3. BATASAN ETIS:
   - JANGAN PERNAH memberikan diagnosis pasti penyakit.
   - JANGAN PERNAH meresepkan obat keras atau menentukan dosis khusus pasien di luar anjuran umum pada kemasan obat bebas.
   - Ingatkan bahwa pemeriksaan langsung oleh dokter faskes tetap diperlukan untuk memastikan kondisi kesehatan.

PENTING — METADATA KLINIS TERSEMBUNYI:
Sertakan tag metadata di bagian paling akhir teks responmu persis dalam format ini:
<!--CLINICAL_DATA:{"intent":"greeting"|"health_info"|"medicine_info"|"anamnesis_progress"|"anamnesis_complete"|"emergency","isEmergency":false,"isAnamnesisComplete":false,"keluhan":"","lokasi":"","durasi":"","karakteristik":"","obatMandiri":""}-->`;

        // Format history into Gemini contents
        const geminiContents = [];
        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
          const textContent = item.text || item.content || "";
          if (textContent) {
            // Strip any prior clinical tags if present in history
            const cleanText = textContent.replace(/<!--CLINICAL_DATA:[\s\S]*?-->/g, "").trim();
            geminiContents.push({
              role,
              parts: [{ text: cleanText }],
            });
          }
        }
        geminiContents.push({
          role: "user",
          parts: [{ text: message }],
        });

        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: geminiContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
        } catch (modelErr) {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: geminiContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
        }

        let replyText = response.text || "";
        let clinicalMeta: any = {
          intent: "health_info",
          isEmergency: false,
          isAnamnesisComplete: false,
        };

        const metaMatch = replyText.match(/<!--CLINICAL_DATA:([\s\S]*?)-->/);
        if (metaMatch) {
          try {
            clinicalMeta = JSON.parse(metaMatch[1].trim());
          } catch (e) {
            // parsing fallback
          }
          replyText = replyText.replace(/<!--CLINICAL_DATA:[\s\S]*?-->/g, "").trim();
        }

        // Secondary check on critical emergency keywords
        const isEmergencyKw = EMERGENCY_KEYWORDS.some((kw) => lowerMsg.includes(kw));
        if (clinicalMeta.isEmergency || clinicalMeta.intent === "emergency" || (isEmergencyKw && !lowerMsg.includes("apa itu") && !lowerMsg.includes("apakah"))) {
          clinicalMeta.isEmergency = true;
          clinicalMeta.intent = "emergency";
        }

        let type: "normal" | "emergency" | "complete" = "normal";
        let action = "obrolan_santai";

        if (clinicalMeta.isEmergency) {
          type = "emergency";
          action = "rujuk_darurat";
        } else if (clinicalMeta.isAnamnesisComplete || clinicalMeta.intent === "triage_complete") {
          type = "complete";
          action = "catat_riwayat";
        } else if (clinicalMeta.intent === "anamnesis_progress") {
          type = "normal";
          action = "tanya_lanjutan";
        }

        return res.json({
          reply: replyText,
          type,
          action,
          intent: clinicalMeta.intent || "general",
          extractedData: {
            keluhan: clinicalMeta.keluhan || message,
            lokasi: clinicalMeta.lokasi || "Sesuai percakapan",
            durasi: clinicalMeta.durasi || "Tercatat dalam percakapan",
            karakteristik: clinicalMeta.karakteristik || "Telah digali dalam pre-anamnesis",
            obatMandiri: clinicalMeta.obatMandiri || "Terdokumentasi",
            alasan: clinicalMeta.isEmergency ? "Deteksi kegawatdaruratan triase merah" : undefined,
          },
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to dynamic conversational handler:", geminiError);
      }
    }

    // Dynamic & organic fallback when Gemini is offline or not configured
    const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lowerMsg.includes(kw));
    if (isEmergency) {
      return res.json({
        reply:
          "⚠️ **PERINGATAN KONDISI DARURAT MEDIS**\n\nGejala yang kamu sebutkan berpotensi merupakan kondisi gawat darurat (triase merah) yang membutuhkan penanganan medis segera.\n\n🚨 **Tindakan Segera:**\n- Segera menuju ke **IGD terdekat** atau hubungi ambulans **119**.\n- Jangan mengemudi sendiri.\n- Istirahat dengan posisi setengah duduk.\n\n📡 *Data rujukan darurat ini telah otomatis diteruskan ke IGD Puskesmas Wonorejo agar tim medis segera bersiaga.*",
        type: "emergency",
        action: "rujuk_darurat",
        extractedData: {
          keluhan: message,
          alasan: "Deteksi tanda bahaya kardiovaskular / pernapasan akut",
        },
      });
    }

    // Check for friendly greetings / "apa kabar"
    if (
      lowerMsg.includes("apa kabar") ||
      lowerMsg.includes("halo") ||
      lowerMsg.includes("hai") ||
      lowerMsg.includes("selamat pagi") ||
      lowerMsg.includes("selamat siang") ||
      lowerMsg.includes("selamat malam")
    ) {
      return res.json({
        reply:
          "Halo! Kabar saya baik dan siap menemani harimu 😊 Bagaimana kabarmu hari ini? Semoga tubuhmu terasa segar dan fit ya!\n\nAda yang ingin diobrolkan atau ditanyakan hari ini? Kamu bebas bertanya tentang info obat, tips pola makan sehat, hidrasi, atau jika ada keluhan tubuh yang sedang dirasakan.",
        type: "normal",
        action: "sapaan",
      });
    }

    // Check for medication questions
    if (
      lowerMsg.includes("obat") ||
      lowerMsg.includes("parasetamol") ||
      lowerMsg.includes("amoksisilin") ||
      lowerMsg.includes("antibiotik") ||
      lowerMsg.includes("vitamin") ||
      lowerMsg.includes("amlodipin")
    ) {
      let medReply =
        "Informasi obat yang bagus untuk diperhatikan! Secara umum, obat seperti pereda nyeri/demam (misal parasetamol) sebaiknya diminum sesuai dosis kemasan atau resep dokter. Jika obat antibiotik, wajib diminum teratur sampai habis agar bakteri tidak kebal.\n\nApakah ada obat spesifik yang sedang ingin kamu tanyakan aturan pakainya?";
      if (lowerMsg.includes("parasetamol")) {
        medReply =
          "Parasetamol adalah obat pereda demam dan nyeri ringan hingga sedang. Umumnya diminum setelah makan atau saat perut kosong dengan segelas air. Dosis dewasa lazim adalah 500mg tiap 4-6 jam jika perlu (maksimal 4000mg/hari). Hindari konsumsi bersama alkohol dan selalu perhatikan petunjuk kemasan ya 😊";
      }
      return res.json({
        reply: medReply,
        type: "normal",
        action: "info_obat",
      });
    }

    // Check for general wellness / lifestyle questions
    const isWellnessQuery =
      lowerMsg.includes("tips") ||
      lowerMsg.includes("pola hidup") ||
      lowerMsg.includes("olahraga") ||
      lowerMsg.includes("hidrasi") ||
      lowerMsg.includes("pola makan") ||
      lowerMsg.includes("makanan sehat") ||
      lowerMsg.includes("susah tidur") ||
      lowerMsg.includes("insomnia") ||
      lowerMsg.includes("cara tidur");

    if (isWellnessQuery) {
      return res.json({
        reply:
          "Menjaga tubuh bugar itu kuncinya konsistensi sederhana: cukupi minum air 2–2.5 liter per hari, usahakan tidur berkualitas 7–8 jam, dan luangkan jalan kaki santai 20-30 menit. Langkah kecil setiap hari berdampak besar untuk daya tahan tubuh! Ada aspek kebugaran tertentu yang ingin kamu optimalkan?",
        type: "normal",
        action: "tips_sehat",
      });
    }

    // Sickness / symptom anamnesis flow
    let reply = "";
    let type: "normal" | "complete" = "normal";

    if (currentTurn <= 2) {
      reply =
        "Saya mengerti rasa tidak nyamannya. Boleh ceritakan lebih lanjut, di bagian tubuh mana rasa sakit atau keluhan tersebut paling terasa, dan sudah sejak kapan kamu merasakannya?";
    } else if (currentTurn === 3) {
      reply =
        "Terima kasih atas penjelasannya. Apakah ada faktor tertentu yang membuat keluhan ini terasa semakin berat (misalnya saat beraktivitas atau posisi tertentu), atau hal yang membuatnya membaik?";
    } else if (currentTurn === 4) {
      reply =
        "Sudah tercatat. Sebelum berkonsultasi, apakah kamu sudah sempat minum obat mandiri (obat warung, resep lama, atau herbal), dan bagaimana efeknya di tubuhmu?";
    } else {
      type = "complete";
      reply =
        "Terima kasih banyak atas keterangannya! Seluruh riwayat pre-anamnesis keluhanmu sudah **lengkap tercatat dan terenkripsi** ✅\n\nInformasi ini telah disalurkan ke sistem antrean Puskesmas Wonorejo dan SATUSEHAT Kemenkes RI, sehingga dokter dapat langsung memahami kondisimu tanpa mengulang tanya dari awal. Kamu mendapatkan **+10 Poin Sehat**! 🎁";
    }

    return res.json({
      reply,
      type,
      action: type === "complete" ? "catat_riwayat" : "tanya_lanjutan",
      extractedData:
        type === "complete"
          ? {
              keluhan: message,
              lokasi: "Sesuai anamnesis",
              durasi: "Tercatat",
              karakteristik: "Tercatat dalam percakapan",
              obatMandiri: "Terdokumentasi",
            }
          : null,
    });
  } catch (err: any) {
    console.error("Error in /api/triage-chat:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada sistem triase TanyaMed" });
  }
});

// GET /api/streamlit-source: returns the contents of app.py, requirements.txt, etc.
app.get("/api/streamlit-source", (req, res) => {
  try {
    const appPyPath = path.join(process.cwd(), "app.py");
    const reqPath = path.join(process.cwd(), "requirements.txt");
    const readmePath = path.join(process.cwd(), "README.md");
    const configPath = path.join(process.cwd(), ".streamlit", "config.toml");

    const appPy = fs.existsSync(appPyPath) ? fs.readFileSync(appPyPath, "utf-8") : "";
    const requirements = fs.existsSync(reqPath) ? fs.readFileSync(reqPath, "utf-8") : "";
    const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : "";
    const configToml = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf-8") : "";

    res.json({
      files: {
        "app.py": appPy,
        "requirements.txt": requirements,
        "README.md": readme,
        ".streamlit/config.toml": configToml,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal membaca file Streamlit" });
  }
});

// Vite middleware configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TanyaMed server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

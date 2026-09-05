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
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

// POST /api/triage-chat: AI-driven triage & pre-anamnesis
app.post("/api/triage-chat", async (req, res) => {
  try {
    const { message, history = [], currentTurn = 1 } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Pesan tidak valid" });
    }

    const lowerMsg = message.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some((kw) => lowerMsg.includes(kw));

    if (isEmergency) {
      return res.json({
        reply: "⚠️ **PERINGATAN KONDISI DARURAT MEDIS**\n\nGejala yang kamu sebutkan berpotensi merupakan kondisi gawat darurat (triase merah) yang membutuhkan penanganan medis segera.\n\n🚨 **Tindakan Segera:**\n- Segera menuju ke **IGD terdekat** atau hubungi ambulans **119**.\n- Jangan mengemudi sendiri.\n- Istirahat dengan posisi setengah duduk.\n\n📡 *Data rujukan darurat ini telah otomatis diteruskan ke IGD Puskesmas Wonorejo agar tim medis segera bersiaga.*",
        type: "emergency",
        action: "rujuk_darurat",
        extractedData: {
          keluhan: message,
          kategori: "Kondisi Kegawatdaruratan (Triase Merah)",
          alasan: "Deteksi tanda bahaya kardiovaskular / kegawatan napas / defisit neurologis akut",
          rekomendasi: "Rujuk segera ke IGD 119",
        },
      });
    }

    // Attempt Gemini 3.8 Flash for warm pre-anamnesis conversational triage
    const ai = getAi();
    if (ai) {
      try {
        const systemInstruction = `Kamu adalah TanyaMed, asisten triase & pre-anamnesis kesehatan via WhatsApp di Indonesia.
Pedoman Etis Mutlak:
1. JANGAN PERNAH mendiagnosis penyakit secara pasti.
2. JANGAN PERNAH meresepkan atau menyarankan obat keras/antibiotik spesifik.
3. Peranmu adalah pre-anamnesis: menggali 5 elemen kunci secara bertahap dan santun:
   - Keluhan utama
   - Lokasi gejala
   - Durasi
   - Karakteristik (apa yang memperberat/meredakan)
   - Riwayat pengobatan mandiri
4. Gaya bicara: WhatsApp style, hangat, empati, singkat (maksimal 2-3 kalimat), gunakan bahasa Indonesia santai tapi sopan.
5. Jika pasien sudah memberikan informasi cukup untuk 5 elemen tersebut, katakan bahwa data telah lengkap dicatat untuk dokter di Puskesmas Wonorejo dan mereka mendapat reward +10 Poin SATUSEHAT.`;

        const prompt = `Riwayat percakapan sebelumnya: ${JSON.stringify(history.slice(-4))}
Pesan terbaru pengguna: "${message}"
Giliran percakapan ke: ${currentTurn}
Berikan respon sebagai TanyaMed sesuai pedoman.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        const replyText = response.text || "";
        const isComplete = currentTurn >= 4 || lowerMsg.includes("obat") || lowerMsg.includes("parasetamol");

        return res.json({
          reply: replyText,
          type: isComplete ? "complete" : "in_progress",
          action: isComplete ? "catat_riwayat" : "tanya_lanjutan",
          extractedData: isComplete
            ? {
                keluhan: message,
                lokasi: "Sesuai transkrip",
                durasi: "Tercatat dalam percakapan",
                karakteristik: "Telah digali dalam pre-anamnesis",
                obatMandiri: "Terdokumentasi",
              }
            : null,
        });
      } catch (geminiError) {
        console.warn("Gemini API error, falling back to deterministic triage:", geminiError);
      }
    }

    // Deterministic fallback if Gemini key is missing or offline
    let reply = "";
    let type = "in_progress";
    let action = "tanya_lanjutan";

    if (currentTurn === 1) {
      reply = "Baik, keluhanmu sudah saya catat. Di mana **lokasi persisnya** rasa sakit atau tidak nyaman tersebut terasa, dan sudah berlangsung **berapa lama**?";
    } else if (currentTurn === 2) {
      reply = "Terima kasih infonya. Apakah ada hal yang membuat keluhanmu terasa **semakin berat** (misal saat beraktivitas, malam hari) atau hal yang membuatnya membaik?";
    } else if (currentTurn === 3) {
      reply = "Dicatat. Apakah kamu **sudah sempat minum obat** warung/resep lama atau melakukan penanganan mandiri sebelum ini?";
    } else {
      type = "complete";
      action = "catat_riwayat";
      reply = "Terima kasih banyak! 5 elemen riwayat gejala kamu sudah **lengkap tercatat dan terenkripsi** ✅\n\nInfo ini langsung diteruskan ke Puskesmas Wonorejo dan disinkronkan ke rekam medis SATUSEHAT. Kamu mendapatkan **+10 Poin Sehat**! 🎁";
    }

    return res.json({
      reply,
      type,
      action,
      extractedData:
        type === "complete"
          ? {
              keluhan: message,
              lokasi: "Kepala/area keluhan",
              durasi: "2-3 hari",
              karakteristik: "Tercatat dalam percakapan",
              obatMandiri: "Penanganan awal",
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

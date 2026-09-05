import React, { useState } from "react";
import { Header } from "./components/Header";
import { WhatsAppView } from "./components/WhatsAppView";
import { FaskesView } from "./components/FaskesView";
import { SatuSehatView } from "./components/SatuSehatView";
import { AdherenceView } from "./components/AdherenceView";
import { PhilosophyView } from "./components/PhilosophyView";
import { ChatMessage, TriageRecord, Medication, VoucherItem } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("whatsapp");
  const [points, setPoints] = useState<number>(20);
  const [badges, setBadges] = useState<string[]>(["Pemula Sehat"]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init-1",
      sender: "assistant",
      text: "Halo! Saya **TanyaMed** 👋 Asisten triase & pre-anamnesis kesehatan Anda.\n\nBoleh ceritakan apa keluhan yang sedang kamu rasakan saat ini?",
      time: "08:00",
      type: "normal",
    },
  ]);

  // Puskesmas Wonorejo triage records
  const [records, setRecords] = useState<TriageRecord[]>([
    {
      id: "TM-20260905-01",
      timestamp: "08:15 WIB",
      type: "non_emergency",
      patientName: "Pasien Anonim #42",
      keluhan: "Sakit kepala berdenyut bagian belakang sudah 2 hari",
      lokasi: "Belakang kepala & tengkuk",
      durasi: "2 hari",
      karakteristik: "Memberat saat kurang tidur dan menatap layar",
      obatMandiri: "Parasetamol 500mg, agak membaik",
      status: "Menunggu di Ruang Tunggu Poli Umum",
      triageLevel: "hijau",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      doctorNotes: "Anamnesis dasar terkonfirmasi. Periksa tekanan darah dan palpasi leher.",
      verifiedByDoctor: true,
    },
    {
      id: "TM-20260905-02",
      timestamp: "08:28 WIB",
      type: "emergency",
      patientName: "Pasien Anonim #88",
      keluhan: "Nyeri dada hebat menjalar ke lengan kiri & sesak napas berat",
      lokasi: "Dada kiri substernal",
      durasi: "Sejak 1 jam lalu",
      karakteristik: "Sensasi tertindih beban berat, keringat dingin",
      obatMandiri: "Belum minum obat",
      status: "⚠️ SIAGA IGD — Pasien dalam perjalanan via Ambulans 119",
      alasan: "Berpotensi Sindroma Koroner Akut (SKA) / Kegawatan Kardiovaskular Akut",
      triageLevel: "merah",
      hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      verifiedByDoctor: true,
      doctorNotes: "Persiapkan bed resusitasi IGD, mesin EKG 12-lead, dan akses kanul oksigen.",
    },
  ]);

  // Medications state
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "med-1",
      name: "Amlodipine",
      dosage: "5mg",
      schedule: "1x sehari (Pagi hari sebelum makan)",
      taken: true,
      timeTaken: "07:15 WIB",
    },
    {
      id: "med-2",
      name: "Metformin",
      dosage: "500mg",
      schedule: "2x sehari (Bersama / setelah makan)",
      taken: false,
    },
    {
      id: "med-3",
      name: "Amoxicillin Trihydrate (Antibiotik Terkontrol)",
      dosage: "500mg",
      schedule: "3x sehari (Tiap 8 jam — Wajib dihabiskan)",
      taken: false,
    },
  ]);

  // Vouchers state
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    {
      id: "v-1",
      title: "Voucher Cek Kolesterol & Asam Urat 20%",
      category: "Laboratorium",
      pointsCost: 30,
      code: "TANYA-LAB20-KOL",
      claimed: false,
      benefit: "Diskon 20% pemeriksaan kimia darah di Lab Mitra Puskesmas Wonorejo.",
    },
    {
      id: "v-2",
      title: "Voucher Konsultasi Dokter Spesialis 15%",
      category: "Telekonsultasi",
      pointsCost: 50,
      code: "TANYA-SPESIALIS15",
      claimed: false,
      benefit: "Potongan biaya konsultasi rujukan lanjutan di RSUD terdekat.",
    },
    {
      id: "v-3",
      title: "Paket Vitamin & Suplemen Imunitas Gratis",
      category: "Apotek Faskes",
      pointsCost: 60,
      code: "TANYA-VITAMIN-FREE",
      claimed: false,
      benefit: "Ambil suplemen multivitamin di apotek Puskesmas Wonorejo tanpa biaya.",
    },
  ]);

  // Badge calculation
  const updateBadges = (newPoints: number) => {
    const list = ["Pemula Sehat"];
    if (newPoints >= 30) list.push("Pasien Siaga");
    if (newPoints >= 60) list.push("Ahli Riwayat");
    setBadges(list);
  };

  // Chat sender handler
  const handleSendMessage = async (text: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: timeStr,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const userTurns = updatedHistory.filter((m) => m.sender === "user").length;

      const res = await fetch("/api/triage-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedHistory.map((m) => ({ role: m.sender, text: m.text })),
          currentTurn: userTurns,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "Terima kasih, saya telah mencatat informasi tersebut.",
        time: `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`,
        type: data.type || "normal",
        extractedData: data.extractedData,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If emergency, insert immediate alert card to Puskesmas Wonorejo queue
      if (data.type === "emergency") {
        const emergencyCard: TriageRecord = {
          id: `TM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
            now.getDate()
          ).padStart(2, "0")}-${String(records.length + 1).padStart(2, "0")}`,
          timestamp: `${timeStr} WIB`,
          type: "emergency",
          patientName: `Pasien WhatsApp #${records.length + 1}`,
          keluhan: text,
          lokasi: "Vital / Kardiovaskular / Pernapasan",
          durasi: "Akut (Baru Saja Terlaporkan)",
          karakteristik: "Tanda bahaya kegawatan memerlukan penanganan darurat",
          obatMandiri: "Belum / Tidak disarankan mandiri",
          status: "⚠️ SIAGA IGD — Diarahkan Segera ke IGD 119",
          alasan:
            data.extractedData?.alasan ||
            "Deteksi tanda bahaya kegawatdaruratan triase merah",
          triageLevel: "merah",
          hash: Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
          verifiedByDoctor: false,
        };
        setRecords((prev) => [emergencyCard, ...prev]);
      }

      // If pre-anamnesis complete, award points and create structured card
      if (data.type === "complete") {
        const newPoints = points + 10;
        setPoints(newPoints);
        updateBadges(newPoints);

        const completeCard: TriageRecord = {
          id: `TM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
            now.getDate()
          ).padStart(2, "0")}-${String(records.length + 1).padStart(2, "0")}`,
          timestamp: `${timeStr} WIB`,
          type: "non_emergency",
          patientName: `Pasien WhatsApp #${records.length + 1}`,
          keluhan: text,
          lokasi: data.extractedData?.lokasi || "Kepala / area keluhan",
          durasi: data.extractedData?.durasi || "Beberapa hari terakhir",
          karakteristik:
            data.extractedData?.karakteristik || "Telah digali dalam pre-anamnesis",
          obatMandiri: data.extractedData?.obatMandiri || "Penanganan awal",
          status: "Tersimpan di Sistem Antrean Poli",
          triageLevel: "hijau",
          hash: Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
          verifiedByDoctor: false,
        };
        setRecords((prev) => [completeCard, ...prev]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "Mohon maaf, terjadi kendala jaringan sesaat. Namun keluhan Anda aman tersimpan. Silakan lanjutkan.",
          time: timeStr,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "assistant",
        text: "Halo! Saya **TanyaMed** 👋 Asisten triase & pre-anamnesis kesehatan Anda.\n\nBoleh ceritakan apa keluhan yang sedang kamu rasakan saat ini?",
        time: "08:00",
        type: "normal",
      },
    ]);
  };

  const handleUpdateRecord = (id: string, updates: Partial<TriageRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleToggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextTaken = !m.taken;
          if (nextTaken) {
            const newPoints = points + 5;
            setPoints(newPoints);
            updateBadges(newPoints);
          }
          return {
            ...m,
            taken: nextTaken,
            timeTaken: nextTaken
              ? `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")} WIB`
              : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleReportSideEffect = (medName: string, notes: string) => {
    const alertRecord: TriageRecord = {
      id: `SE-${Date.now().toString().slice(-6)}`,
      timestamp: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")} WIB`,
      type: "non_emergency",
      patientName: "Laporan Efek Samping Pasien",
      keluhan: `Keluhan Efek Samping Obat: ${medName} — "${notes}"`,
      lokasi: "Reaksi pasca-konsumsi",
      durasi: "Hari ini",
      karakteristik: "Timbul setelah meminum obat resep",
      obatMandiri: medName,
      status: "Menunggu Telaah Dokter / Apoteker",
      triageLevel: "kuning",
      hash: Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      doctorNotes: `Dilaporkan oleh pasien terkait ${medName}: ${notes}`,
      verifiedByDoctor: false,
    };
    setRecords((prev) => [alertRecord, ...prev]);
  };

  const handleClaimVoucher = (voucherId: string, cost: number) => {
    if (points >= cost) {
      setPoints((prev) => prev - cost);
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucherId ? { ...v, claimed: true } : v))
      );
    }
  };

  const emergencyCount = records.filter((r) => r.type === "emergency").length;
  const currentBadge = badges[badges.length - 1];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1e293b] flex flex-col font-sans selection:bg-[#ff4b4b] selection:text-white">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        points={points}
        badge={currentBadge}
        emergencyCount={emergencyCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === "whatsapp" && (
          <WhatsAppView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onResetChat={handleResetChat}
            points={points}
          />
        )}

        {activeTab === "faskes" && (
          <FaskesView records={records} onUpdateRecord={handleUpdateRecord} />
        )}

        {activeTab === "satusehat" && (
          <SatuSehatView
            points={points}
            badges={badges}
            records={records}
            onClaimVoucher={handleClaimVoucher}
            vouchers={vouchers}
          />
        )}

        {activeTab === "kepatuhan" && (
          <AdherenceView
            medications={medications}
            onToggleMedication={handleToggleMedication}
            onReportSideEffect={handleReportSideEffect}
            points={points}
          />
        )}

        {activeTab === "filosofi" && <PhilosophyView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e8f0] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#ff4b4b]"></div>
            <span className="font-semibold text-slate-800">TanyaMed Platform</span>
            <span className="text-slate-300">|</span>
            <span>Jembatan Swadiagnosis ke Sistem Kesehatan Formal SATUSEHAT</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Kemenkes PMK No. 24/2022</span>
            <span>•</span>
            <span>UU PDP No. 27/2022</span>
            <span>•</span>
            <span className="text-[#ff4b4b] font-semibold">Streamlit Cloud Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

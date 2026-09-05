import React from "react";
import {
  Brain,
  ShieldAlert,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingDown,
  Users,
  Smartphone,
} from "lucide-react";

export const PhilosophyView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#ff4b4b]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Filosofi Sistem & Logika AI TanyaMed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prinsip etis, dua mode berpikir otonom, dan arsitektur 3 tingkat pendukung SATUSEHAT
            </p>
          </div>
        </div>
      </div>

      {/* Ethical Boundary & Two Thinking Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ethical Box */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
            Prinsip Utama
          </p>
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Batasan Etis yang Tidak Bisa Ditawar</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            TanyaMed <strong>tidak pernah mendiagnosis penyakit</strong> dan{" "}
            <strong>tidak pernah merekomendasikan obat spesifik</strong>. Peran sistem berhenti di
            "menggali dan menyampaikan", bukan "memutuskan dan mengobati".
          </p>
          <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs text-slate-600">
            Kecocokan gejala saja tidak cukup untuk memastikan suatu penyakit — pemeriksaan lanjutan
            oleh tenaga medis tetap wajib dilakukan di faskes formal.
          </div>
        </div>

        {/* 2 Autonomous Thinking Modes */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
            Logika Pengambilan Keputusan
          </p>
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
            <Brain className="w-4 h-4 text-slate-700" />
            <span>2 Mode Berpikir AI Bergantian</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
              <div className="font-bold text-red-900 mb-0.5">1. Mode Triase (Deteksi Bahaya)</div>
              <p className="text-red-950 leading-relaxed text-[11px]">
                Mendeteksi tanda kegawatdaruratan (nyeri dada hebat, sesak napas berat, perdarahan hebat,
                kejang, tanda stroke). Begitu terdeteksi, sistem <strong>berhenti bertanya</strong> dan
                langsung mengarahkan ke IGD 119. Kecepatan keputusan lebih penting daripada kelengkapan data.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <div className="font-bold text-emerald-900 mb-0.5">2. Mode Pre-Anamnesis (Penggalian Riwayat)</div>
              <p className="text-emerald-950 leading-relaxed text-[11px]">
                Jika aman, sistem menggali 5 elemen: keluhan utama, lokasi, durasi, karakteristik
                (pemberat/peringan), dan riwayat obat mandiri secara bertahap (1-2 pertanyaan per giliran)
                mengikuti ritme percakapan manusia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Tier Technical Architecture */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
          Infrastruktur Sistem
        </p>
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Arsitektur Teknis 3 Tingkat</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 1</div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Model Bahasa (LLM)</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Membalas percakapan secara real-time, menilai triase dan kelengkapan riwayat. Memiliki
              kemampuan memanggil tool secara otonom:
            </p>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="bg-red-100 text-red-800 p-1.5 rounded">rujuk_darurat()</div>
              <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded">catat_riwayat()</div>
            </div>
          </div>

          <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 2</div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Ekstraksi Terstruktur</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Mengekstrak data percakapan bebas menjadi 5 field deterministik tanpa kehilangan konteks:
            </p>
            <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5">
              <li>Keluhan Utama</li>
              <li>Lokasi Gejala</li>
              <li>Durasi Keluhan</li>
              <li>Karakteristik & Faktor</li>
              <li>Obat Mandiri yang Diminum</li>
            </ul>
          </div>

          <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 3</div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Penyimpanan SATUSEHAT</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Format standar HL7 FHIR, dienkripsi berlapis AES-256, dan diteruskan otomatis ke sistem
              antrean faskes tujuan (Puskesmas Wonorejo).
            </p>
            <div className="text-[11px] text-slate-800 font-semibold bg-white border border-[#e2e8f0] p-2 rounded">
              Retensi 25 Tahun (PMK No. 24/2022) & Perlindungan Data Pribadi (UU PDP).
            </div>
          </div>
        </div>
      </div>

      {/* Problems & Data Benchmarks */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
          Dampak & Urgensi
        </p>
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-[#ff4b4b]" />
          <span>Masalah Nyata Sistem Kesehatan yang Diselesaikan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Swadiagnosis</p>
            <h2 className="text-2xl font-bold text-[#ff4b4b]">59,8%</h2>
            <div className="text-[11px] text-slate-500 mt-2">Mencari info sendiri tanpa verifikasi</div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Swamedikasi</p>
            <h2 className="text-2xl font-bold text-amber-500">78,43%</h2>
            <div className="text-[11px] text-slate-500 mt-2">BPS 2025: konsumsi obat tanpa dokter</div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rasio Dokter</p>
            <h2 className="text-2xl font-bold text-slate-900">0,76 : 1000</h2>
            <div className="text-[11px] text-slate-500 mt-2">Keterbatasan waktu tatap muka</div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Penetrasi WA</p>
            <h2 className="text-2xl font-bold text-emerald-600">90,8%</h2>
            <div className="text-[11px] text-emerald-600 font-medium mt-2">Akses terluas di Indonesia</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { Medication } from "../types";

interface AdherenceViewProps {
  medications: Medication[];
  onToggleMedication: (id: string) => void;
  onReportSideEffect: (medName: string, notes: string) => void;
  points: number;
}

export const AdherenceView: React.FC<AdherenceViewProps> = ({
  medications,
  onToggleMedication,
  onReportSideEffect,
  points,
}) => {
  const [selectedMed, setSelectedMed] = useState(medications[0]?.name || "");
  const [effectNotes, setEffectNotes] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const takenCount = medications.filter((m) => m.taken).length;
  const adherencePercent = Math.round((takenCount / medications.length) * 100) || 0;

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectNotes.trim()) return;
    onReportSideEffect(selectedMed, effectNotes.trim());
    setSubmittedMessage(true);
    setEffectNotes("");
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#ff4b4b]">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Modul Kepatuhan Terapi Pasca-Konsultasi
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ANTIBIOTIK & KRONIS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mencegah resistensi antimikroba (AMR) dan komplikasi dengan pengingat obat terverifikasi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-lg">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Reward Kepatuhan:</span>
            <span className="font-bold text-emerald-700">+5 Poin SATUSEHAT per dosis</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Medication Schedule Tracker */}
        <div className="lg:col-span-8 space-y-4">
          {/* Adherence Progress Bar */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Tingkat Kepatuhan Obat Hari Ini</span>
              <span className="text-xs font-bold text-slate-900">
                {takenCount} dari {medications.length} Dosis ({adherencePercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff4b4b] rounded-full transition-all duration-500"
                style={{ width: `${adherencePercent}%` }}
              ></div>
            </div>
          </div>

          {/* List of Prescribed Medicines */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Daftar Obat Resep dari Dokter Puskesmas Wonorejo</span>
            </h3>

            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-xl border transition-all ${
                    med.taken
                      ? "bg-emerald-50/60 border-emerald-200"
                      : "bg-[#f8fafc] border-[#e2e8f0]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{med.name}</span>
                        <span className="text-xs font-semibold bg-white border border-[#e2e8f0] px-2 py-0.5 rounded text-slate-600">
                          {med.dosage}
                        </span>
                        {med.name.includes("Antibiotik") && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                            WAJIB HABIS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Aturan: {med.schedule}</span>
                      </div>
                      {med.timeTaken && (
                        <div className="text-[11px] text-emerald-700 font-medium">
                          ✓ Terkonfirmasi diminum pada: {med.timeTaken}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onToggleMedication(med.id)}
                      className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1.5 shrink-0 ${
                        med.taken
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300"
                          : "bg-[#ff4b4b] hover:bg-[#e03a3a] text-white shadow-xs shadow-red-100"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{med.taken ? "Sudah Diminum ✓" : "Tandai Sudah Minum (+5 Pts)"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Effect Reporting & AMR Education */}
        <div className="lg:col-span-4 space-y-4">
          {/* Side Effect Reporting Form */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
              Farmakovigilans
            </p>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Laporkan Efek Samping Obat</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Jika merasakan mual hebat, ruam kemerahan, atau keluhan setelah meminum obat, laporkan
              langsung agar ditinjau apoteker / dokter.
            </p>

            {submittedMessage && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg font-medium">
                ✓ Laporan efek samping berhasil dikirimkan ke dashboard Puskesmas Wonorejo.
              </div>
            )}

            <form onSubmit={handleReport} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Obat:</label>
                <select
                  value={selectedMed}
                  onChange={(e) => setSelectedMed(e.target.value)}
                  className="w-full text-xs p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ff4b4b]"
                >
                  {medications.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.dosage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gejala yang Dirasakan:
                </label>
                <textarea
                  rows={3}
                  value={effectNotes}
                  onChange={(e) => setEffectNotes(e.target.value)}
                  placeholder="Contoh: Merasa pusing berputar 30 menit setelah minum obat..."
                  className="w-full text-xs p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ff4b4b]"
                />
              </div>

              <button
                type="submit"
                disabled={!effectNotes.trim()}
                className="w-full bg-[#ff4b4b] hover:bg-[#e03a3a] disabled:opacity-40 text-white font-medium py-2 rounded-md text-xs transition-colors shadow-xs shadow-red-100"
              >
                Kirim Laporan ke Dokter Faskes
              </button>
            </form>
          </div>

          {/* AMR Education Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm text-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Bahaya Resistensi Antibiotik (AMR)</span>
            </div>
            <p className="text-slate-500 leading-relaxed mb-2">
              Kemenkes RI melaporkan tingkat resistensi mikroba mencapai <strong>22,1%</strong> karena
              kebiasaan berhenti minum antibiotik sebelum habis.
            </p>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-[11px] leading-relaxed">
              Antibiotik yang diresepkan wajib dihabiskan sesuai durasi dokter meskipun badan sudah
              terasa sehat, agar bakteri tidak berevolusi menjadi kebal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

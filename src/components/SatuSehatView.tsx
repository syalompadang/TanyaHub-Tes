import React from "react";
import {
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Calendar,
  Ticket,
  Check,
  Building,
  Key,
} from "lucide-react";
import { TriageRecord, VoucherItem } from "../types";

interface SatuSehatViewProps {
  points: number;
  badges: string[];
  records: TriageRecord[];
  onClaimVoucher: (id: string, cost: number) => void;
  vouchers: VoucherItem[];
}

export const SatuSehatView: React.FC<SatuSehatViewProps> = ({
  points,
  badges,
  records,
  onClaimVoucher,
  vouchers,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Gamification Banner in Clean Minimalism */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kemenkes RI • SATUSEHAT Eco-Rewards
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Gamifikasi Kesehatan Terintegrasi SATUSEHAT
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Dapatkan poin sehat dengan mengisi pre-anamnesis WhatsApp secara jujur dan menyelesaikan
              jadwal kepatuhan obat resep Puskesmas. Tukarkan poin untuk potongan pemeriksaan laboratorium.
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-center space-x-4 shrink-0">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Saldo Poin Kamu
              </div>
              <div className="text-2xl font-bold text-slate-900">{points} Pts</div>
              <div className="text-[10px] text-emerald-600 font-medium">Status Akun Aktif</div>
            </div>
          </div>
        </div>

        {/* Milestone Badges in Clean Minimalism */}
        <div className="mt-6 pt-5 border-t border-[#f1f5f9]">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3">
            Tingkatan Lencana Kamu
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`p-3 rounded-lg border text-xs flex items-center space-x-3 ${
                badges.includes("Pemula Sehat")
                  ? "bg-white border-[#e2e8f0] shadow-2xs text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                🌱
              </div>
              <div>
                <div className="font-semibold">Pemula Sehat (10 Pts)</div>
                <div className="text-[11px] text-slate-500">Memulai percakapan pre-anamnesis pertama</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border text-xs flex items-center space-x-3 ${
                badges.includes("Pasien Siaga")
                  ? "bg-white border-[#e2e8f0] shadow-2xs text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shrink-0">
                ⭐
              </div>
              <div>
                <div className="font-semibold">Pasien Siaga (30 Pts)</div>
                <div className="text-[11px] text-slate-500">Melengkapi 5 elemen riwayat medis</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border text-xs flex items-center space-x-3 ${
                badges.includes("Ahli Riwayat")
                  ? "bg-white border-[#e2e8f0] shadow-2xs text-slate-900"
                  : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              <div className="w-8 h-8 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-bold shrink-0">
                🏆
              </div>
              <div>
                <div className="font-semibold">Ahli Riwayat (60 Pts)</div>
                <div className="text-[11px] text-slate-500">Kepatuhan minum obat & verifikasi dokter</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Store */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Ticket className="w-4 h-4 text-[#ff4b4b]" />
          <h3 className="font-semibold text-slate-900 text-sm">
            Katalog Penukaran Voucher Sehat
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vouchers.map((v) => {
            const canClaim = points >= v.pointsCost && !v.claimed;

            return (
              <div
                key={v.id}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-[#e2e8f0] px-2 py-0.5 rounded">
                      {v.category}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {v.pointsCost} Pts
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{v.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{v.benefit}</p>
                </div>

                <div className="pt-3 border-t border-[#e2e8f0]">
                  {v.claimed ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center">
                      <div className="text-[10px] text-emerald-800 font-bold flex items-center justify-center gap-1 mb-1">
                        <Check className="w-3.5 h-3.5" /> Voucher Berhasil Diklaim
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-950 bg-white p-1 rounded border border-emerald-200">
                        {v.code}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onClaimVoucher(v.id, v.pointsCost)}
                      disabled={!canClaim}
                      className={`w-full py-2 rounded-md text-xs font-medium transition-colors ${
                        canClaim
                          ? "bg-[#ff4b4b] hover:bg-[#e03a3a] text-white shadow-xs shadow-red-100"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {points < v.pointsCost
                        ? `Butuh ${v.pointsCost - points} Pts Lagi`
                        : "Tukarkan Voucher Sekarang"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Compliance & Encryption Ledger (PMK 24/2022 & UU PDP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retention Standard */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Kepatuhan Retensi Rekam Medis (PMK No. 24/2022)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Sesuai Peraturan Menteri Kesehatan RI No. 24 Tahun 2022, data rekam medis elektronik (RME)
            wajib disimpan dan dapat diakses kembali dalam kurun waktu minimal <strong>25 tahun</strong>.
          </p>
          <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Masa Retensi:</span>
              <span className="font-semibold text-slate-800">2026 – 2051 (25 Tahun)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Format Ekspor:</span>
              <span className="font-semibold text-slate-800">HL7 FHIR R4 Standard</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Faskes Penampung:</span>
              <span className="font-semibold text-slate-800">Puskesmas Wonorejo</span>
            </div>
          </div>
        </div>

        {/* Cryptographic Hash Ledger */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Audit Trail & Integritas Hash (UU PDP No. 27/2022)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Setiap catatan pre-anamnesis dibubuhkan tanda tangan kriptografis SHA-256 untuk memastikan
            integritas rekaman medis tidak dapat dimanipulasi secara sepihak.
          </p>

          <div className="space-y-2">
            {records.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 rounded-lg text-xs font-mono"
              >
                <div className="flex justify-between text-slate-400 text-[10px] mb-0.5">
                  <span>{rec.id}</span>
                  <span className="text-emerald-700 font-bold">VERIFIED HASH</span>
                </div>
                <div className="text-[11px] text-slate-700 truncate">{rec.hash}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

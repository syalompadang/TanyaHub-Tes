import React, { useState } from "react";
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  UserCheck,
  Stethoscope,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { TriageRecord } from "../types";

interface FaskesViewProps {
  records: TriageRecord[];
  onUpdateRecord: (id: string, updates: Partial<TriageRecord>) => void;
}

export const FaskesView: React.FC<FaskesViewProps> = ({ records, onUpdateRecord }) => {
  const [filterType, setFilterType] = useState<"all" | "emergency" | "non_emergency">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<TriageRecord | null>(null);
  const [doctorNoteInput, setDoctorNoteInput] = useState("");
  const [showFhirModal, setShowFhirModal] = useState<TriageRecord | null>(null);

  const filteredRecords = records.filter((r) => {
    const matchesType =
      filterType === "all" ? true : filterType === "emergency" ? r.type === "emergency" : r.type === "non_emergency";
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.keluhan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const emergencyCount = records.filter((r) => r.type === "emergency").length;
  const nonEmergencyCount = records.filter((r) => r.type === "non_emergency").length;

  const handleSaveDoctorNotes = (recordId: string) => {
    onUpdateRecord(recordId, {
      doctorNotes: doctorNoteInput,
      verifiedByDoctor: true,
      status: "Sudah Diverifikasi Dokter Poli",
    });
    setDoctorNoteInput("");
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({
        ...selectedRecord,
        doctorNotes: doctorNoteInput,
        verifiedByDoctor: true,
        status: "Sudah Diverifikasi Dokter Poli",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Workspace Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#ff4b4b]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Puskesmas Wonorejo — Triage & Intake Station
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aliran kartu ringkasan pre-anamnesis WhatsApp & siaga darurat IGD otomatis
              </p>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => {
                if (records[0]) setShowFhirModal(records[0]);
              }}
              className="px-3.5 py-2 border border-[#e2e8f0] rounded-md hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              Export HL7 FHIR
            </button>
            <button
              onClick={() => setFilterType("emergency")}
              className="px-3.5 py-2 bg-[#ff4b4b] text-white rounded-md font-medium shadow-xs shadow-red-100 hover:bg-[#e03a3a] transition-colors"
            >
              Filter Siaga IGD ({emergencyCount})
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards in Clean Minimalism Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Pasien Masuk
          </p>
          <h2 className="text-2xl font-bold text-slate-900">{records.length}</h2>
          <div className="text-[11px] text-emerald-600 font-medium mt-2">Aliran aktif hari ini</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Triase Merah (IGD)
          </p>
          <h2 className="text-2xl font-bold text-[#ff4b4b]">{emergencyCount}</h2>
          <div className="text-[11px] text-red-500 font-medium mt-2">Prioritas penanganan 119</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Pre-Anamnesis Poli
          </p>
          <h2 className="text-2xl font-bold text-slate-900">{nonEmergencyCount}</h2>
          <div className="text-[11px] text-emerald-600 font-medium mt-2">Efisiensi waktu 65%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Terverifikasi Dokter
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            {records.filter((r) => r.verifiedByDoctor).length}
          </h2>
          <div className="text-[11px] text-amber-500 font-medium mt-2">Tersinkron SATUSEHAT</div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari pasien / keluhan / ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#e2e8f0] rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff4b4b]"
          />
        </div>

        <div className="flex items-center space-x-1 self-end sm:self-auto bg-white border border-[#e2e8f0] p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterType === "all" ? "bg-[#f1f5f9] text-[#ff4b4b]" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua ({records.length})
          </button>
          <button
            onClick={() => setFilterType("emergency")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterType === "emergency" ? "bg-red-50 text-[#ff4b4b] font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚠️ Rujukan Darurat ({emergencyCount})
          </button>
          <button
            onClick={() => setFilterType("non_emergency")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterType === "non_emergency" ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 Pre-Anamnesis ({nonEmergencyCount})
          </button>
        </div>
      </div>

      {/* Main Records Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List of Incoming Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {filteredRecords.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 text-center text-slate-400 text-xs">
              Tidak ada kartu triase yang sesuai dengan kriteria saat ini.
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isEmergency = rec.type === "emergency";
              const isSelected = selectedRecord?.id === rec.id;

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedRecord(rec);
                    setDoctorNoteInput(rec.doctorNotes || "");
                  }}
                  className={`bg-white rounded-xl border transition-all cursor-pointer p-5 ${
                    isSelected
                      ? "ring-2 ring-[#ff4b4b] border-transparent shadow-sm"
                      : isEmergency
                      ? "border-red-200 hover:border-red-300"
                      : "border-[#e2e8f0] hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEmergency
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isEmergency ? "RUJUKAN DARURAT" : "PRE-ANAMNESIS"}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-400">{rec.id}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rec.timestamp}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 mb-1">{rec.patientName}</h3>
                  <div className="text-xs text-slate-600 mb-3">
                    <span className="font-semibold text-slate-800">Keluhan: </span>
                    {rec.keluhan}
                  </div>

                  {isEmergency ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-950 mb-3">
                      <div className="font-semibold flex items-center gap-1 text-[#ff4b4b] mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Alasan Klinis:
                      </div>
                      <p>{rec.alasan || "Gejala berisiko kegawatdaruratan tinggi"}</p>
                      <div className="mt-1.5 text-[11px] font-bold text-red-700">
                        Status: {rec.status}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] mb-3">
                      <div>
                        <span className="text-slate-400">Lokasi: </span>
                        <span className="font-medium text-slate-800">{rec.lokasi}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Durasi: </span>
                        <span className="font-medium text-slate-800">{rec.durasi}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Faktor: </span>
                        <span className="font-medium text-slate-800">{rec.karakteristik}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Obat Mandiri: </span>
                        <span className="font-medium text-slate-800">{rec.obatMandiri}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[#f1f5f9]">
                    <div>
                      {rec.verifiedByDoctor ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi Dokter
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Menunggu Verifikasi Tatap Muka</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFhirModal(rec);
                      }}
                      className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-slate-400" /> FHIR JSON
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Record Detail & Doctor Action Panel */}
        <div className="lg:col-span-5">
          {selectedRecord ? (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm sticky top-24 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Review & Verifikasi Klinis</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedRecord.id} • {selectedRecord.patientName}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedRecord.type === "emergency"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {selectedRecord.type === "emergency" ? "TRIASE MERAH" : "TRIASE HIJAU"}
                </span>
              </div>

              {/* Detail fields */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Keluhan Pasien</div>
                  <div className="font-medium text-slate-900">{selectedRecord.keluhan}</div>
                </div>

                {selectedRecord.type === "emergency" ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-950">
                    <div className="font-semibold mb-1 flex items-center gap-1 text-[#ff4b4b]">
                      <ShieldAlert className="w-4 h-4" /> Instruksi Siaga IGD:
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-900">
                      Persiapkan bed resusitasi, pantau tanda vital (tekanan darah, SpO2, EKG 12 sadapan),
                      pasang akses IV dan oksigenasi sesuai protokol klinis Puskesmas Wonorejo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-[11px]">
                    <div><span className="text-slate-400">Lokasi:</span> <span className="text-slate-800 font-medium">{selectedRecord.lokasi}</span></div>
                    <div><span className="text-slate-400">Durasi:</span> <span className="text-slate-800 font-medium">{selectedRecord.durasi}</span></div>
                    <div><span className="text-slate-400">Pemicu:</span> <span className="text-slate-800 font-medium">{selectedRecord.karakteristik}</span></div>
                    <div><span className="text-slate-400">Obat Mandiri:</span> <span className="text-slate-800 font-medium">{selectedRecord.obatMandiri}</span></div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-mono">
                  SHA-256: {selectedRecord.hash.substring(0, 24)}...
                </div>
              </div>

              {/* Doctor Clinical Notes */}
              <div className="pt-2 border-t border-[#f1f5f9]">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                  <span>Catatan Verifikasi Dokter:</span>
                </label>
                <textarea
                  rows={3}
                  value={doctorNoteInput}
                  onChange={(e) => setDoctorNoteInput(e.target.value)}
                  placeholder="Masukkan hasil verifikasi anamnesis atau instruksi pemeriksaan lanjutan..."
                  className="w-full text-xs p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff4b4b] mb-3 text-slate-800"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSaveDoctorNotes(selectedRecord.id)}
                    className="w-full bg-[#ff4b4b] hover:bg-[#e03a3a] text-white font-medium py-2 rounded-md text-xs flex items-center justify-center space-x-1.5 shadow-xs shadow-red-100 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verifikasi & Simpan</span>
                  </button>
                  <button
                    onClick={() => setShowFhirModal(selectedRecord)}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-[#e2e8f0] font-medium py-2 rounded-md text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ekspor FHIR</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 text-center text-slate-400 text-xs">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Pilih salah satu kartu pasien di samping untuk meninjau riwayat dan memberi verifikasi
              klinis dokter.
            </div>
          )}
        </div>
      </div>

      {/* FHIR JSON Export Modal */}
      {showFhirModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#e2e8f0] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  SATUSEHAT Interoperability Bundle (FHIR R4)
                </h3>
              </div>
              <button
                onClick={() => setShowFhirModal(null)}
                className="text-slate-400 hover:text-slate-600 text-base leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 bg-[#f8fafc] border border-[#e2e8f0] text-slate-800 p-4 rounded-lg font-mono text-[11px] leading-relaxed">
              <pre>
                {JSON.stringify(
                  {
                    resourceType: "Bundle",
                    id: `satusehat-${showFhirModal.id}`,
                    meta: {
                      lastUpdated: new Date().toISOString(),
                      profile: ["https://fhir.kemkes.go.id/r4/StructureDefinition/Encounter"],
                    },
                    type: "transaction",
                    entry: [
                      {
                        resource: {
                          resourceType: "Encounter",
                          id: showFhirModal.id,
                          status: showFhirModal.type === "emergency" ? "triaged" : "arrived",
                          class: {
                            system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                            code: showFhirModal.type === "emergency" ? "EMER" : "AMB",
                            display: showFhirModal.type === "emergency" ? "Emergency" : "Ambulatory",
                          },
                          subject: {
                            reference: `Patient/${showFhirModal.patientName.replace(/\s+/g, "-")}`,
                            display: showFhirModal.patientName,
                          },
                          reasonCode: [{ text: showFhirModal.keluhan }],
                          serviceProvider: {
                            reference: "Organization/Puskesmas-Wonorejo-01",
                            display: "Puskesmas Wonorejo",
                          },
                          telecomBridge: "TanyaMed-WhatsApp-v1",
                          integrityHashSha256: showFhirModal.hash,
                        },
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(showFhirModal, null, 2));
                  alert("Data FHIR berhasil disalin ke clipboard!");
                }}
                className="bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2 rounded-md"
              >
                Salin JSON
              </button>
              <button
                onClick={() => setShowFhirModal(null)}
                className="bg-[#ff4b4b] hover:bg-[#e03a3a] text-white text-xs font-medium px-4 py-2 rounded-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

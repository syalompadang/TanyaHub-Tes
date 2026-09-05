import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Shield,
  CornerDownRight,
  CheckCheck,
} from "lucide-react";
import { ChatMessage } from "../types";

interface WhatsAppViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onResetChat: () => void;
  points: number;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onResetChat,
  points,
}) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText("");
    onSendMessage(msg);
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const hasEmergency = messages.some((m) => m.type === "emergency");
  const hasCompleted = messages.some((m) => m.type === "complete");

  const userMsgCount = messages.filter((m) => m.sender === "user").length;
  const elements = [
    { title: "1. Keluhan Utama", done: userMsgCount >= 1 },
    { title: "2. Lokasi Gejala", done: userMsgCount >= 2 },
    { title: "3. Durasi Keluhan", done: userMsgCount >= 2 },
    { title: "4. Karakteristik / Pemicu", done: userMsgCount >= 3 },
    { title: "5. Riwayat Obat Mandiri", done: userMsgCount >= 4 || hasCompleted },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner Notice */}
      <div className="mb-5 bg-white border border-[#e2e8f0] rounded-xl p-4 flex items-start justify-between shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">
              Standar Etis Klinis
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Layanan Pre-Anamnesis TanyaMed:</span>{" "}
              Sistem tidak mendiagnosis dan tidak merekomendasikan obat spesifik. Riwayat keluhan
              dienkripsi (AES-256) dan otomatis disalurkan ke <strong>Puskesmas Wonorejo</strong> serta{" "}
              <strong>SATUSEHAT Kemenkes RI</strong>.
            </div>
          </div>
        </div>
        <button
          onClick={onResetChat}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 shrink-0 px-3 py-1.5 border border-[#e2e8f0] hover:bg-slate-50 rounded-md transition-colors font-medium"
          title="Reset Sesi Percakapan"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset Sesi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Window Container (Clean Minimalism Simulator) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden h-[680px]">
          {/* Header */}
          <div className="bg-white border-b border-[#f1f5f9] px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#ff4b4b] font-bold text-base">
                  🩺
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight">TanyaMed Official</h3>
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Conversational Triage Agent • 24/7 Aktif
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="px-3 py-1.5 text-xs bg-[#ff4b4b] text-white rounded-md font-medium shadow-xs shadow-red-100 hover:bg-[#e03a3a] flex items-center space-x-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Panggilan 119</span>
              </button>
            </div>
          </div>

          {/* Emergency Alert Bar if triggered */}
          {hasEmergency && (
            <div className="bg-red-50 border-b border-red-200 text-red-900 px-5 py-2.5 text-xs font-medium flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-[#ff4b4b] shrink-0" />
                <span>
                  <strong>SIAGA IGD:</strong> Tanda bahaya kegawatan terdeteksi! Segera tuju IGD terdekat atau hubungi 119.
                </span>
              </div>
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="text-[#ff4b4b] font-bold underline shrink-0 ml-2"
              >
                Protokol 119
              </button>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#f8f9fa]">
            {/* Encryption notice bubble */}
            <div className="flex justify-center">
              <div className="bg-white border border-[#e2e8f0] text-slate-500 text-[11px] px-3 py-1 rounded-md text-center max-w-md shadow-2xs">
                🔒 Komunikasi terenkripsi AES-256. Data pre-anamnesis disalurkan ke Puskesmas Wonorejo & SATUSEHAT.
              </div>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isEmergency = msg.type === "emergency";
              const isComplete = msg.type === "complete";

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 shadow-2xs text-xs sm:text-sm relative leading-relaxed ${
                      isUser
                        ? "bg-[#1e293b] text-white rounded-tr-xs"
                        : isEmergency
                        ? "bg-red-50 border border-red-200 text-red-950 rounded-tl-xs"
                        : isComplete
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-tl-xs"
                        : "bg-white border border-[#e2e8f0] text-[#1e293b] rounded-tl-xs"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center space-x-1.5 mb-1.5 text-[10px] font-semibold text-slate-500">
                        <span className="text-slate-800 font-bold">TanyaMed Triage</span>
                        {isEmergency && (
                          <span className="bg-[#ff4b4b] text-white px-1.5 py-0.2 rounded text-[9px] font-bold">
                            TRIAGE MERAH (IGD)
                          </span>
                        )}
                        {isComplete && (
                          <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[9px] font-bold">
                            SELESAI +10 PTS
                          </span>
                        )}
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>

                    <div
                      className={`flex items-center justify-end space-x-1 mt-1.5 text-[10px] ${
                        isUser ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#e2e8f0] rounded-xl rounded-tl-xs px-4 py-2.5 shadow-2xs text-xs text-slate-500 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-[#ff4b4b] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#ff4b4b] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#ff4b4b] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Mengevaluasi urgensi triase & pre-anamnesis...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Symptom Chips */}
          <div className="bg-white border-t border-[#f1f5f9] px-4 py-2.5 flex items-center space-x-2 overflow-x-auto text-xs shrink-0">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-slate-400" /> Contoh:
            </span>
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Dada saya nyeri hebat seperti ditindih dan sesak napas sejak 1 jam lalu ⚠️"
                )
              }
              className="bg-red-50 hover:bg-red-100 text-[#ff4b4b] border border-red-200 px-3 py-1 rounded-md whitespace-nowrap transition-colors font-medium text-[11px]"
            >
              ⚠️ Nyeri Dada & Sesak (Kegawatan)
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Sakit kepala berdenyut di bagian belakang sudah 2 hari, tambah berat kalau kurang tidur"
                )
              }
              className="bg-[#f8fafc] hover:bg-slate-100 text-slate-700 border border-[#e2e8f0] px-3 py-1 rounded-md whitespace-nowrap transition-colors text-[11px]"
            >
              🤕 Sakit Kepala 2 Hari
            </button>
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Sudah minum parasetamol 500mg satu kali, agak membaik tapi masih pusing"
                )
              }
              className="bg-[#f8fafc] hover:bg-slate-100 text-slate-700 border border-[#e2e8f0] px-3 py-1 rounded-md whitespace-nowrap transition-colors text-[11px]"
            >
              💊 Respon Obat Mandiri
            </button>
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="bg-white px-4 py-3 flex items-center space-x-2 border-t border-[#e2e8f0] shrink-0"
          >
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-md transition-colors ${
                isRecording
                  ? "bg-[#ff4b4b] text-white animate-pulse"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Kirim pesan suara simulasi"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording
                  ? "Merekam suara keluhan pasien..."
                  : "Ketik keluhan atau jawab pertanyaan TanyaMed..."
              }
              disabled={isLoading}
              className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff4b4b] focus:border-[#ff4b4b]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-[#ff4b4b] hover:bg-[#e03a3a] disabled:opacity-40 text-white px-3.5 py-2 rounded-md transition-colors shadow-xs shadow-red-100 flex items-center justify-center font-medium text-xs"
              title="Kirim pesan"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Sidebar Info & 5-Elements Progress */}
        <div className="lg:col-span-4 space-y-4">
          {/* 5 Elements Checklist Card */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Aliran Ekstraksi
                </p>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>5 Elemen Pre-Anamnesis</span>
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Tier 2
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              TanyaMed menggali 5 aspek penting sebelum dokter memeriksa tatap muka agar waktu tunggu
              berkurang 65%:
            </p>

            <div className="space-y-2">
              {elements.map((el, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs border ${
                    el.done
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium"
                      : "bg-[#f8fafc] border-[#e2e8f0] text-slate-400"
                  }`}
                >
                  <span>{el.title}</span>
                  {el.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Menunggu info</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Reward Poin Sehat:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> +10 Poin SATUSEHAT
              </span>
            </div>
          </div>

          {/* AI Decision Reasoning Card */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
              Arsitektur Otonom
            </p>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" />
              <span>Logika AI & Tool Calling</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Model bahasa mengevaluasi makna bahasa bebas sehari-hari dan memanggil dua tools otonom:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-red-50/60 border border-red-200 rounded-lg text-red-950">
                <code className="font-bold text-[#ff4b4b]">rujuk_darurat()</code>
                <p className="text-[11px] text-red-900 mt-0.5">
                  Dipanggil seketika jika muncul nyeri dada hebat, sesak napas akut, atau tanda stroke.
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-950">
                <code className="font-bold text-emerald-700">catat_riwayat()</code>
                <p className="text-[11px] text-emerald-900 mt-0.5">
                  Dipanggil saat 5 elemen sudah terkumpul lengkap untuk disalurkan ke faskes.
                </p>
              </div>
            </div>
          </div>

          {/* IGD Quick Emergency Callout */}
          <div className="bg-white border border-red-200 rounded-xl p-5 text-slate-900 shadow-sm">
            <div className="flex items-center space-x-2 text-[#ff4b4b] font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Layanan Tanggap Darurat 119</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Jika mengalami kondisi tidak sadar, nyeri dada akut, atau napas tersengal, jangan menunda
              untuk mencari pertolongan medis langsung.
            </p>
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="w-full bg-[#ff4b4b] hover:bg-[#e03a3a] text-white font-medium py-2 rounded-md text-xs flex items-center justify-center space-x-1.5 shadow-xs shadow-red-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Hubungi Ambulans / IGD (119)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#e2e8f0]">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-[#ff4b4b] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-center text-base font-bold text-slate-900 mb-1">
              Protokol Kegawatdaruratan IGD 119
            </h3>
            <p className="text-center text-xs text-slate-500 mb-4">
              Puskesmas Wonorejo & RS Rujukan telah disiagakan dengan data keluhan Anda.
            </p>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3.5 text-xs text-slate-800 space-y-2 mb-4">
              <div className="font-semibold text-slate-900">Instruksi Medis Pertama:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Tetap tenang dan atur napas perlahan.</li>
                <li>Duduk atau setengah berbaring (posisi fowler), jangan berdiri tiba-tiba.</li>
                <li>Longgarkan pakaian di sekitar dada dan leher.</li>
                <li>Dampingi pasien dan hindari mengemudikan kendaraan sendiri ke faskes.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:119"
                className="bg-[#ff4b4b] hover:bg-[#e03a3a] text-white font-medium py-2 rounded-md text-xs flex items-center justify-center space-x-1 text-center shadow-xs shadow-red-100 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Panggil 119</span>
              </a>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-[#e2e8f0] font-medium py-2 rounded-md text-xs transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

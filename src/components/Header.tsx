import React from "react";
import {
  MessageSquare,
  Building2,
  ShieldCheck,
  Pill,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  points: number;
  badge: string;
  emergencyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  points,
  badge,
  emergencyCount,
}) => {
  const tabs = [
    {
      id: "whatsapp",
      label: "WhatsApp Pasien",
      icon: MessageSquare,
      badgeText: null,
    },
    {
      id: "faskes",
      label: "Puskesmas Wonorejo",
      icon: Building2,
      badgeText: emergencyCount > 0 ? `${emergencyCount} Siaga` : null,
      badgeColor: "bg-[#ff4b4b] text-white",
    },
    {
      id: "satusehat",
      label: "SATUSEHAT & Poin",
      icon: ShieldCheck,
      badgeText: `${points} Pts`,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "kepatuhan",
      label: "Kepatuhan Terapi",
      icon: Pill,
      badgeText: null,
    },
    {
      id: "filosofi",
      label: "Filosofi & AI",
      icon: BookOpen,
      badgeText: null,
    },
  ];

  return (
    <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#ff4b4b] rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs shadow-red-100">
              🩺
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">TanyaMed</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-[#e2e8f0]">
                  SATUSEHAT Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Layanan Percakapan Triase & Pre-Anamnesis WhatsApp
              </p>
            </div>
          </div>

          {/* Gamification summary pill & Server status */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-lg text-xs">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500 font-medium">Lencana:</span>
              <span className="font-semibold text-slate-800">{badge}</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{points} Poin</span>
              </div>
            </div>

            <div className="text-xs bg-[#f8fafc] text-slate-600 border border-[#e2e8f0] px-2.5 py-1.5 rounded-lg hidden lg:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-semibold text-slate-700">Puskesmas Live</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#f1f5f9] text-[#ff4b4b] border border-[#e2e8f0] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#ff4b4b]" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badgeText && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      tab.badgeColor || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

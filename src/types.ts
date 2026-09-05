export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
  type?: "normal" | "emergency" | "complete";
  extractedData?: any;
}

export interface TriageRecord {
  id: string;
  timestamp: string;
  type: "emergency" | "non_emergency";
  patientName: string;
  keluhan: string;
  lokasi: string;
  durasi: string;
  karakteristik: string;
  obatMandiri: string;
  status: string;
  alasan?: string;
  triageLevel: "merah" | "kuning" | "hijau";
  hash: string;
  doctorNotes?: string;
  verifiedByDoctor?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  taken: boolean;
  timeTaken?: string;
}

export interface VoucherItem {
  id: string;
  title: string;
  category: string;
  pointsCost: number;
  code: string;
  claimed: boolean;
  benefit: string;
}

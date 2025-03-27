export interface UserSession {
  id: number;
  nationalNumber: string;
  fullName: string;
  token: string;
  darkMode: boolean;
  language: 'en' | 'ar';
}

export type AlertType = "info" | "success" | "warning" | "error";

export interface ApplicationStatus {
  id: number;
  type: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  feedback?: string;
}

export interface DocQrCode {
  id: string;
  documentId: number;
  content: string;
  expiresAt: string;
}

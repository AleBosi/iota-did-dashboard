// Common interfaces for the dashboard application

export interface CreditHistoryItem {
  id: string;
  date: string;
  qty: number; // quantità (+/-)
  amount: number;
  type: "receive" | "send" | "spend" | "give" | "recharge";
  description: string;
  fromAzienda?: string;
  recipientId?: string;
  recipientName?: string;
  recipientType?: "operatore" | "macchinario";
  aziendaId?: string;
  aziendaName?: string;
}

export interface VCData {
  id: string;
  type: string;
  issuer: string;
  subject: any;
  value: any;
  issuanceDate: string;
  expirationDate?: string;
  status: "active" | "revoked" | "expired";
  proof?: any;
}

export interface EventData {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  createdBy: string;
  productId?: string;
  status: "active" | "resolved" | "archived";
  metadata?: any;
}

// Utility functions to convert between interfaces
export function convertCreditTransaction(transaction: any): CreditHistoryItem {
  return {
    id: transaction.id,
    date: transaction.date,
    qty: transaction.type === "receive" || transaction.type === "recharge" ? transaction.amount : -transaction.amount,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description,
    fromAzienda: transaction.fromAzienda,
    recipientId: transaction.recipientId,
    recipientName: transaction.recipientName,
    recipientType: transaction.recipientType,
    aziendaId: transaction.aziendaId,
    aziendaName: transaction.aziendaName
  };
}

export function convertVCToVCData(vc: any): VCData {
  return {
    id: vc.id,
    type: vc.type || "VerifiableCredential",
    issuer: vc.issuer,
    subject: vc.credentialSubject || vc.subject || {},
    value: vc.credentialSubject || vc.value || {},
    issuanceDate: vc.issuanceDate,
    expirationDate: vc.expirationDate,
    status: vc.status || "active",
    proof: vc.proof
  };
}


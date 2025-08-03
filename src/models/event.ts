export interface ProductEvent {
  eventId: string;
  productDid: string;
  operatorDid: string;
  eventType: string;
  date: string;
  details?: string;
  vcId?: string; // id della VC che attesta l'evento
}

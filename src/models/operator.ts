export interface Operator {
  operatorId: string;
  name: string;
  did: string;
  role?: string;
  assignedProducts?: string[]; // lista productId
}

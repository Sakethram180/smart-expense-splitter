export type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export type ClientUser = {
  id: string;
  name: string;
  email: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
};

export type GroupSummary = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  expenseCount: number;
  totalSpent: number;
  createdAt: string;
};

export type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  paidBy: Member;
  participants: Member[];
  date: string;
  createdAt: string;
};

export type SettlementTransfer = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
};

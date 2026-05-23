import { calculateSettlements } from "@/lib/settlement";

type PopulatedUser = {
  _id: string;
  name: string;
  email: string;
};

type PopulatedExpense = {
  _id: string;
  title: string;
  amount: number;
  paidBy: PopulatedUser;
  participants: PopulatedUser[];
  date: Date;
  createdAt: Date;
};

type PopulatedGroup = {
  _id: string;
  name: string;
  description?: string;
  members: PopulatedUser[];
  createdAt: Date;
};

export function serializeGroupSummary(group: PopulatedGroup, expenseCount: number, totalSpent: number) {
  return {
    id: String(group._id),
    name: group.name,
    description: group.description ?? "",
    memberCount: group.members.length,
    expenseCount,
    totalSpent,
    createdAt: group.createdAt.toISOString()
  };
}

export function serializeExpense(expense: PopulatedExpense) {
  return {
    id: String(expense._id),
    title: expense.title,
    amount: expense.amount,
    paidBy: {
      id: String(expense.paidBy._id),
      name: expense.paidBy.name,
      email: expense.paidBy.email
    },
    participants: expense.participants.map((participant) => ({
      id: String(participant._id),
      name: participant.name,
      email: participant.email
    })),
    date: expense.date.toISOString(),
    createdAt: expense.createdAt.toISOString()
  };
}

export function serializeGroupDetail(group: PopulatedGroup, expenses: PopulatedExpense[]) {
  const members = group.members.map((member) => ({
    id: String(member._id),
    name: member.name,
    email: member.email
  }));

  const normalizedExpenses = expenses.map(serializeExpense);
  const settlements = calculateSettlements(
    members,
    normalizedExpenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      paidById: expense.paidBy.id,
      paidByName: expense.paidBy.name,
      participantIds: expense.participants.map((participant) => participant.id)
    }))
  );

  return {
    id: String(group._id),
    name: group.name,
    description: group.description ?? "",
    members,
    expenses: normalizedExpenses,
    settlements
  };
}

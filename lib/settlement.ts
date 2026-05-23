export type SettlementExpense = {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  paidByName: string;
  participantIds: string[];
};

export type SettlementMember = {
  id: string;
  name: string;
};

export type SettlementTransfer = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
};

export function calculateSettlements(members: SettlementMember[], expenses: SettlementExpense[]) {
  const balances = new Map<string, number>();

  members.forEach((member) => balances.set(member.id, 0));

  expenses.forEach((expense) => {
    const split = expense.amount / Math.max(expense.participantIds.length, 1);

    balances.set(expense.paidById, (balances.get(expense.paidById) ?? 0) + expense.amount);

    expense.participantIds.forEach((participantId) => {
      balances.set(participantId, (balances.get(participantId) ?? 0) - split);
    });
  });

  const creditors = members
    .map((member) => ({
      ...member,
      balance: Number((balances.get(member.id) ?? 0).toFixed(2))
    }))
    .filter((member) => member.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);

  const debtors = members
    .map((member) => ({
      ...member,
      balance: Number((balances.get(member.id) ?? 0).toFixed(2))
    }))
    .filter((member) => member.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  const transfers: SettlementTransfer[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    transfers.push({
      fromId: debtor.id,
      fromName: debtor.name,
      toId: creditor.id,
      toName: creditor.name,
      amount: Number(amount.toFixed(2))
    });

    creditor.balance = Number((creditor.balance - amount).toFixed(2));
    debtor.balance = Number((debtor.balance + amount).toFixed(2));

    if (creditor.balance <= 0.01) {
      creditorIndex += 1;
    }

    if (debtor.balance >= -0.01) {
      debtorIndex += 1;
    }
  }

  const balancesSummary = members.map((member) => ({
    ...member,
    balance: Number((balances.get(member.id) ?? 0).toFixed(2))
  }));

  return {
    balances: balancesSummary,
    transfers
  };
}

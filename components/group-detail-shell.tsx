"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { ApiEnvelope, ClientUser, ExpenseItem, Member, SettlementTransfer } from "@/lib/types";

type GroupDetail = {
  id: string;
  name: string;
  description: string;
  members: Member[];
  expenses: ExpenseItem[];
  settlements: {
    balances: Array<Member & { balance: number }>;
    transfers: SettlementTransfer[];
  };
};

type GroupDetailShellProps = {
  groupId: string;
  user: ClientUser;
};

export function GroupDetailShell({ groupId, user }: GroupDetailShellProps) {
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [expenseState, setExpenseState] = useState({
    title: "",
    amount: "",
    paidBy: "",
    participants: [] as string[],
    date: new Date().toISOString().slice(0, 10)
  });
  const [expenseError, setExpenseError] = useState("");
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const loadGroup = useCallback(async () => {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/groups/${groupId}`, {
      cache: "no-store"
    });
    const result: ApiEnvelope<GroupDetail> = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Unable to load group.");
      setLoading(false);
      return;
    }

    const nextDetail = result.data ?? null;
    setDetail(nextDetail);

    if (nextDetail && nextDetail.members.length && !expenseState.paidBy) {
      const currentMember = nextDetail.members.find((member) => member.id === user.id);
      setExpenseState((current) => ({
        ...current,
        paidBy: currentMember?.id ?? nextDetail.members[0].id,
        participants: nextDetail.members.map((member) => member.id)
      }));
    }

    setLoading(false);
  }, [expenseState.paidBy, groupId, user.id]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const dedupedExpenses = useMemo(() => {
    const expenses = detail?.expenses ?? [];
    return expenses.filter((expense, index, self) => self.findIndex((item) => item.id === expense.id) === index);
  }, [detail]);

  const filteredExpenses = useMemo(() => {
    return dedupedExpenses
      .filter((expense) => expense.title.toLowerCase().includes(query.toLowerCase()))
      .filter((expense) => {
        if (memberFilter === "all") {
          return true;
        }

        return (
          expense.paidBy.id === memberFilter ||
          expense.participants.some((participant) => participant.id === memberFilter)
        );
      })
      .sort((a, b) => {
        const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === "newest" ? -comparison : comparison;
      });
  }, [dedupedExpenses, memberFilter, query, sortOrder]);

  const settlementSummary = useMemo(() => detail?.settlements.transfers ?? [], [detail]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingInvite(true);
    setInviteStatus("");

    const response = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: inviteEmail })
    });

    const result = await response.json();

    if (!response.ok) {
      setInviteStatus(result.error ?? "Unable to invite member.");
      setSubmittingInvite(false);
      return;
    }

    setInviteEmail("");
    setSubmittingInvite(false);
    setInviteStatus("Member added.");
    await loadGroup();
  }

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingExpense(true);
    setExpenseError("");

    const response = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...expenseState,
        amount: Number(expenseState.amount)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setExpenseError(result.error ?? "Unable to add expense.");
      setSubmittingExpense(false);
      return;
    }

    setExpenseState((current) => ({
      ...current,
      title: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10)
    }));
    setSubmittingExpense(false);
    await loadGroup();
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="panel h-32 animate-pulse p-6" />
        ))}
      </div>
    );
  }

  if (error || !detail) {
    return (
      <section className="panel p-8">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-500">
          Back to dashboard
        </Link>
        <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-6">
          <p className="text-lg font-bold text-red-800">{error || "Group not found."}</p>
          <button className="button-primary mt-4" onClick={() => void loadGroup()}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <main className="grid gap-6">
      <section className="glass-panel relative overflow-hidden p-6 sm:p-8">
        <div className="hero-orb left-[-2rem] top-[-2rem] h-32 w-32 bg-orange-200" />
        <Link href="/dashboard" className="text-sm font-semibold text-slate-500">
          Back to dashboard
        </Link>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="badge">Active group</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{detail.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              {detail.description || "Add expenses, invite members, and keep the balances honest."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat label="Members" value={String(detail.members.length)} />
            <MiniStat label="Expenses" value={String(dedupedExpenses.length)} />
            <MiniStat
              label="Total spent"
              value={`Rs ${dedupedExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(0)}`}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Members</h2>
                <p className="mt-1 text-sm text-slate-500">Invite registered users by email.</p>
              </div>
              <span className="badge">{detail.members.length} total</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {detail.members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))] px-4 py-3"
                >
                  <p className="font-semibold text-slate-800">
                    {member.name}
                    {member.id === user.id ? " (You)" : ""}
                  </p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              ))}
            </div>

            <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleInvite}>
              <input
                className="input"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="friend@example.com"
                required
              />
              <button className="button-primary sm:min-w-40" type="submit" disabled={submittingInvite}>
                {submittingInvite ? "Adding..." : "Invite member"}
              </button>
            </form>

            {inviteStatus ? (
              <p
                className={`mt-3 text-sm ${
                  inviteStatus === "Member added." ? "text-ocean" : "text-red-700"
                }`}
              >
                {inviteStatus}
              </p>
            ) : null}
          </div>

          <div className="panel p-6">
            <div>
              <h2 className="text-xl font-bold">Add expense</h2>
              <p className="mt-1 text-sm text-slate-500">
                Record what was paid, who paid it, and who should share the split.
              </p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleExpenseSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Expense title</span>
                <input
                  className="input"
                  value={expenseState.title}
                  onChange={(event) =>
                    setExpenseState((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Dinner"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Amount</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseState.amount}
                    onChange={(event) =>
                      setExpenseState((current) => ({ ...current, amount: event.target.value }))
                    }
                    placeholder="2500"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Date</span>
                  <input
                    className="input"
                    type="date"
                    value={expenseState.date}
                    onChange={(event) =>
                      setExpenseState((current) => ({ ...current, date: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Paid by</span>
                <select
                  className="input"
                  value={expenseState.paidBy}
                  onChange={(event) =>
                    setExpenseState((current) => ({ ...current, paidBy: event.target.value }))
                  }
                >
                  {detail.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-700">Participants</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {detail.members.map((member) => {
                    const checked = expenseState.participants.includes(member.id);

                    return (
                      <label
                        key={member.id}
                        className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white/90 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">{member.name}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setExpenseState((current) => ({
                              ...current,
                              participants: event.target.checked
                                ? [...current.participants, member.id]
                                : current.participants.filter((participantId) => participantId !== member.id)
                            }));
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {expenseError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {expenseError}
                </div>
              ) : null}

              <button className="button-primary" type="submit" disabled={submittingExpense}>
                {submittingExpense ? "Saving..." : "Add expense"}
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Settlement summary</h2>
                <p className="mt-1 text-sm text-slate-500">Calculated dynamically from the current expenses.</p>
              </div>
              <button className="button-secondary" onClick={() => void loadGroup()}>
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {settlementSummary.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-500">
                  No one owes anything yet. Add expenses to generate balances.
                </div>
              ) : (
                settlementSummary.map((transfer) => (
                  <div
                    key={`${transfer.fromId}-${transfer.toId}-${transfer.amount}`}
                    className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-4 py-4"
                  >
                    <p className="font-semibold text-slate-800">
                      {transfer.fromName} owes {transfer.toName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Rs {transfer.amount.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Expenses</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search by title, filter by member, and sort by date.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search expenses"
                />
                <select
                  className="input"
                  value={memberFilter}
                  onChange={(event) => setMemberFilter(event.target.value)}
                >
                  <option value="all">All members</option>
                  {detail.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <select
                  className="input"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">No matching expenses</p>
                <p className="mt-2 text-sm text-slate-500">
                  Try adjusting the filters or add a new expense.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.84))] p-5 shadow-[0_12px_28px_rgba(19,34,56,0.04)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-ink">{expense.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          Paid by {expense.paidBy.name} on{" "}
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <span className="badge">Rs {expense.amount.toFixed(2)}</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">
                      Split among {expense.participants.map((participant) => participant.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-chip">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-ink">{value}</p>
    </div>
  );
}

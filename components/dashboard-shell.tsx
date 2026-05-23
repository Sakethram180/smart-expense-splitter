"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ApiEnvelope, ClientUser, GroupSummary } from "@/lib/types";

type DashboardShellProps = {
  user: ClientUser;
};

export function DashboardShell({ user }: DashboardShellProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const dedupedGroups = useMemo(
    () => groups.filter((group, index, self) => self.findIndex((item) => item.id === group.id) === index),
    [groups]
  );

  async function loadGroups() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/groups", {
      cache: "no-store"
    });

    const result: ApiEnvelope<GroupSummary[]> = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Unable to load your groups.");
      setLoading(false);
      return;
    }

    setGroups(result.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadGroups();
  }, []);

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError("");

    const response = await fetch("/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, description })
    });

    const result: ApiEnvelope<GroupSummary> = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Unable to create group.");
      setCreating(false);
      return;
    }

    setName("");
    setDescription("");
    setCreating(false);
    await loadGroups();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-panel relative overflow-hidden p-6 sm:p-8">
        <div className="hero-orb right-[-2rem] top-[-2rem] h-32 w-32 bg-orange-200" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="badge">Workspace overview</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{user.name}</h1>
            <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
              Your shared spending command center for trips, homes, and team outings.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{user.email}</p>
          </div>
          <button className="button-secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Groups" value={String(dedupedGroups.length)} />
          <StatCard
            label="Tracked spend"
            value={`Rs ${dedupedGroups.reduce((sum, group) => sum + group.totalSpent, 0).toFixed(0)}`}
          />
          <StatCard
            label="Expenses"
            value={String(dedupedGroups.reduce((sum, group) => sum + group.expenseCount, 0))}
          />
        </div>

        <form className="mt-8 rounded-[30px] border border-white/55 bg-white/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" onSubmit={handleCreateGroup}>
          <div>
            <h2 className="text-xl font-bold text-ink">Create a polished new group</h2>
            <p className="mt-1 text-sm text-slate-500">
              Start a trip, a house budget, or a running team tab.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Group name</span>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Trip to Goa"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              className="input min-h-28 resize-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="3 nights, transport, meals, and stay"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button className="button-primary" type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create group"}
          </button>
        </form>
      </section>

      <section className="panel p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Your groups</h2>
            <p className="mt-2 text-sm text-slate-500">
              Organized cards, resilient states, and instant access to active ledgers.
            </p>
          </div>
          <button className="button-secondary" onClick={() => void loadGroups()}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-56 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">{error}</p>
            <button className="button-primary mt-4" onClick={() => void loadGroups()}>
              Try again
            </button>
          </div>
        ) : dedupedGroups.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">No groups yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Create your first group and start adding expenses.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {dedupedGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.82))] p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_38px_rgba(19,34,56,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-ink transition group-hover:text-slate-900">
                      {group.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {group.description || "No description added yet."}
                    </p>
                  </div>
                  <span className="badge">{group.memberCount} members</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Rs {group.totalSpent.toFixed(0)} spent</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{group.expenseCount} expenses</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-chip">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

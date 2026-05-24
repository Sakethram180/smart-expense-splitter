import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoMark } from "@/components/logo-mark";
import { getSessionUser } from "@/lib/auth";

const highlights = [
  "Trip budgets that stay organized from the first cab ride to the final checkout.",
  "Roommate bills with clear balances and zero awkward follow-ups.",
  "Team dinners and events with instant settlement clarity."
];

const stats = [
  { label: "Shared bills handled", value: "Rs 8.4L+" },
  { label: "Avg. settle-up clarity", value: "99.2%" },
  { label: "Groups kept in sync", value: "2.1k+" }
];

export default async function HomePage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid gap-6">
      <section className="glass-panel relative overflow-hidden px-7 py-10 sm:px-10 sm:py-12">
        <div className="hero-orb left-[-4rem] top-[-3rem] h-44 w-44 bg-orange-300" />
        <div className="hero-orb bottom-[-3rem] right-[12%] h-40 w-40 bg-teal-300" />
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="relative z-10 max-w-3xl animate-rise">
            <span className="badge mb-5">Built for trips, roommates, and modern group spending</span>
            <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] text-ink sm:text-6xl lg:text-7xl">
              Shared expense tracking that feels premium from the first payment to the final settle-up.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Create beautifully organized groups, record who paid, split with precision, and
              instantly surface who owes whom without spreadsheet chaos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="button-primary">
                Launch your first group
              </Link>
              <Link href="/login" className="button-secondary">
                Sign in
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="metric-chip">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-ink">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 animate-rise [animation-delay:120ms]">
            <div className="grid-sheen overflow-hidden rounded-[36px] border border-white/50 bg-[linear-gradient(160deg,#142438,#1f3551_55%,#0f766e)] p-6 text-black shadow-[0_28px_70px_rgba(19,34,56,0.25)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <LogoMark compact className="text-white" />
                <span className="rounded-full border border-white/20 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black">
                  Live ledger
                </span>
              </div>
              <div className="mt-8 rounded-[28px] border border-white/20 bg-white/85 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-700">Active group</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black">Goa Escape 2026</p>
                    <p className="mt-1 text-sm text-slate-700">4 members | 11 expenses</p>
                  </div>
                  <p className="text-right text-sm text-slate-700">
                    Total tracked
                    <span className="mt-1 block text-2xl font-black text-black">Rs 28,640</span>
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[26px] bg-white px-5 py-4 text-ink">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Settlement snapshot
                  </p>
                  <p className="mt-2 text-lg font-black">John owes Alex Rs 625</p>
                  <p className="mt-1 text-sm text-slate-500">Sam and David mirror the same split.</p>
                </div>
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-white/20 bg-white/85 px-4 py-4 text-sm leading-6 text-black"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white/85 px-4 py-4 text-black">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-700">Fastest action</p>
                  <p className="mt-2 text-lg font-bold">Create group in under 30 seconds</p>
                </div>
                <div className="rounded-[24px] bg-white/85 px-4 py-4 text-black">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-700">Confidence layer</p>
                  <p className="mt-2 text-lg font-bold">Retry, dedupe, and resilient states built in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-6">
          <p className="badge">Track</p>
          <h2 className="mt-4 section-title">Precision entries</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Add payer, amount, date, and participants with a flow designed to feel fast and obvious.
          </p>
        </div>
        <div className="panel p-6">
          <p className="badge">Understand</p>
          <h2 className="mt-4 section-title">Settlement clarity</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Dynamic summaries turn raw expenses into clean, customer-friendly settlement outcomes.
          </p>
        </div>
        <div className="panel p-6">
          <p className="badge">Scale</p>
          <h2 className="mt-4 section-title">Resilient by default</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Slow responses, duplicates, empty states, and request failures are handled without breaking trust.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { LogoMark } from "@/components/logo-mark";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(isRegister ? { name, email, password } : { email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="glass-panel grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#132238,#1f3551_58%,#0f766e)] p-8 text-white lg:block">
        <div className="hero-orb left-[-2rem] top-[-2rem] h-32 w-32 bg-orange-300" />
        <div className="hero-orb bottom-[-2rem] right-[-1rem] h-28 w-28 bg-teal-300" />
        <LogoMark compact />
        <span className="mt-8 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
          {isRegister ? "Create account" : "Welcome back"}
        </span>
        <h2 className="mt-5 text-4xl font-black tracking-[-0.04em]">
          {isRegister ? "Own every shared rupee with confidence." : "Step back into your active groups."}
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-7 text-white/72">
          SplitSmart gives shared spending a cleaner interface, sharper summaries, and less friction
          when it is time to settle.
        </p>
        <div className="mt-8 space-y-3">
          {["Fast group creation", "Auto settlement logic", "Resilient shared-expense workflows"].map(
            (item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-3 text-sm"
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>

      <div className="p-8 sm:p-10">
        <span className="badge">{isRegister ? "New account" : "Sign in"}</span>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-ink sm:text-4xl">
          {isRegister ? "Start splitting smarter" : "Log in to your groups"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {isRegister
            ? "Create your account to start tracking shared expenses."
            : "Use your account to manage groups, expenses, and settlements."}
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <input
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Johnson"
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alex@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button className="button-primary w-full" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-ink underline decoration-accent underline-offset-4"
          >
            {isRegister ? "Log in" : "Register"}
          </Link>
        </p>
      </div>
    </section>
  );
}

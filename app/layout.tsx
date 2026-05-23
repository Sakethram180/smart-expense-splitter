import type { Metadata } from "next";
import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";

import "./globals.css";

export const metadata: Metadata = {
  title: "SplitSmart",
  description: "Track group expenses and settle up without the spreadsheet headache."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="glass-panel flex flex-col gap-5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <Link href="/">
                <LogoMark />
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="badge">Realtime settlements</span>
                <span className="badge">Group ledgers</span>
                <span className="badge">Smart split tracking</span>
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

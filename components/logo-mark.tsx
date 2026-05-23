type LogoMarkProps = {
  className?: string;
  compact?: boolean;
};

export function LogoMark({ className, compact = false }: LogoMarkProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,#132238,#274161_65%,#0f766e)] shadow-[0_16px_40px_rgba(19,34,56,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(255,255,255,0.35),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.7),transparent_24%)]" />
        <svg viewBox="0 0 64 64" className="relative h-9 w-9 text-white" aria-hidden="true">
          <path
            d="M16 18c0-3.314 2.686-6 6-6h10c7.18 0 13 5.82 13 13v1h3c3.866 0 7 3.134 7 7v9c0 5.523-4.477 10-10 10H32c-10.493 0-19-8.507-19-19v-15Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M27 25h16c2.761 0 5 2.239 5 5v1H32c-2.761 0-5-2.239-5-5v-1Z"
            fill="#fb923c"
          />
          <circle cx="24" cy="41" r="5" fill="#fff9ef" />
          <circle cx="42" cy="41" r="5" fill="#0f766e" />
        </svg>
      </div>
      {compact ? null : (
        <div>
          <p className="text-lg font-black tracking-tight text-ink">SplitSmart</p>
          <p className="text-sm text-slate-500">Shared money, sharp settlements</p>
        </div>
      )}
    </div>
  );
}

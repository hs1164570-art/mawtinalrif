export default function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      role="separator"
      className="flex items-center justify-center gap-4 py-6 px-6 max-w-7xl mx-auto"
    >
      {/* Left line */}
      <div className="flex-1 flex items-center gap-1.5">
        <div className="flex-1 h-px bg-[var(--border-md)]" />
        <div className="w-1 h-1 rotate-45 bg-[var(--border-strong)] shrink-0" />
        <div className="w-px h-3 bg-[var(--border-md)]" />
        <div className="w-1 h-1 rotate-45 bg-[var(--border-md)] shrink-0" />
      </div>

      {/* Center ornament */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[var(--border-strong)] text-[8px]">◆</span>
        <span className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase">
          ◆
        </span>
        <span className="text-[var(--gold-mid)] text-xs font-black tracking-[0.2em]">
          مواطن الريف
        </span>
        <span className="text-[var(--gold)] text-[10px] font-black tracking-[0.3em] uppercase">
          ◆
        </span>
        <span className="text-[var(--border-strong)] text-[8px]">◆</span>
      </div>

      {/* Right line */}
      <div className="flex-1 flex items-center gap-1.5 flex-row-reverse">
        <div className="flex-1 h-px bg-[var(--border-md)]" />
        <div className="w-1 h-1 rotate-45 bg-[var(--border-strong)] shrink-0" />
        <div className="w-px h-3 bg-[var(--border-md)]" />
        <div className="w-1 h-1 rotate-45 bg-[var(--border-md)] shrink-0" />
      </div>
    </div>
  )
}

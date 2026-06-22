// components/analytics/PageHeader.tsx
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-text-1">{title}</h1>
        <p className="text-sm text-text-3 mt-1">{subtitle}</p>
      </div>
      {actions}
    </header>
  );
}

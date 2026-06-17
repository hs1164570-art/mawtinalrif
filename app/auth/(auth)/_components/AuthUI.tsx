"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

/* ─── Input ─────────────────────────────────────────────────── */
interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, id, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-amber-900">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "w-full px-4 py-3 rounded-lg border bg-white/80 text-stone-900 text-sm",
          "placeholder:text-stone-400 transition-all duration-200 outline-none",
          error
            ? "border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/10"
            : "border-amber-900/[0.18] focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10",
          className ?? "",
        ].join(" ")}
      />
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-600 mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  )
);
AuthInput.displayName = "AuthInput";

/* ─── Submit Button ──────────────────────────────────────────── */
interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export function SubmitButton({ children, loading }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="
        w-full py-3 px-6 rounded-lg font-medium text-sm text-white
        bg-gradient-to-l from-amber-800 to-amber-600
        hover:from-amber-700 hover:to-yellow-600
        shadow-[0_4px_16px_rgba(146,64,14,0.30)]
        hover:shadow-[0_6px_24px_rgba(146,64,14,0.44)]
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-300
        flex items-center justify-center gap-2
      "
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

/* ─── Google Button ──────────────────────────────────────────── */
export function GoogleButton({ callbackUrl = "/" }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="
        w-full py-3 px-6 rounded-lg border border-amber-900/20
        bg-white text-amber-900 text-sm font-medium
        flex items-center justify-center gap-3
        hover:bg-amber-50 hover:border-amber-900/35
        transition-all duration-200
      "
    >
      <FcGoogle size={18} aria-hidden="true" />
      المتابعة بحساب Google
    </button>
  );
}

/* ─── Divider ────────────────────────────────────────────────── */
export function AuthDivider({ label = "أو" }: { label?: string }) {
  return (
    <div className="relative flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-amber-900/10" />
      <span className="text-xs text-stone-400 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-amber-900/10" />
    </div>
  );
}

/* ─── Form Heading ───────────────────────────────────────────── */
export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold text-stone-900 leading-tight font-[family-name:var(--font-cormorant)]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-stone-500 mt-2 leading-relaxed">{subtitle}</p>
      )}
      <div className="w-8 h-[2px] bg-gradient-to-l from-amber-800 to-yellow-500 mt-3 rounded-full" />
    </div>
  );
}

/* ─── Alert Banner ───────────────────────────────────────────── */
export function AuthAlert({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      role="alert"
      className={[
        "w-full px-4 py-3 rounded-lg text-sm flex items-start gap-2",
        type === "success"
          ? "bg-amber-50 border border-amber-700/20 text-amber-800"
          : "bg-red-50 border border-red-200 text-red-700",
      ].join(" ")}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {type === "success" ? "✓" : "✕"}
      </span>
      {message}
    </div>
  );
}

import type { ReactNode } from "react";

type FormAlertProps = {
  tone: "error" | "success" | "warning";
  children: ReactNode;
};

const toneStyles = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-gold-300 bg-gold-50 text-gold-700",
} as const;

export function FormAlert({ tone, children }: FormAlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${toneStyles[tone]}`}
    >
      {children}
    </p>
  );
}

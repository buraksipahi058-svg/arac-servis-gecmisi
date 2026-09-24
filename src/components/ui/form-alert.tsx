import type { ReactNode } from "react";

type FormAlertProps = {
  tone: "error" | "success" | "warning";
  children: ReactNode;
};

const toneStyles = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
} as const;

export function FormAlert({ tone, children }: FormAlertProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2.5 text-sm ${toneStyles[tone]}`}
    >
      {children}
    </p>
  );
}

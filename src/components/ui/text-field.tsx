import type { ComponentProps } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "name"> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, name, hint, error, id, ...inputProps }: TextFieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink-800">
        {label}
      </label>
      {/* text-base (16px): iOS'ta odaklanınca otomatik yakınlaştırmayı önler. */}
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-12 rounded-xl border bg-white shadow-sm transition-colors px-3 text-base text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "border-sand-300 focus:border-ink-700 focus:ring-gold-400/30"
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
}

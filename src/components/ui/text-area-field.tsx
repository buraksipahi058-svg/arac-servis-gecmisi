import type { ComponentProps } from "react";

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "name"> & {
  label: string;
  name: string;
  error?: string;
};

export function TextAreaField({ label, name, error, id, ...textAreaProps }: TextAreaFieldProps) {
  const fieldId = id ?? name;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink-800">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`min-h-28 rounded-xl border bg-white shadow-sm transition-colors px-3 py-2.5 text-base text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "border-sand-300 focus:border-ink-700 focus:ring-gold-400/30"
        }`}
        {...textAreaProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

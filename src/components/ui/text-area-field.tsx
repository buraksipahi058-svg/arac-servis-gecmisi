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
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-800">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`min-h-28 rounded-lg border bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "border-gray-300 focus:border-gray-900 focus:ring-gray-900/10"
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

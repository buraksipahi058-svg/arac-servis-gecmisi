"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonStyles, type ButtonVariant } from "./button-styles";

type SubmitButtonProps = {
  children: ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
  className?: string;
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${buttonStyles[variant]} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

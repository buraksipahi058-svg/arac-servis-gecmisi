import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { cardClass } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 flex justify-center">
        <Brand />
      </div>
      <div className={`${cardClass} p-6 sm:p-8`}>{children}</div>
    </main>
  );
}

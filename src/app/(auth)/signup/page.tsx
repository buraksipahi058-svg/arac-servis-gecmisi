import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Kayıt ol" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Kayıt ol</h1>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-ink-600">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-semibold text-ink-900 underline decoration-gold-400 decoration-2 underline-offset-4">
          Giriş yap
        </Link>
      </p>
    </>
  );
}

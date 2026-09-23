import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Kayıt ol" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Kayıt ol</h1>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline">
          Giriş yap
        </Link>
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { safeNextPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş yap" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Giriş yap</h1>
      <LoginForm nextPath={safeNextPath(next)} />
      <p className="mt-6 text-center text-sm text-gray-600">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium text-gray-900 underline">
          Kayıt ol
        </Link>
      </p>
    </>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Benim Araçlarım" };

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Benim Araçlarım</h1>
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center">
        <p className="text-gray-600">Henüz araç eklenmemiş.</p>
      </div>
    </>
  );
}

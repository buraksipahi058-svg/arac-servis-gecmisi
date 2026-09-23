import type { Metadata } from "next";
import Link from "next/link";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { createVehicle } from "../actions";

export const metadata: Metadata = { title: "Araç ekle" };

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-sm">
      <Link href="/dashboard" className="text-sm text-gray-500">
        ← Araçlarım
      </Link>
      <h1 className="mb-6 mt-3 text-xl font-semibold">Araç ekle</h1>
      <VehicleForm action={createVehicle} submitLabel="Kaydet" pendingText="Kaydediliyor…" />
    </div>
  );
}

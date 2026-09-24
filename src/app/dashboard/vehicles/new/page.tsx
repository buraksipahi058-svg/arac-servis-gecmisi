import type { Metadata } from "next";
import { BackLink } from "@/components/ui/back-link";
import { cardClass } from "@/components/ui/card";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { createVehicle } from "../actions";

export const metadata: Metadata = { title: "Araç ekle" };

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-lg">
      <BackLink href="/dashboard">Araçlarım</BackLink>
      <h1 className="mb-5 mt-4 text-2xl font-bold tracking-tight">Araç ekle</h1>
      <div className={`${cardClass} p-5 sm:p-6`}>
        <VehicleForm action={createVehicle} submitLabel="Kaydet" pendingText="Kaydediliyor…" />
      </div>
    </div>
  );
}

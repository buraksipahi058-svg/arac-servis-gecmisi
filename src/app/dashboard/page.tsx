import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button-styles";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { listOwnVehicles } from "@/lib/vehicles/queries";

export const metadata: Metadata = { title: "Benim Araçlarım" };

export default async function DashboardPage() {
  const vehicles = await listOwnVehicles();

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Benim Araçlarım</h1>
        <Link href="/dashboard/vehicles/new" className={buttonClass("primary", "sm")}>
          + Araç Ekle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center">
          <p className="text-gray-600">Henüz araç eklenmemiş.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

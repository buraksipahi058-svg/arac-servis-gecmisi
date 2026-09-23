import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/ui/button-styles";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]">): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  return { title: vehicle ? formatPlate(vehicle.plate) : "Araç bulunamadı" };
}

export default async function VehiclePage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  return (
    <>
      <Link href="/dashboard" className="text-sm text-gray-500">
        ← Araçlarım
      </Link>

      <section className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-wide">{formatPlate(vehicle.plate)}</h1>
            <p className="mt-0.5 text-gray-600">
              {`${vehicle.make} ${vehicle.model} ${vehicle.model_year}`}
            </p>
          </div>
          <Link
            href={`/dashboard/vehicles/${vehicle.id}/edit`}
            className={`${buttonStyles.secondary} h-9 shrink-0 px-3 text-sm`}
          >
            Düzenle
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Servis Geçmişi</h2>
        <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center">
          <p className="text-gray-600">Henüz servis kaydı yok.</p>
        </div>
      </section>
    </>
  );
}

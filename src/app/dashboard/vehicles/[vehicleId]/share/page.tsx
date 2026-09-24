import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateShareCode } from "@/components/share/create-share-code";
import { ShareTokenList } from "@/components/share/share-token-list";
import { listShareTokens } from "@/lib/share/queries";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { createShareCode } from "./actions";

export const metadata: Metadata = { title: "Geçmişi paylaş" };

export default async function ShareVehiclePage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/share">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  const tokens = await listShareTokens(vehicle.id);

  return (
    <div className="mx-auto max-w-sm">
      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="text-sm text-gray-500">
        ← {formatPlate(vehicle.plate)}
      </Link>
      <h1 className="mb-3 mt-3 text-xl font-semibold">Geçmişi paylaş</h1>

      <ul className="mb-6 flex flex-col gap-1.5 text-sm text-gray-600">
        <li>
          Paylaşım kodu, plaka ile birlikte girildiğinde bu aracın servis geçmişini 24 saat
          boyunca gösterir.
        </li>
        <li>E-posta adresin, telefonun ve diğer araçların gösterilmez.</li>
        <li>Kodu istediğin zaman iptal edebilirsin.</li>
      </ul>

      <CreateShareCode action={createShareCode.bind(null, vehicle.id)} />

      <section className="mt-10">
        <h2 className="text-base font-semibold">Paylaşım kodları</h2>
        <p className="mb-3 mt-1 text-xs text-gray-500">
          Kodlar yalnızca oluşturuldukları anda gösterilir; burada tarihleri ve durumları yer alır.
        </p>
        <ShareTokenList vehicleId={vehicle.id} tokens={tokens} />
      </section>
    </div>
  );
}

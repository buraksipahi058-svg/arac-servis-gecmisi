import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ban, Clock, EyeOff, Link2 } from "lucide-react";
import { CreateShareCode } from "@/components/share/create-share-code";
import { ShareTokenList } from "@/components/share/share-token-list";
import { BackLink } from "@/components/ui/back-link";
import { cardClass } from "@/components/ui/card";
import { getRequestOrigin } from "@/lib/request-origin";
import { listShareTokens } from "@/lib/share/queries";
import { formatPlate } from "@/lib/vehicles/plate";
import { getOwnVehicle } from "@/lib/vehicles/queries";
import { createShareCode } from "./actions";

export const metadata: Metadata = { title: "Geçmişi paylaş" };

const INFO_ITEM = "flex items-start gap-2.5";
const INFO_ICON = "mt-0.5 size-4 shrink-0 text-gold-600";

export default async function ShareVehiclePage({
  params,
}: PageProps<"/dashboard/vehicles/[vehicleId]/share">) {
  const { vehicleId } = await params;
  const vehicle = await getOwnVehicle(vehicleId);
  if (!vehicle) notFound();

  const [tokens, origin] = await Promise.all([listShareTokens(vehicle.id), getRequestOrigin()]);
  const sharedUrl = `${origin}/shared`;

  return (
    <div className="mx-auto max-w-lg">
      <BackLink href={`/dashboard/vehicles/${vehicle.id}`}>{formatPlate(vehicle.plate)}</BackLink>
      <h1 className="mb-4 mt-4 text-2xl font-bold tracking-tight">Geçmişi paylaş</h1>

      <ul className={`${cardClass} mb-6 flex flex-col gap-2.5 p-5 text-sm text-ink-700`}>
        <li className={INFO_ITEM}>
          <Clock aria-hidden className={INFO_ICON} />
          Paylaşım kodu, plaka ile birlikte girildiğinde bu aracın servis geçmişini 24 saat
          boyunca gösterir.
        </li>
        <li className={INFO_ITEM}>
          <EyeOff aria-hidden className={INFO_ICON} />
          E-posta adresin, telefonun ve diğer araçların gösterilmez.
        </li>
        <li className={INFO_ITEM}>
          <Link2 aria-hidden className={INFO_ICON} />
          <span>
            {"Alıcı, geçmişi "}
            <span className="font-mono text-[0.8rem] font-semibold text-ink-900 [overflow-wrap:anywhere]">{sharedUrl}</span>
            {" adresinden görüntüler."}
          </span>
        </li>
        <li className={INFO_ITEM}>
          <Ban aria-hidden className={INFO_ICON} />
          Kodu istediğin zaman iptal edebilirsin.
        </li>
      </ul>

      <CreateShareCode action={createShareCode.bind(null, vehicle.id)} sharedUrl={sharedUrl} />

      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight">Paylaşım kodları</h2>
        <p className="mb-3 mt-1 text-xs text-ink-500">
          Kodlar yalnızca oluşturuldukları anda gösterilir; burada tarihleri ve durumları yer alır.
        </p>
        <ShareTokenList vehicleId={vehicle.id} tokens={tokens} />
      </section>
    </div>
  );
}

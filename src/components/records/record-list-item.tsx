import Link from "next/link";
import { formatDate, formatKm } from "@/lib/format";
import type { ServiceRecord } from "@/lib/records/queries";

export function RecordListItem({ record }: { record: ServiceRecord }) {
  return (
    <Link
      href={`/dashboard/vehicles/${record.vehicle_id}/records/${record.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
    >
      <div className="flex items-baseline justify-between gap-3 text-sm text-gray-500">
        <span>{formatDate(record.service_date)}</span>
        <span>{formatKm(record.odometer_km)}</span>
      </div>
      <p className="mt-1 font-medium">{record.service_name}</p>
      <p className="mt-0.5 line-clamp-2 text-gray-600">{record.description}</p>
    </Link>
  );
}

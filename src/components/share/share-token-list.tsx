import { revokeShareCode } from "@/app/dashboard/vehicles/[vehicleId]/share/actions";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { formatDateTime } from "@/lib/format";
import type { ShareToken, ShareTokenStatus } from "@/lib/share/queries";

const STATUS_LABELS: Record<ShareTokenStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-green-100 text-green-800" },
  expired: { label: "Süresi doldu", className: "bg-gray-100 text-gray-700" },
  revoked: { label: "İptal edildi", className: "bg-gray-100 text-gray-700" },
};

export function ShareTokenList({ vehicleId, tokens }: { vehicleId: string; tokens: ShareToken[] }) {
  if (tokens.length === 0) {
    return <p className="text-sm text-gray-500">Henüz paylaşım kodu oluşturulmadı.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {tokens.map((token) => {
        const status = STATUS_LABELS[token.status];
        return (
          <li
            key={token.id}
            data-testid="share-token"
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="min-w-0 text-sm">
              <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
              <p className="mt-1 text-gray-600">{`Oluşturuldu: ${formatDateTime(token.createdAt)}`}</p>
              <p className="text-gray-600">
                {token.revokedAt
                  ? `İptal: ${formatDateTime(token.revokedAt)}`
                  : `Geçerlilik: ${formatDateTime(token.expiresAt)}`}
              </p>
            </div>
            {token.status === "active" && (
              <ConfirmActionButton
                action={revokeShareCode.bind(null, vehicleId, token.id)}
                confirmMessage="Bu paylaşım kodu iptal edilsin mi? Kodu bilen kişi artık geçmişi göremez."
                label="İptal et"
                pendingText="İptal ediliyor…"
                compact
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

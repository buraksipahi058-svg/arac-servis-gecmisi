import { revokeShareCode } from "@/app/dashboard/vehicles/[vehicleId]/share/actions";
import { cardClass } from "@/components/ui/card";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { formatDateTime } from "@/lib/format";
import type { ShareToken, ShareTokenStatus } from "@/lib/share/queries";

const STATUS_LABELS: Record<ShareTokenStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "bg-emerald-100 text-emerald-800" },
  expired: { label: "Süresi doldu", className: "bg-sand-100 text-ink-700" },
  revoked: { label: "İptal edildi", className: "bg-sand-100 text-ink-700" },
};

export function ShareTokenList({ vehicleId, tokens }: { vehicleId: string; tokens: ShareToken[] }) {
  if (tokens.length === 0) {
    return <p className="text-sm text-ink-500">Henüz paylaşım kodu oluşturulmadı.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {tokens.map((token) => {
        const status = STATUS_LABELS[token.status];
        return (
          <li
            key={token.id}
            data-testid="share-token"
            className={`${cardClass} flex items-center justify-between gap-3 p-4`}
          >
            <div className="min-w-0 text-sm">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <p className="mt-1 text-ink-600">{`Oluşturuldu: ${formatDateTime(token.createdAt)}`}</p>
              <p className="text-ink-600">
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

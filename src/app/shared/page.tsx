import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { OpenSharedForm } from "@/components/share/open-shared-form";
import { SharedHistoryView } from "@/components/share/shared-history-view";
import { FormAlert } from "@/components/ui/form-alert";
import { decodeAccessCookie, SHARE_ACCESS_COOKIE, verifyShareAccess } from "@/lib/share/access";
import { loadSharedHistory } from "@/lib/share/shared-history";

export const metadata: Metadata = {
  title: "Paylaşılan araç geçmişi",
  robots: { index: false, follow: false },
};

export default async function SharedPage() {
  const cookieValue = (await cookies()).get(SHARE_ACCESS_COOKIE)?.value;
  const stored = cookieValue ? decodeAccessCookie(cookieValue) : null;
  // Çerez her istekte yeniden doğrulanır: iptal edilen veya süresi dolan kod anında geçersiz olur.
  const access = stored ? await verifyShareAccess(stored.plate, stored.code) : null;
  const history = access ? await loadSharedHistory(access) : null;

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8">
      <Link href="/" className="text-sm font-semibold text-gray-500">
        Araç Servis Geçmişi
      </Link>

      <div className="mt-6">
        {history ? (
          <SharedHistoryView history={history} />
        ) : (
          <div className="mx-auto max-w-sm">
            <h1 className="text-2xl font-semibold">Paylaşılan geçmişi görüntüle</h1>
            <p className="mb-6 mt-2 text-gray-600">
              Araç sahibinden aldığın paylaşım kodunu, aracın plakasıyla birlikte gir.
            </p>
            {cookieValue && (
              <div className="mb-4">
                <FormAlert tone="warning">
                  Bu paylaşımın süresi dolmuş veya araç sahibi tarafından iptal edilmiş.
                </FormAlert>
              </div>
            )}
            <OpenSharedForm />
          </div>
        )}
      </div>
    </main>
  );
}

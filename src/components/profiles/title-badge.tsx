import { Building2, Tag, Wrench, type LucideProps } from "lucide-react";
import { profileTitleLabel, type ProfileTitle } from "@/lib/profiles/titles";

const ICONS: Record<ProfileTitle, React.ComponentType<LucideProps>> = {
  seller: Tag,
  authorized_service: Building2,
  mechanic: Wrench,
};

type TitleBadgeProps = {
  title: ProfileTitle;
  // Verilirse rozette onay sayısı da gösterilir ("Usta · 3 onay").
  endorsementCount?: number;
};

// Kullanıcının kendi beyan ettiği unvan; onay sayısı yalnızca veri olarak gösterilir.
export function TitleBadge({ title, endorsementCount }: TitleBadgeProps) {
  const Icon = ICONS[title];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-800">
      <Icon aria-hidden className="size-3.5 text-gold-700" />
      <span>
        {profileTitleLabel(title)}
        {endorsementCount !== undefined && (
          <span className="font-medium text-ink-500">{` · ${endorsementCount} onay`}</span>
        )}
      </span>
    </span>
  );
}

export function TitleIcon({ title, ...props }: { title: ProfileTitle } & LucideProps) {
  const Icon = ICONS[title];
  return <Icon aria-hidden {...props} />;
}

// Kullanıcının kendi beyan ettiği unvanlar (DB: profile_titles_title_values ile aynı liste).
export const PROFILE_TITLES = [
  { value: "seller", label: "Satıcı", description: "Araç alım satımı yapıyorum." },
  { value: "authorized_service", label: "Yetkili servis", description: "Bir markanın yetkili servisiyim." },
  { value: "mechanic", label: "Usta", description: "Bağımsız servis / usta olarak çalışıyorum." },
] as const;

export type ProfileTitle = (typeof PROFILE_TITLES)[number]["value"];

export function isProfileTitle(value: string): value is ProfileTitle {
  return PROFILE_TITLES.some((title) => title.value === value);
}

// Unvanları her yerde aynı sırada göstermek için (Satıcı → Yetkili servis → Usta).
export function compareProfileTitles(a: ProfileTitle, b: ProfileTitle): number {
  const order = PROFILE_TITLES.map((title) => title.value as ProfileTitle);
  return order.indexOf(a) - order.indexOf(b);
}

export function profileTitleLabel(value: string): string {
  return PROFILE_TITLES.find((title) => title.value === value)?.label ?? value;
}

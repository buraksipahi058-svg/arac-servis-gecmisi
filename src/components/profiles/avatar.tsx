// Profil fotoğrafı yerine ad baş harfleri (ör. "Ahmet Usta" → "AU").
export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr"))
    .join("");

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 font-bold text-ink-950 ${
        size === "lg" ? "size-16 text-xl" : "size-11 text-sm"
      }`}
    >
      {initials || "?"}
    </span>
  );
}

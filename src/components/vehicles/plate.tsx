import { formatPlate } from "@/lib/vehicles/plate";

type PlateProps = {
  plate: string;
  size?: "sm" | "lg";
};

const SIZES = {
  sm: { outer: "text-base", strip: "px-1 text-[0.55rem]", text: "px-2 py-0.5" },
  lg: { outer: "text-xl sm:text-2xl", strip: "px-1.5 text-[0.65rem]", text: "px-3 py-1" },
} as const;

// Türkiye plakası görünümünde rozet (solda mavi "TR" şeridi). Ekran okuyucu yalnızca plakayı okur.
export function Plate({ plate, size = "sm" }: PlateProps) {
  const styles = SIZES[size];
  return (
    <span
      className={`inline-flex items-stretch overflow-hidden rounded-md border-2 border-ink-900 bg-white font-bold leading-none tracking-wider text-ink-900 shadow-sm ${styles.outer}`}
    >
      <span
        aria-hidden
        className={`flex items-end bg-plate-blue pb-1 font-semibold tracking-normal text-white ${styles.strip}`}
      >
        TR
      </span>
      <span className={`flex items-center tabular-nums ${styles.text}`}>{formatPlate(plate)}</span>
    </span>
  );
}

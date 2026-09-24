import { renderAppIcon } from "@/lib/app-icon";

// /icon/32 (favicon), /icon/192 ve /icon/512 (ana ekran, manifest.ts)
export function generateImageMetadata() {
  return [32, 192, 512].map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  return renderAppIcon(Number(await id), { rounded: true });
}

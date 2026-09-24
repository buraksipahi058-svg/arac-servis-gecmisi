import { renderAppIcon } from "@/lib/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS köşeleri kendisi yuvarlar; zemin tam kare olmalı.
export default function AppleIcon() {
  return renderAppIcon(size.width, { rounded: false });
}

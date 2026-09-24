import { ImageResponse } from "next/og";

// Uygulama ikonu: koyu zemin üzerinde kilometre göstergesi. Favicon, ana ekran (manifest)
// ve Apple ikonu aynı çizimi farklı boyutlarda kullanır.
export function renderAppIcon(size: number, { rounded }: { rounded: boolean }) {
  const ring = Math.max(2, Math.round(size * 0.075));
  const dial = Math.round(size * 0.62);
  const needleLength = Math.round(dial * 0.4);
  const needleWidth = Math.max(2, Math.round(size * 0.06));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          borderRadius: rounded ? Math.round(size * 0.22) : 0,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: dial,
            height: dial,
            borderRadius: "50%",
            border: `${ring}px solid #ffffff`,
            borderBottomColor: "transparent",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: dial / 2 - ring,
              top: dial / 2 - ring - needleWidth / 2,
              width: needleLength,
              height: needleWidth,
              borderRadius: needleWidth,
              background: "#fbbf24",
              transform: "rotate(-40deg)",
              transformOrigin: "0% 50%",
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}

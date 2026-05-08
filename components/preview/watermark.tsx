import type { WatermarkConfig } from "@/types/template";

export function Watermark({ config }: { config: WatermarkConfig }) {
  if (!config.enabled) return null;
  const opacity = config.opacity ?? 0.08;
  const rotation = config.rotation ?? -30;
  const transform = config.position === "diagonal"
    ? `rotate(${rotation}deg)`
    : "rotate(0deg)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden"
    >
      {config.text && (
        <span
          className="select-none whitespace-nowrap text-6xl font-bold uppercase text-foreground"
          style={{ opacity, transform }}
        >
          {config.text}
        </span>
      )}
      {config.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.imageUrl}
          alt=""
          className="max-h-[60%] max-w-[60%] object-contain"
          style={{ opacity, transform }}
        />
      )}
    </div>
  );
}

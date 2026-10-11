import Image from "next/image";
import { COMPANY } from "@/lib/constants";

/** Displays the original horizontal mark from the supplied brand sheet. */
export function BrandLogo({ preload = false, variant = "navy" }: { preload?: boolean; variant?: "navy" | "white" }) {
  const crop = variant === "white"
    ? { x: 145, y: 425, width: 1440, height: 245 }
    : { x: 135, y: 50, width: 1450, height: 265 };
  return (
    <span
      className="relative block w-full overflow-hidden"
      style={{ aspectRatio: `${crop.width} / ${crop.height}` }}
    >
      <Image
        src="/images/logo/brand-style-guide.png"
        alt={COMPANY.name}
        width={2115}
        height={744}
        preload={preload}
        sizes="(max-width: 640px) 470px, 555px"
        className="absolute block h-auto max-w-none"
        style={{
          width: `${(2115 / crop.width) * 100}%`,
          left: `${(-crop.x / crop.width) * 100}%`,
          top: `${(-crop.y / crop.height) * 100}%`,
        }}
      />
    </span>
  );
}

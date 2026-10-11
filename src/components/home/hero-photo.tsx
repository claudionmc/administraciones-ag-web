import Image from "next/image";
import architecture from "../../../public/images/architecture/geometria-y-reflejos.png";

export function HeroPhoto() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-[4/5]">
      <Image
        src={architecture}
        alt="Arquitectura contemporánea de superficies blancas y líneas geométricas, con cristales azules junto al cielo."
        fill
        preload
        quality={90}
        placeholder="blur"
        // Account for the full painted width of object-cover before clipping.
        // Source ratio: 3344/1882; frame ratios: 4/5 desktop, 4/3 mobile.
        sizes="(min-width: 1152px) 983px, (min-width: 1024px) calc(94.52vw - 105.87px), (min-width: 640px) calc(133.27vw - 85.29px), calc(133.27vw - 53.31px)"
        className="object-cover object-[65%_center]"
      />
    </div>
  );
}

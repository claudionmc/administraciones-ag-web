import Image from "next/image";
import architecture from "../../../public/images/architecture/geometria-y-reflejos.png";

export function HeroPhoto() {
  return (
    <div className="w-full">
      <Image
        src={architecture}
        alt="Arquitectura contemporánea de superficies blancas y líneas geométricas, con cristales azules junto al cielo."
        preload
        quality={90}
        placeholder="blur"
        sizes="(min-width: 1152px) 545px, (min-width: 1024px) calc(52.38vw - 58.67px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
        className="block h-auto w-full"
      />
    </div>
  );
}

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
        placeholder="blur"
        sizes="(min-width: 1152px) 430px, (min-width: 1024px) 40vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
        className="object-cover object-[65%_center]"
      />
    </div>
  );
}

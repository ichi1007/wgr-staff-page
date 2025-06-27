import Image from "next/image";
import WGR_IMG from "@/public/img/wgr-ogp.png";

export default function BgImage() {
  return (
    <div className="w-auto h-screen z-[-999] pointer-events-none">
      <Image
        src={WGR_IMG}
        alt="WGR OGP Image"
        fill
        className="object-cover bg-center filter blur-sm select-none"
        draggable={false}
      />
    </div>
  );
}

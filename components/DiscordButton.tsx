import { Button } from "./ui/button";
import Image from "next/image";
import DiscordLogo from "@/public/svg/Discord-Logo-White.svg";

export default function DiscordButton() {
  return (
    <>
      <Button className="bg-[#5865f2]">
        <Image src={DiscordLogo} alt="DiscordLogo" width={100} />
        でログイン
      </Button>
    </>
  );
}

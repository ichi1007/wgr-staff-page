"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import DiscordLogo from "@/public/svg/Discord-Logo-White.svg";
import { signIn } from "next-auth/react";

export default function DiscordButton() {
  return (
    <>
      <Button
        className="bg-[#5865f2]"
        onClick={() => signIn("discord")}
        type="button"
      >
        <Image src={DiscordLogo} alt="DiscordLogo" width={100} />
        でログイン
      </Button>
    </>
  );
}

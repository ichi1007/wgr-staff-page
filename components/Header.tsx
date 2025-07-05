"use client";

import Image from "next/image";
import Logo from "@/public/svg/Staff_Page_Logo.svg";
import Link from "next/link";

export default function HeaderComp() {
  return (
    <header className="fixed py-3 px-5 z-10 flex justify-between items-center">
      {/* ロゴ */}
      <div>
        <Link href="/">
          <Image
            src={Logo}
            alt="WGR_StaffPage_Logo"
            width={50}
            className="block pointer-events-none select-none"
            draggable={false}
          />
        </Link>
      </div>
    </header>
  );
}

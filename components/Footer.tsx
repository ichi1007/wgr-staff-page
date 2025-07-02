"use client";

import { Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/img/wgr_logo.png";

export default function FooterComp() {
  return (
    <footer className="bg-[#cdf2ff] pt-10 pb-1 mt-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-8">
        {/* 左側ロゴ */}
        <div className="mb-6 md:mb-0">
          <div className="flex items-end">
            <Link href="/">
              <Image
                src={Logo}
                alt="WGR_Logo"
                width={50}
                className="block pointer-events-none select-none"
                draggable={false}
              />
            </Link>
            <div className="w-[1px] h-[50px] bg-black mx-2" />
            <h1
              className="font-extrabold text-xl mb-2 select-none text-black"
              draggable={false}
            >
              Staff Page
            </h1>
          </div>
        </div>
        {/* 右側リンク群 */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <Link
              href="https://x.com/WGR_official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline"
            >
              <Twitter className="text-black" />
            </Link>
          </div>
          <Link href="/about" className="text-black hover:underline">
            About
          </Link>
          <Link href="/privacy-policy" className="text-black hover:underline">
            Privacy Policy
          </Link>
          <Link href="/support" className="text-black hover:underline">
            Support
          </Link>
        </div>
      </div>
      <p className="text-center">
        &copy; {new Date().getFullYear()} White Grim Reaper.
        <span className="ml-3">Dev: ichi</span>
      </p>
    </footer>
  );
}

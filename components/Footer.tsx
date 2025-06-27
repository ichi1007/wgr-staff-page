"use client";

import Link from "next/link";

export default function FooterComp() {
  return (
    <footer className="max-w-[550px] mx-auto flex items-center justify-between mt-5 mb-2">
      <p>© {new Date().getFullYear()} White Grim Reaper. Author: ichi</p>
      <ul className="flex items-center">
        {(
          [
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
            { label: "Support", href: "/support" },
          ] as const
        ).map((item, idx, arr) => (
          <li key={item.label} className="px-1 flex items-center">
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
            {idx < arr.length - 1 && (
              <span className="mx-2 font-extrabold">/</span>
            )}
          </li>
        ))}
      </ul>
    </footer>
  );
}

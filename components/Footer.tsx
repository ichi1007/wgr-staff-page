"use client";

import Link from "next/link";

export default function FooterComp() {
  return (
    <footer className="max-w-[550px] mx-auto flex items-center justify-between mt-5 mb-2">
      <p>
        © {new Date().getFullYear()} White Grim Reaper.
        <span className="ml-3">
          Create:
          <Link
            href="https://x.com/ichi_107"
            className="ml-1 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ichi
          </Link>
        </span>
      </p>
      <ul className="flex items-center">
        {(
          [
            { label: "About", href: "/document/about" },
            { label: "Privacy", href: "/document/privacy" },
            { label: "Support", href: "/document/support" },
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

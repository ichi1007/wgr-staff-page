import Link from "next/link";

export default function FooterComp() {
  return (
    <footer className="max-w-[400px] mx-auto flex items-center justify-between mt-5 mb-2">
      <p>&copy;{new Date().getFullYear()}</p>
      <ul className="flex items-center">
        {(
          [
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
            { label: "Support", href: "/support" },
          ] as const
        ).map((item, idx, arr) => (
          <li key={item.label} className="px-1 flex items-center">
            <Link href={item.href}>{item.label}</Link>
            {idx < arr.length - 1 && (
              <span className="mx-2 text-gray-400 font-extrabold">/</span>
            )}
          </li>
        ))}
      </ul>
    </footer>
  );
}

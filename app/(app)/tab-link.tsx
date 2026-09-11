"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`chip display${active ? " active" : ""}`}
      style={{ textTransform: "uppercase", fontSize: 13 }}
    >
      {children}
    </Link>
  );
}

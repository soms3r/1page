"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "~" },
  { href: "/search", label: "Search", icon: "/" },
  { href: "/categories", label: "Categories", icon: "#" },
  { href: "/submit", label: "Submit", icon: "+" },
  { href: "/trending", label: "Trending", icon: "*" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] sm:hidden ${
        isAdmin ? "hidden" : ""
      }`}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-12 min-h-11 px-3 rounded-md transition-colors ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--accent)]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

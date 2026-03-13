"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Layers, Zap, Archive } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/board",   label: "Tasks",          Icon: ClipboardList },
  { href: "/matrix",  label: "Prioritisation", Icon: Layers        },
  { href: "/action",  label: "Action List",    Icon: Zap           },
  { href: "/archive", label: "Archive",        Icon: Archive       },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-40 flex h-screen w-[60px] flex-col">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className="group relative flex-1 overflow-hidden"
            aria-current={isActive ? "page" : undefined}
          >
            {/* Tab surface — fills the full section, rounded on the right end */}
            <div
              className={`absolute inset-0 rounded-r-[20px] border-[3px] transition-colors duration-150 ${
                isActive
                  ? "border-foreground bg-foreground"
                  : "border-foreground bg-background group-hover:bg-foreground/10"
              }`}
            />

            {/* Rotated label + icon, centred inside the tab */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={`flex rotate-90 select-none items-center gap-[10px] whitespace-nowrap font-[family-name:var(--font-delius)] ${
                  isActive ? "text-background" : "text-foreground"
                }`}
              >
                <span className="text-[22px] leading-none">{label}</span>
                <Icon size={22} strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

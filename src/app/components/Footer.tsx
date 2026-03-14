import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { label: "Privacy Policy",    href: "/privacy"         },
  { label: "Terms & Conditions", href: "/terms"           },
  { label: "Support",           href: "/support"         },
  { label: "Request a Change",  href: "/request-change"  },
];

export default function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-foreground/10 bg-background px-6 py-3 ${className}`}
    >
      {/* Left: brand + links */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-[family-name:var(--font-delius)] text-xs font-semibold text-foreground">
          Synaptex
        </span>
        <span className="text-foreground/20 text-xs">·</span>
        <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/50">
          Prioritise. Focus. Complete.
        </span>

        {LINKS.map((link, i) => (
          <span key={link.href} className="flex items-center gap-x-3">
            <span className="text-foreground/20 text-xs">·</span>
            <Link
              href={link.href}
              className="font-[family-name:var(--font-delius)] text-xs text-foreground/50 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </div>

      {/* Right: copyright + logo */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/40">
          © 2026
        </span>
        <Image
          src="/Synaptex-Logo.png"
          alt="Synaptex"
          width={28}
          height={28}
          className="object-contain opacity-70"
        />
      </div>
    </footer>
  );
}

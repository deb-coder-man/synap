"use client";

import { useState, useEffect } from "react";
import { Settings, Palette } from "lucide-react";
import SettingsPanel from "@/app/components/settings/SettingsPanel";
import ThemePanel from "@/app/components/themes/ThemePanel";
import { useSettings } from "@/app/hooks/useSettings";
import { useThemeStore } from "@/app/stores/themeStore";
import { ClipboardList, Layers, Zap, Archive } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
    { href: "/board",   label: "Tasks",          Icon: ClipboardList },
    { href: "/matrix",  label: "Prioritisation", Icon: Layers        },
    { href: "/action",  label: "Action List",    Icon: Zap           },
    { href: "/archive", label: "Archive",        Icon: Archive       },
  ];

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeOpen,    setThemeOpen]    = useState(false);

  const { data: settings } = useSettings();
  const { setTheme }       = useThemeStore();

  useEffect(() => {
    if (settings) {
      setTheme(settings.backgroundColor, settings.textColor, settings.fontFamily);
    }
  }, [settings, setTheme]);

  return (
    <>
      <header className="max-w-screen flex item-center justify-between border-b-2 border-foreground my-8 mx-6">

        {/* Nav tabs */}
        <nav className="flex">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center justify-between gap-6 px-5 h-[60px] min-w-[190px]
                  font-delius text-=xl rounded-t-[20px] border-2 transition-colors
                  border-foreground border-b-0
                  ${isActive
                    ? "bg-foreground border-foreground text-background"
                    : "bg-background border-foreground text-foreground hover:bg-foreground/5"
                  }
                `}
              >
                <span>{label}</span>
                <Icon size={26} />
              </Link>
            );
          })}
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-1 pb-2">
          <button
            onClick={() => { setThemeOpen(true); setSettingsOpen(false); }}
            className="flex size-12 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
            title="Theme"
          >
            <Palette size={25} />
          </button>
          <button
            onClick={() => { setSettingsOpen(true); setThemeOpen(false); }}
            className="flex size-12 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
            title="Settings"
          >
            <Settings size={25} />
          </button>
        </div>
      </header>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ThemePanel    open={themeOpen}    onClose={() => setThemeOpen(false)} />
    </>
  );
}
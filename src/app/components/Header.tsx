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
import { useQueryClient } from "@tanstack/react-query";
import { getLists } from "@/lib/api/lists";
import { getTasks } from "@/lib/api/tasks";
import { listKeys } from "@/app/hooks/useLists";
import { taskKeys } from "@/app/hooks/useTasks";

export default function Header() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
    { href: "/board",   label: "Tasks",          Icon: ClipboardList },
    { href: "/matrix",  label: "Prioritisation", Icon: Layers        },
    { href: "/action",  label: "Action List",    Icon: Zap           },
    { href: "/archive", label: "Archive",        Icon: Archive       },
  ];

  function prefetch(href: string) {
    if (href === "/board") {
      queryClient.prefetchQuery({ queryKey: listKeys.all, queryFn: getLists });
    } else {
      queryClient.prefetchQuery({ queryKey: taskKeys.all, queryFn: () => getTasks() });
    }
  }

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
      {/* ── Mobile top bar (hidden on sm+) ─────────────────────────────────── */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background border-b-2 border-foreground">
        <span className="font-delius text-xl font-bold text-foreground">Synaptex</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setThemeOpen(true); setSettingsOpen(false); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/50 transition-colors hover:text-foreground cursor-pointer"
            title="Theme"
          >
            <span className="font-delius text-[10px] leading-none">Theme</span>
            <Palette size={20} />
          </button>
          <button
            onClick={() => { setSettingsOpen(true); setThemeOpen(false); }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/50 transition-colors hover:text-foreground cursor-pointer"
            title="Settings"
          >
            <span className="font-delius text-[10px] leading-none">Settings</span>
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ── Mobile bottom nav (hidden on sm+) ──────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-background border-t-2 border-foreground">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => prefetch(href)}
              className={`
                flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors cursor-pointer
                ${isActive
                  ? "bg-foreground text-background"
                  : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
                }
              `}
            >
              <span className="font-delius text-[10px] leading-none">{label}</span>
              <Icon size={22} />
            </Link>
          );
        })}
      </nav>

      {/* ── Desktop top nav (hidden below sm) ──────────────────────────────── */}
      <header className="hidden sm:flex fixed top-0 left-0 right-0 z-50 flex-col bg-background">
        <div className="flex items-end px-6 pt-3 gap-0 border-b-2 border-foreground">
          {/* Nav tabs */}
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onMouseEnter={() => prefetch(href)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-t-[20px] border-2 -mb-[2px] font-delius text-sm transition-colors cursor-pointer
                  ${isActive
                    ? "bg-foreground text-background border-foreground"
                    : "text-foreground/60 border-transparent hover:border-foreground/20 hover:text-foreground"
                  }
                `}
              >
                <span>{label}</span>
                <Icon size={16} />
              </Link>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings icons */}
          <button
            onClick={() => { setThemeOpen(true); setSettingsOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 rounded-t-[20px] border-2 -mb-[2px] font-delius text-sm text-foreground/60 border-transparent transition-colors hover:border-foreground/20 hover:text-foreground cursor-pointer"
            title="Theme"
          >
            <span>Theme</span>
            <Palette size={16} />
          </button>
          <button
            onClick={() => { setSettingsOpen(true); setThemeOpen(false); }}
            className="flex items-center gap-2 px-4 py-3 rounded-t-[20px] border-2 -mb-[2px] font-delius text-sm text-foreground/60 border-transparent transition-colors hover:border-foreground/20 hover:text-foreground cursor-pointer"
            title="Settings"
          >
            <span>Settings</span>
            <Settings size={16} />
          </button>
        </div>
      </header>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ThemePanel    open={themeOpen}    onClose={() => setThemeOpen(false)} />
    </>
  );
}

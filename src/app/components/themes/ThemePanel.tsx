"use client";

import { useEffect } from "react";
import { X, Check } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/app/hooks/useSettings";
import { useThemeStore, PREMADE_THEMES, FONT_OPTIONS, applyThemeToDOM } from "@/app/stores/themeStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ThemePanel({ open, onClose }: Props) {
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();

  const { bg, text, font, setTheme } = useThemeStore();

  // Sync store from API on first load
  useEffect(() => {
    if (settings) {
      const s = settings;
      useThemeStore.setState({ bg: s.backgroundColor, text: s.textColor, font: s.fontFamily });
      applyThemeToDOM(s.backgroundColor, s.textColor, s.fontFamily);
    }
  }, [settings]);

  function applyAndSave(newBg: string, newText: string, newFont: string) {
    setTheme(newBg, newText, newFont);
    updateSettings({ backgroundColor: newBg, textColor: newText, fontFamily: newFont });
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[420px] flex-col overflow-y-auto bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-7 py-5">
          <h2 className="font-[family-name:var(--font-delius)] text-xl font-bold text-foreground">Theme</h2>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-7 py-6">

          {/* ── Premade themes ── */}
          <section className="flex flex-col gap-3">
            <h3 className="font-[family-name:var(--font-delius)] text-sm font-bold uppercase tracking-wider text-foreground/40">
              Themes
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PREMADE_THEMES.map((theme) => {
                const isActive = bg === theme.bg && text === theme.text && font === theme.font;
                return (
                  <button
                    key={theme.name}
                    onClick={() => applyAndSave(theme.bg, theme.text, theme.font)}
                    className="relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:scale-105"
                    style={{ backgroundColor: theme.bg, border: `2px solid ${isActive ? theme.text : "transparent"}` }}
                  >
                    {isActive && (
                      <div className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full" style={{ backgroundColor: theme.text }}>
                        <Check size={9} style={{ color: theme.bg }} />
                      </div>
                    )}
                    {/* Preview swatch — two stripes */}
                    <div className="flex w-full flex-col gap-1 px-1">
                      <div className="h-1.5 w-full rounded-full opacity-60" style={{ backgroundColor: theme.text }} />
                      <div className="h-1.5 w-2/3 rounded-full opacity-40" style={{ backgroundColor: theme.text }} />
                    </div>
                    <span
                      className="font-[family-name:var(--font-delius)] text-xs"
                      style={{ color: theme.text }}
                    >
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-foreground/10" />

          {/* ── Custom colours ── */}
          <section className="flex flex-col gap-4">
            <h3 className="font-[family-name:var(--font-delius)] text-sm font-bold uppercase tracking-wider text-foreground/40">
              Custom colours
            </h3>

            <div className="flex items-center justify-between">
              <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/70">Background</label>
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/40">{bg}</span>
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => applyAndSave(e.target.value, text, font)}
                  className="size-9 cursor-pointer rounded-lg border-2 border-foreground/15 bg-transparent p-0.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="font-[family-name:var(--font-delius)] text-sm text-foreground/70">Text colour</label>
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-delius)] text-xs text-foreground/40">{text}</span>
                <input
                  type="color"
                  value={text}
                  onChange={(e) => applyAndSave(bg, e.target.value, font)}
                  className="size-9 cursor-pointer rounded-lg border-2 border-foreground/15 bg-transparent p-0.5"
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-foreground/10" />

          {/* ── Font ── */}
          <section className="flex flex-col gap-3">
            <h3 className="font-[family-name:var(--font-delius)] text-sm font-bold uppercase tracking-wider text-foreground/40">
              Font
            </h3>
            <div className="flex flex-col gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => applyAndSave(bg, text, f.value)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    font === f.value
                      ? "border-foreground bg-foreground/8"
                      : "border-foreground/10 hover:border-foreground/25"
                  }`}
                >
                  <span className="font-[family-name:var(--font-delius)] text-sm text-foreground">{f.label}</span>
                  {font === f.value && <Check size={14} className="text-foreground/60" />}
                </button>
              ))}
            </div>
          </section>

          <div className="h-4" />
        </div>
      </div>
    </>
  );
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Premade themes ────────────────────────────────────────────────────────────

export type Theme = {
  name: string;
  bg: string;
  text: string;
  font: string;
};

export const PREMADE_THEMES: Theme[] = [
  { name: "Synap",    bg: "#f6f0e6", text: "#1f1a17", font: "Delius"  },
  { name: "Dark",     bg: "#1c1c1e", text: "#f5f5f7", font: "Inter"   },
  { name: "Ocean",    bg: "#e8f4f8", text: "#0a2540", font: "Inter"   },
  { name: "Forest",   bg: "#1a2e1e", text: "#d4edda", font: "Delius"  },
  { name: "Lavender", bg: "#f3f0ff", text: "#2d1b69", font: "Inter"   },
  { name: "Noir",     bg: "#0d0d0d", text: "#e8e8e8", font: "Delius"  },
  { name: "Sunset",   bg: "#fff5eb", text: "#7c2d12", font: "Delius"  },
  { name: "Rose",     bg: "#fff1f2", text: "#881337", font: "Inter"   },
  { name: "Slate",    bg: "#f8fafc", text: "#0f172a", font: "Inter"   },
  { name: "Coffee",   bg: "#2c1810", text: "#f5e6d3", font: "Delius"  },
  { name: "Arctic",   bg: "#e0f2fe", text: "#0c4a6e", font: "Inter"   },
  { name: "Mocha",    bg: "#3c2415", text: "#e8cba0", font: "Georgia" },
];

export const FONT_OPTIONS = [
  { label: "Delius (handwritten)",  value: "Delius"  },
  { label: "Inter (clean sans)",    value: "Inter"   },
  { label: "Georgia (elegant serif)", value: "Georgia" },
  { label: "Mono (monospace)",      value: "monospace" },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

type ThemeStore = {
  bg: string;
  text: string;
  font: string;
  setTheme: (bg: string, text: string, font: string) => void;
  applyToDOM: (bg: string, text: string, font: string) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      bg:   "#f6f0e6",
      text: "#1f1a17",
      font: "Delius",

      setTheme(bg, text, font) {
        set({ bg, text, font });
        applyThemeToDOM(bg, text, font);
      },

      applyToDOM(bg, text, font) {
        applyThemeToDOM(bg, text, font);
      },
    }),
    {
      name: "synap-theme",
    }
  )
);

// Applies CSS custom properties to :root so Tailwind bg-background / text-foreground pick them up
export function applyThemeToDOM(bg: string, text: string, font: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--background", bg);
  root.style.setProperty("--foreground", text);

  const fontValues: Record<string, string> = {
    Delius:     "'Delius', cursive",
    Inter:      "'Inter', sans-serif",
    Georgia:    "Georgia, 'Times New Roman', serif",
    monospace:  "'Courier New', Courier, monospace",
  };
  const resolved = fontValues[font] ?? fontValues["Inter"];
  root.style.setProperty("--font-delius", resolved);
  root.style.setProperty("--font-sans",   resolved);
  root.style.setProperty("--font-active", resolved);
  document.body.style.fontFamily = resolved;
}

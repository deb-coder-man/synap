import type { Metadata } from "next";
import { Inter, Delius, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/app/components/Providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const delius = Delius({
  variable: "--font-delius",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Synap — Smart Todo Prioritisation",
  description:
    "Synap helps you manage your time better with intelligent todo prioritisation, an action planner, and an Eisenhower matrix view.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.variable} ${delius.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

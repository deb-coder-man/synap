import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen pb-[52px]" style={{ backgroundColor: "#f6f0e6" }}>
        {/* Simple top bar */}
        <div
          className="flex items-center border-b px-6 py-4"
          style={{ borderColor: "#1f1a1715", backgroundColor: "#f6f0e6" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Synaptex-Logo.png" alt="Synaptex" width={36} height={36} className="object-contain" />
            <span className="font-[family-name:var(--font-delius)] text-lg font-semibold" style={{ color: "#1f1a17" }}>
              Synaptex
            </span>
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-12">{children}</div>
      </div>
      <Footer />
    </>
  );
}

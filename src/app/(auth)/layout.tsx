import Footer from "@/app/components/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f0e6]">
      <div className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

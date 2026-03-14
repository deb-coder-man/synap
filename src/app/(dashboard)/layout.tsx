import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import PomodoroTicker from "@/app/components/action/PomodoroTicker";
import Footer from "@/app/components/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <div className="flex min-h-screen bg-background">
        <main className="flex-1">
          <Header />
          <PomodoroTicker />
          <div className="animate-page-content-in relative pt-[90px] pb-[76px] sm:pt-[75px] sm:pb-[52px]">
            {children}
          </div>
        </main>
      </div>
      <Footer className="hidden sm:flex" />
    </>
  );
}

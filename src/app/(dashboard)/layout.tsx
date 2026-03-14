import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1">
        
          <Header />
        <div className="relative">
          {children}
        </div>

      </main>
    </div>
  );
}

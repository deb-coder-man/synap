import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar />

      {/* Page content — offset by the 60px sidebar */}
      <main className="flex-1 pl-[60px] pt-10">
        <h1 className="pb-4 text-center font-[family-name:var(--font-delius)] text-4xl font-bold text-foreground">
          Synap
        </h1>
        <div className="relative h-full">
          {/* Sign-out sits unobtrusively in the bottom-right corner */}
          <form
            className="absolute bottom-4 right-4 z-10"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-xs text-foreground/40 transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </form>

          {children}
        </div>
      </main>
    </div>
  );
}

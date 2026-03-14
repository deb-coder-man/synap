import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div>
      {/* Logo + title */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image
          src="/Synaptex-Logo.png"
          alt="Synaptex"
          width={160}
          height={160}
          priority
          className="object-contain"
        />
        <p className="font-[family-name:var(--font-delius)] text-lg text-[#1f1a17]">
          Create an account
        </p>
        <p className="-mt-2 font-[family-name:var(--font-delius)] text-sm text-[#1f1a17]/40">
          Start using Synaptex today
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[#1f1a17]/10 bg-white p-8 shadow-sm">
        {/* OAuth buttons */}
        <div className="flex flex-col gap-3">
          {/* Google */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/board" });
            }}
          >
            <button type="submit" className="auth-oauth-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* GitHub */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/board" });
            }}
          >
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-4 py-3 font-[family-name:var(--font-delius)] text-sm font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#24292f" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1f1a17]/10" />
          <span className="font-[family-name:var(--font-delius)] text-xs text-[#1f1a17]/30">or</span>
          <div className="h-px flex-1 bg-[#1f1a17]/10" />
        </div>

        {/* Email/password form */}
        <form
          action={async (formData: FormData) => {
            "use server";

            const name     = formData.get("name")     as string;
            const email    = formData.get("email")    as string;
            const password = formData.get("password") as string;

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) redirect("/login?error=EmailInUse");

            const hashed = await bcrypt.hash(password, 12);

            await prisma.user.create({
              data: { name, email, password: hashed },
            });

            await signIn("credentials", {
              email,
              password,
              redirectTo: "/board",
            });
          }}
          className="flex flex-col gap-3"
        >
          <input name="name" type="text" placeholder="Full name" required className="auth-input" />
          <input name="email" type="email" placeholder="Email" required className="auth-input" />
          <input
            name="password"
            type="password"
            placeholder="Password (min. 8 characters)"
            minLength={8}
            required
            className="auth-input"
          />
          <button type="submit" className="auth-submit-btn mt-1">
            Create account
          </button>
        </form>

        <p className="mt-6 text-center font-[family-name:var(--font-delius)] text-sm text-[#1f1a17]/40">
          Already have an account?{" "}
          <a href="/login" className="cursor-pointer font-medium text-[#1f1a17] hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

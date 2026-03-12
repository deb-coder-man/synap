import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        Create an account
      </h1>
      <p className="mb-8 text-sm text-gray-500">Start using Synap today</p>

      <form
        action={async (formData: FormData) => {
          "use server";

          const name = formData.get("name") as string;
          const email = formData.get("email") as string;
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
        <input
          name="name"
          type="text"
          placeholder="Full name"
          required
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        />
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min. 8 characters)"
          minLength={8}
          required
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          className="mt-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-gray-900 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

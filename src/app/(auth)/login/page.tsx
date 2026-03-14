import { signIn } from "@/auth";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already linked to a different sign-in method. Please use the original method you signed up with.",
  AccessDenied: "Access denied. You may not have permission to sign in.",
  Verification: "The sign-in link has expired or already been used. Please request a new one.",
  Default: "Something went wrong. Please try again.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Welcome back</h1>
      <p className="mb-8 text-sm text-gray-500">Sign in to your Synap account</p>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* OAuth Providers */}
      <div className="flex flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/board" });
          }}
        >
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Continue with Google
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/board" });
          }}
        >
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Continue with GitHub
          </button>
        </form>
      </div>

      <div className="my-6 flex items-center gap-3">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Magic Link */}
      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("resend", {
            email: formData.get("email"),
            redirectTo: "/board",
          });
        }}
        className="mb-6"
      >
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="mb-3 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Send magic link
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <a href="/register" className="cursor-pointer font-medium text-gray-900 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

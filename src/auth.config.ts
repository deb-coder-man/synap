import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Node.js-only imports (no Prisma, no bcrypt)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },

  providers: [], // providers with Node.js deps are added in auth.ts

  // trustHost: true (set in auth.ts) causes NextAuth v5 to use __Host-prefixed
  // cookies, which require HTTPS and break on http://localhost. Override the PKCE
  // and state cookies to use plain names that work in both dev and production.
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id!;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

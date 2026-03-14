import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Node.js-only imports (no Prisma, no bcrypt)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },

  providers: [], // providers with Node.js deps are added in auth.ts

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

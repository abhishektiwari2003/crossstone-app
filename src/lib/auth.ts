import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

type AppRole = "SUPER_ADMIN" | "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "CLIENT";

type JwtToken = {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  iat?: number;
  exp?: number;
  jti?: string;
  id?: string;
  role?: AppRole;
};

type ProviderUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: AppRole;
};

type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  role?: AppRole;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.isActive) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as AppRole,
        } satisfies ProviderUser;
      },
    }),
  ],
  callbacks: {
    // Sanitize redirects — prevent recursive loops and external URLs
    async redirect({ url, baseUrl }) {
      try {
        const urlObj = new URL(url, baseUrl);
        // Block recursive /login?callbackUrl=/login loops only
        if (urlObj.pathname === "/login" && urlObj.searchParams.get("callbackUrl")?.includes("/login")) {
          return `${baseUrl}/dashboard`;
        }
        // Allow same-origin redirects (including /login for sign-out)
        if (urlObj.origin === baseUrl) return urlObj.toString();
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
    async jwt({ token, user }) {
      const t = token as JwtToken;
      if (user) {
        const u = user as ProviderUser;
        t.id = u.id;
        t.role = u.role;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as JwtToken;
      if (session.user) {
        session.user = {
          id: t.id!,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          role: t.role,
        } as unknown as SessionUser & typeof session.user;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};


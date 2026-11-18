import type { NextAuthConfig } from "next-auth";
import type { ProfileRole } from "@/lib/loyalty-engine";

export function getDashboardPathForRole(role?: ProfileRole | null): string {
  switch (role) {
    case "ADMIN_STAFF":
      return "/admin";
    case "EMPRESA":
      return "/empresa";
    case "AGENCIA":
      return "/agencia";
    case "SOCIO_PERSONAL":
    default:
      return "/mi-circulo";
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-only-circulo-organico-secret-change-in-prod",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/entrar",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.membershipId = user.membershipId ?? null;
        token.membershipNumber = user.membershipNumber ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as ProfileRole) ?? "SOCIO_PERSONAL";
        session.user.firstName = (token.firstName as string) ?? "";
        session.user.lastName = (token.lastName as string) ?? "";
        session.user.membershipId = (token.membershipId as string | null) ?? null;
        session.user.membershipNumber = (token.membershipNumber as string | null) ?? null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const pathname = nextUrl.pathname;

      const isPersonalRoute = pathname.startsWith("/mi-circulo");
      const isEmpresaRoute = pathname === "/empresa" || pathname.startsWith("/empresa/");
      const isAgenciaRoute = pathname === "/agencia" || pathname.startsWith("/agencia/");
      const isAdminRoute = pathname.startsWith("/admin");

      const isProtected = isPersonalRoute || isEmpresaRoute || isAgenciaRoute || isAdminRoute;
      if (!isProtected) return true;

      if (!user) {
        const loginUrl = new URL("/entrar", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      if (isAdminRoute && user.role !== "ADMIN_STAFF") {
        return Response.redirect(new URL(getDashboardPathForRole(user.role), nextUrl.origin));
      }
      if (isPersonalRoute && user.role !== "SOCIO_PERSONAL") {
        return Response.redirect(new URL(getDashboardPathForRole(user.role), nextUrl.origin));
      }
      if (isEmpresaRoute && user.role !== "EMPRESA") {
        return Response.redirect(new URL(getDashboardPathForRole(user.role), nextUrl.origin));
      }
      if (isAgenciaRoute && user.role !== "AGENCIA") {
        return Response.redirect(new URL(getDashboardPathForRole(user.role), nextUrl.origin));
      }

      return true;
    },
  },
};

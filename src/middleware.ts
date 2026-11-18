import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/mi-circulo/:path*",
    "/empresa",
    "/empresa/:path*",
    "/agencia",
    "/agencia/:path*",
    "/admin/:path*",
  ],
};

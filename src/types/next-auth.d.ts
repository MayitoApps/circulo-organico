import type { DefaultSession } from "next-auth";
import type { ProfileRole } from "@/lib/loyalty-engine";

declare module "next-auth" {
  interface User {
    id: string;
    role: ProfileRole;
    firstName: string;
    lastName: string;
    membershipId?: string | null;
    membershipNumber?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: ProfileRole;
      firstName: string;
      lastName: string;
      membershipId?: string | null;
      membershipNumber?: string | null;
    } & DefaultSession["user"];
  }
}

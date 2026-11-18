import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/auth.config";
import { EntrarClient } from "@/components/EntrarClient";

export const dynamic = "force-dynamic";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (session?.user) {
    redirect(sp.callbackUrl || getDashboardPathForRole(session.user.role));
  }

  return <EntrarClient callbackUrl={sp.callbackUrl} />;
}

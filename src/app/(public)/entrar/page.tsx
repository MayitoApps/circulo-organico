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
  const safeCallback =
    sp.callbackUrl &&
    sp.callbackUrl.startsWith("/") &&
    !sp.callbackUrl.startsWith("//") &&
    sp.callbackUrl !== "/"
      ? sp.callbackUrl
      : null;

  if (session?.user) {
    redirect(safeCallback || getDashboardPathForRole(session.user.role));
  }

  return <EntrarClient callbackUrl={safeCallback ?? undefined} />;
}

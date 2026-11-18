import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PortalShell } from "@/components/PortalShell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/entrar");
  }

  return (
    <PortalShell
      user={{
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
        membershipNumber: session.user.membershipNumber,
      }}
    >
      {children}
    </PortalShell>
  );
}

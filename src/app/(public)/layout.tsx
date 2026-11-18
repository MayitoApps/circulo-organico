import { auth } from "@/auth";
import { SiteHeader, type HeaderUser } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerUser: HeaderUser | null = null;
  try {
    const session = await auth();
    if (session?.user) {
      headerUser = {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
        membershipNumber: session.user.membershipNumber,
      };
    }
  } catch {
    headerUser = null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={headerUser} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

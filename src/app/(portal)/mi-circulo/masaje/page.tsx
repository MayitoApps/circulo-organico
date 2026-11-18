import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardPathForRole } from "@/auth.config";
import { MassageRequestClient } from "@/components/MassageRequestClient";

export const dynamic = "force-dynamic";

export default async function MiCirculoMasajePage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/mi-circulo/masaje");
  if (session.user.role !== "SOCIO_PERSONAL") {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
    include: {
      rewardCertificates: {
        where: { type: "MASAJE_60_MIN" },
        include: { preferredProperty: true },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!membership) redirect("/mi-circulo");

  return (
    <MassageRequestClient
      tier={membership.tier}
      certificates={membership.rewardCertificates.map((c) => ({
        id: c.id,
        title: c.title,
        beneficiaryName: c.beneficiaryName,
        status: c.status,
        preferredPropertyName: c.preferredProperty?.name ?? null,
        preferredDate: c.preferredDate?.toISOString() ?? null,
        preferredTimeSlot: c.preferredTimeSlot,
        expiresAt: c.expiresAt.toISOString(),
      }))}
    />
  );
}

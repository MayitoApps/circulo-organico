import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardPathForRole } from "@/auth.config";
import { PersonalPortalClient } from "@/components/PersonalPortalClient";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MiCirculoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/mi-circulo");
  if (session.user.role !== "SOCIO_PERSONAL") {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      reservations: {
        include: { property: true },
        orderBy: { checkIn: "asc" },
      },
      transactions: {
        include: { property: true },
        orderBy: { createdAt: "desc" },
        take: 25,
      },
      rewardCertificates: {
        include: { preferredProperty: true },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!membership) {
    redirect("/entrar");
  }

  return (
    <PersonalPortalClient
      fullName={`${membership.user.firstName} ${membership.user.lastName}`.trim()}
      membershipNumber={membership.membershipNumber}
      qrToken={membership.qrToken}
      tier={membership.tier}
      pointsBalance={membership.pointsBalance}
      rolling12mNights={membership.rolling12mNights}
      rolling12mSpendMxn={toNumber(membership.rolling12mSpendMxn)}
      rolling12mStaysCount={membership.rolling12mStaysCount}
      fifthStayBonusClaimedAt={
        membership.fifthStayBonusClaimedAt?.toISOString() ?? null
      }
      assignedAdvisorName={membership.assignedAdvisorName}
      reservations={membership.reservations.map((r) => ({
        id: r.id,
        propertyName: r.property.name,
        propertySlug: r.property.slug,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        adults: r.adults,
        finalPriceMxn: toNumber(r.finalPriceMxn),
        selectedCourtesy1: r.selectedCourtesy1,
        selectedCourtesy2: r.selectedCourtesy2,
        status: r.status,
      }))}
      ledgers={membership.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        propertyName: t.property?.name ?? null,
        netEligibleAmountMxn: toNumber(t.netEligibleAmountMxn),
        nightsCount: t.nightsCount,
        pointsDelta: t.pointsDelta,
        expiresAt: t.expiresAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
      }))}
      certificates={membership.rewardCertificates.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        status: c.status,
        preferredPropertyName: c.preferredProperty?.name ?? null,
        preferredDate: c.preferredDate?.toISOString() ?? null,
        preferredTimeSlot: c.preferredTimeSlot,
        expiresAt: c.expiresAt.toISOString(),
      }))}
    />
  );
}

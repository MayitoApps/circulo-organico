import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardPathForRole } from "@/auth.config";
import { getTwelveMonthsAgo } from "@/lib/loyalty-engine";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (!session?.user) redirect("/entrar?callbackUrl=/admin");
  if (session.user.role !== "ADMIN_STAFF") {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const twelveMonthsAgo = getTwelveMonthsAgo();

  const [memberships, properties, massageCerts, agencyEvents, quotes] = await Promise.all([
    prisma.membership.findMany({
      where: { user: { role: { not: "ADMIN_STAFF" } } },
      include: {
        user: true,
        b2bProfile: {
          include: { authorizedPeople: true },
        },
        transactions: {
          include: { property: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        rewardCertificates: {
          where: {
            type: "MASAJE_60_MIN",
            periodStart: { gte: twelveMonthsAgo },
            status: { not: "VENCIDO" },
          },
          select: { id: true },
        },
      },
      orderBy: { membershipNumber: "asc" },
    }),
    prisma.hotelProperty.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.rewardCertificate.findMany({
      where: {
        type: "MASAJE_60_MIN",
        status: { in: ["CITA_SOLICITADA", "CONFIRMADO"] },
      },
      include: {
        membership: { include: { user: true } },
        preferredProperty: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.agencyEvent.findMany({
      include: {
        property: true,
        membership: { include: { b2bProfile: true, user: true } },
      },
      orderBy: { eventDate: "desc" },
    }),
    prisma.quoteRequest.findMany({
      include: { property: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const memberRecords = memberships.map((m) => ({
    membershipId: m.id,
    membershipNumber: m.membershipNumber,
    qrToken: m.qrToken,
    fullName: `${m.user.firstName} ${m.user.lastName}`.trim(),
    email: m.user.email,
    phone: m.user.phone,
    role: m.user.role,
    tier: m.tier,
    status: m.status,
    pointsBalance: m.pointsBalance,
    cashBalanceMxn: toNumber(m.cashBalanceMxn),
    rolling12mSpendMxn: toNumber(m.rolling12mSpendMxn),
    rolling12mNights: m.rolling12mNights,
    rolling12mStaysCount: m.rolling12mStaysCount,
    fifthStayBonusClaimedAt: m.fifthStayBonusClaimedAt?.toISOString() ?? null,
    existingMassagesIn12m: m.rewardCertificates.length,
    legalName: m.b2bProfile?.legalName ?? null,
    rfc: m.b2bProfile?.rfc ?? null,
    authorizedPeople: (m.b2bProfile?.authorizedPeople ?? []).map((p) => ({
      id: p.id,
      fullName: p.fullName,
      roleInAccount: p.roleInAccount,
      isActive: p.isActive,
    })),
    recentLedgers: m.transactions.map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      propertyName: t.property?.name ?? null,
      netEligibleAmountMxn: toNumber(t.netEligibleAmountMxn),
      pointsDelta: t.pointsDelta,
      cashDeltaMxn: toNumber(t.cashDeltaMxn),
      createdAt: t.createdAt.toISOString(),
    })),
  }));

  const pendingB2B = memberships
    .filter((m) => m.status === "PENDIENTE_CONVENIO" && m.b2bProfile)
    .map((m) => ({
      membershipId: m.id,
      membershipNumber: m.membershipNumber,
      legalName: m.b2bProfile!.legalName,
      profileType: m.b2bProfile!.profileType,
      rfc: m.b2bProfile!.rfc,
      responsibleName: m.b2bProfile!.responsibleName,
      workEmail: m.b2bProfile!.workEmail,
      status: m.status,
    }));

  return (
    <AdminDashboardClient
      initialTab={sp.tab}
      members={memberRecords}
      properties={properties.map((p) => ({ id: p.id, slug: p.slug, name: p.name }))}
      pendingB2B={pendingB2B}
      massageRequests={massageCerts.map((c) => ({
        id: c.id,
        title: c.title,
        memberName: `${c.membership.user.firstName} ${c.membership.user.lastName}`.trim(),
        membershipNumber: c.membership.membershipNumber,
        status: c.status,
        propertyName: c.preferredProperty?.name ?? null,
        preferredDate: c.preferredDate?.toISOString() ?? null,
        preferredTimeSlot: c.preferredTimeSlot,
        expiresAt: c.expiresAt.toISOString(),
      }))}
      agencyEvents={agencyEvents.map((e) => ({
        id: e.id,
        code: e.code,
        agencyName:
          e.membership.b2bProfile?.legalName ??
          `${e.membership.user.firstName} ${e.membership.user.lastName}`.trim(),
        clientName: e.clientName,
        propertyName: e.property.name,
        eventDate: e.eventDate.toISOString(),
        netAmountMxn: toNumber(e.netAmountMxn),
        eventTier: e.eventTier,
        status: e.status,
        commissionPercentage: e.commissionPercentage,
        commissionAmountMxn: toNumber(e.commissionAmountMxn),
        commissionStatus: e.commissionStatus,
        pointsGenerated: e.pointsGenerated,
        rewardSummary: e.rewardSummary,
      }))}
      quoteRequests={quotes.map((q) => ({
        id: q.id,
        category: q.category,
        requesterType: q.requesterType,
        contactName: q.contactName,
        contactEmail: q.contactEmail,
        participantsCount: q.participantsCount,
        propertyName: q.property?.name ?? null,
        payWithPointsOrBalance: q.payWithPointsOrBalance,
        status: q.status,
        createdAt: q.createdAt.toISOString(),
      }))}
    />
  );
}

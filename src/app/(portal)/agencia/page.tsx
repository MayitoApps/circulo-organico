import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardPathForRole } from "@/auth.config";
import { AgenciaPortalClient } from "@/components/AgenciaPortalClient";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgenciaPortalPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/agencia");
  if (session.user.role !== "AGENCIA") {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
    include: {
      b2bProfile: true,
      agencyEvents: {
        include: { property: true },
        orderBy: { eventDate: "desc" },
      },
      rewardCertificates: {
        include: {
          preferredProperty: true,
          agencyEvent: { select: { code: true } },
        },
        orderBy: { expiresAt: "asc" },
      },
    },
  });

  if (!membership) {
    redirect("/entrar");
  }

  const realizedEvents = membership.agencyEvents.filter(
    (e) => e.status === "REALIZADO_Y_PAGADO"
  );
  const realizedTotalMxn = realizedEvents.reduce(
    (acc, e) => acc + toNumber(e.netAmountMxn),
    0
  );
  const commissionPaidMxn = realizedEvents
    .filter((e) => e.commissionStatus === "PAGADA")
    .reduce((acc, e) => acc + toNumber(e.commissionAmountMxn), 0);
  const commissionPendingMxn = realizedEvents
    .filter((e) => e.commissionStatus === "AUTORIZADA")
    .reduce((acc, e) => acc + toNumber(e.commissionAmountMxn), 0);

  return (
    <AgenciaPortalClient
      agencyName={
        membership.b2bProfile?.legalName ??
        `${session.user.firstName} ${session.user.lastName}`.trim()
      }
      rfc={membership.b2bProfile?.rfc ?? "—"}
      membershipNumber={membership.membershipNumber}
      qrToken={membership.qrToken}
      tier={membership.tier}
      status={membership.status}
      pointsBalance={membership.pointsBalance}
      realizedTotalMxn={realizedTotalMxn}
      commissionPaidMxn={commissionPaidMxn}
      commissionPendingMxn={commissionPendingMxn}
      events={membership.agencyEvents.map((e) => ({
        id: e.id,
        code: e.code,
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
        pointsReleased: e.pointsReleased,
        rewardSummary: e.rewardSummary,
      }))}
      certificates={membership.rewardCertificates.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        eventCode: c.agencyEvent?.code ?? null,
        beneficiaryName: c.beneficiaryName,
        status: c.status,
        propertyName: c.preferredProperty?.name ?? null,
        periodStart: c.periodStart.toISOString(),
        expiresAt: c.expiresAt.toISOString(),
      }))}
    />
  );
}

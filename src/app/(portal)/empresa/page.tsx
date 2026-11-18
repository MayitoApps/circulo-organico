import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardPathForRole } from "@/auth.config";
import { EmpresaPortalClient } from "@/components/EmpresaPortalClient";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EmpresaPortalPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/empresa");
  if (session.user.role !== "EMPRESA") {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.user.id },
    include: {
      b2bProfile: {
        include: {
          authorizedPeople: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      reservations: {
        include: { property: true },
        orderBy: { checkIn: "desc" },
      },
      transactions: {
        include: { property: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!membership || !membership.b2bProfile) {
    redirect("/entrar");
  }

  const totalEarnedMxn = membership.transactions
    .filter((t) => toNumber(t.cashDeltaMxn) > 0)
    .reduce((acc, t) => acc + toNumber(t.cashDeltaMxn), 0);

  const totalUsedMxn = membership.transactions
    .filter((t) => toNumber(t.cashDeltaMxn) < 0)
    .reduce((acc, t) => acc + Math.abs(toNumber(t.cashDeltaMxn)), 0);

  return (
    <EmpresaPortalClient
      legalName={membership.b2bProfile.legalName}
      rfc={membership.b2bProfile.rfc}
      businessActivity={membership.b2bProfile.businessActivity}
      responsibleName={membership.b2bProfile.responsibleName}
      responsibleRole={membership.b2bProfile.responsibleRole}
      workEmail={membership.b2bProfile.workEmail}
      contactPhone={membership.b2bProfile.contactPhone}
      fiscalAddress={membership.b2bProfile.fiscalAddress}
      agreedTariffNotes={membership.b2bProfile.agreedTariffNotes}
      agreementApprovedAt={membership.b2bProfile.agreementApprovedAt?.toISOString() ?? null}
      membershipNumber={membership.membershipNumber}
      qrToken={membership.qrToken}
      tier={membership.tier}
      status={membership.status}
      assignedAdvisorName={membership.assignedAdvisorName}
      rolling12mSpendMxn={toNumber(membership.rolling12mSpendMxn)}
      cashBalanceMxn={toNumber(membership.cashBalanceMxn)}
      totalEarnedMxn={Math.round(totalEarnedMxn * 100) / 100}
      totalUsedMxn={Math.round(totalUsedMxn * 100) / 100}
      reservations={membership.reservations.map((r) => ({
        id: r.id,
        propertyName: r.property.name,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        adults: r.adults,
        finalPriceMxn: toNumber(r.finalPriceMxn),
        requestedByPerson: r.requestedByPerson,
        status: r.status,
      }))}
      ledgers={membership.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        propertyName: t.property?.name ?? null,
        netEligibleAmountMxn: toNumber(t.netEligibleAmountMxn),
        cashDeltaMxn: toNumber(t.cashDeltaMxn),
        expiresAt: t.expiresAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
      }))}
      authorizedPeople={membership.b2bProfile.authorizedPeople.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        roleInAccount: p.roleInAccount,
        isActive: p.isActive,
      }))}
    />
  );
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateCorporateTier,
  evaluatePersonalTier,
  getTwelveMonthsAgo,
  PERSONAL_TIER_RULES,
  round2,
} from "@/lib/loyalty-engine";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function runMaintenanceJob() {
  const now = new Date();
  const twelveMonthsAgo = getTwelveMonthsAgo(now);

  // 1. Expirar certificados cuya vigencia terminó
  const expiredCertificates = await prisma.rewardCertificate.updateMany({
    where: {
      expiresAt: { lte: now },
      status: { in: ["DISPONIBLE", "CITA_SOLICITADA", "CONFIRMADO"] },
    },
    data: { status: "VENCIDO" },
  });

  // 2. Expirar puntos y saldo empresarial vencidos (24 meses desde emisión)
  const expiredLedgers = await prisma.transactionLedger.findMany({
    where: {
      expiresAt: { lte: now },
      expiredProcessed: false,
      OR: [{ pointsDelta: { gt: 0 } }, { cashDeltaMxn: { gt: 0 } }],
    },
    include: { membership: true },
  });

  let expiredPointsTotal = 0;
  let expiredCashTotal = 0;

  for (const ledger of expiredLedgers) {
    await prisma.$transaction(async (tx) => {
      const m = await tx.membership.findUnique({ where: { id: ledger.membershipId } });
      if (!m) return;

      const ptsToDeduct = Math.min(m.pointsBalance, Math.max(0, ledger.pointsDelta));
      const cashToDeduct = round2(
        Math.min(toNumber(m.cashBalanceMxn), Math.max(0, toNumber(ledger.cashDeltaMxn)))
      );

      if (ptsToDeduct > 0 || cashToDeduct > 0) {
        await tx.membership.update({
          where: { id: m.id },
          data: {
            pointsBalance: ptsToDeduct > 0 ? { decrement: ptsToDeduct } : undefined,
            cashBalanceMxn: cashToDeduct > 0 ? { decrement: cashToDeduct } : undefined,
          },
        });
        expiredPointsTotal += ptsToDeduct;
        expiredCashTotal = round2(expiredCashTotal + cashToDeduct);
      }

      await tx.transactionLedger.update({
        where: { id: ledger.id },
        data: { expiredProcessed: true },
      });
    });
  }

  // 3. Recalcular ventana móvil de 12 meses para Socios Personales y Empresas
  const memberships = await prisma.membership.findMany({
    include: {
      user: { select: { role: true } },
      transactions: {
        where: {
          createdAt: { gte: twelveMonthsAgo },
          type: { in: ["ESTANCIA_HOSPEDAJE", "COMPRA_EMPRESA"] },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let evaluatedMemberships = 0;
  let tierAdjustments = 0;

  for (const m of memberships) {
    if (m.user.role !== "SOCIO_PERSONAL" && m.user.role !== "EMPRESA") {
      continue;
    }

    const rollingSpend = round2(
      m.transactions.reduce((acc, t) => acc + toNumber(t.netEligibleAmountMxn), 0)
    );
    const rollingNights = m.transactions.reduce((acc, t) => acc + t.nightsCount, 0);
    const rollingStays = m.transactions.filter(
      (t) => t.type === "ESTANCIA_HOSPEDAJE" && !t.isConsecutiveStay
    ).length;

    const newTier =
      m.user.role === "SOCIO_PERSONAL"
        ? evaluatePersonalTier(rollingNights, rollingSpend)
        : evaluateCorporateTier(rollingSpend);

    const newDiscount =
      m.user.role === "SOCIO_PERSONAL"
        ? PERSONAL_TIER_RULES[newTier].discountPct
        : newTier === "DIAMANTE"
          ? 30
          : newTier === "ORO"
            ? 20
            : 15;

    if (newTier !== m.tier) tierAdjustments += 1;

    await prisma.membership.update({
      where: { id: m.id },
      data: {
        rolling12mSpendMxn: rollingSpend,
        rolling12mNights: rollingNights,
        rolling12mStaysCount: rollingStays,
        tier: newTier,
        discountPercentage: newDiscount,
      },
    });
    evaluatedMemberships += 1;
  }

  return {
    executedAt: now.toISOString(),
    rollingWindowStart: twelveMonthsAgo.toISOString(),
    evaluatedMemberships,
    tierAdjustments,
    expiredCertificatesCount: expiredCertificates.count,
    expiredLedgersCount: expiredLedgers.length,
    expiredPointsTotal,
    expiredCashTotal,
  };
}

async function authorizeCronRequest(req: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // También permite ejecución manual por un administrador autenticado en /admin
  const session = await auth();
  return session?.user?.role === "ADMIN_STAFF";
}

export async function GET(req: NextRequest) {
  const authorized = await authorizeCronRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await runMaintenanceJob();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Error en cron loyalty-maintenance:", err);
    return NextResponse.json(
      { ok: false, error: "Error ejecutando mantenimiento de lealtad" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

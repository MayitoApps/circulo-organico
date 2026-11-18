"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  addMonths,
  calculateAgencyEventBenefits,
  getTwelveMonthsAgo,
  LOYALTY_CONSTANTS,
  previewCorporateCharge,
  previewPersonalStayCharge,
  round2,
  validateRedemption,
} from "@/lib/loyalty-engine";
import { toNumber } from "@/lib/utils";

async function requireAdminStaff() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN_STAFF") {
    throw new Error("Acceso denegado: requiere permisos ADMIN_STAFF.");
  }
  return session.user;
}

const consumptionSchema = z.object({
  membershipId: z.string().min(1),
  propertyId: z.string().min(1),
  operationType: z.enum(["ESTANCIA_HOSPEDAJE", "COMPRA_EMPRESA", "EVENTO_AGENCIA"]),
  grossAmountMxn: z.number().nonnegative(),
  netEligibleAmountMxn: z.number().positive("El monto neto elegible debe ser mayor a $0"),
  nightsCount: z.number().int().min(0).default(0),
  checkInDate: z.string().optional().nullable(),
  checkOutDate: z.string().optional().nullable(),
  isConsecutiveStay: z.boolean().default(false),
  description: z.string().trim().min(3, "Agrega una descripción breve del consumo"),
  agencyClientName: z.string().optional().nullable(),
});

export async function recordAdminConsumptionAction(rawInput: unknown) {
  try {
    const admin = await requireAdminStaff();
    const parsed = consumptionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false as const,
        error: parsed.error.issues[0]?.message ?? "Revisa los datos de consumo.",
      };
    }

    const input = parsed.data;
    const now = new Date();
    const pointsExpiry = addMonths(now, LOYALTY_CONSTANTS.POINTS_EXPIRY_MONTHS);
    const certExpiry = addMonths(now, LOYALTY_CONSTANTS.CERTIFICATE_EXPIRY_MONTHS);
    const twelveMonthsAgo = getTwelveMonthsAgo(now);

    const summary = await prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { id: input.membershipId },
        include: {
          user: true,
          b2bProfile: true,
        },
      });
      if (!membership) throw new Error("Membresía no encontrada.");

      const property = await tx.hotelProperty.findUnique({
        where: { id: input.propertyId },
      });
      if (!property) throw new Error("Propiedad no encontrada.");

      if (input.operationType === "ESTANCIA_HOSPEDAJE") {
        if (membership.user.role !== "SOCIO_PERSONAL") {
          throw new Error("La operación Estancia Hospedaje corresponde a un Socio Personal.");
        }

        // Detectar estancia consecutiva automática si coincide checkIn con último checkOut en la misma sede
        let autoConsecutive = input.isConsecutiveStay;
        const checkIn = input.checkInDate ? new Date(`${input.checkInDate}T15:00:00.000Z`) : null;
        const checkOut = input.checkOutDate ? new Date(`${input.checkOutDate}T12:00:00.000Z`) : null;

        if (!autoConsecutive && checkIn) {
          const prevSameHotel = await tx.transactionLedger.findFirst({
            where: {
              membershipId: membership.id,
              propertyId: property.id,
              type: "ESTANCIA_HOSPEDAJE",
              checkOutDate: { not: null },
              createdAt: { gte: twelveMonthsAgo },
            },
            orderBy: { checkOutDate: "desc" },
          });
          if (prevSameHotel?.checkOutDate) {
            const gapHours = Math.abs(
              (checkIn.getTime() - prevSameHotel.checkOutDate.getTime()) / (1000 * 60 * 60)
            );
            if (gapHours <= 36) {
              autoConsecutive = true;
            }
          }
        }

        const existingMassagesCount = await tx.rewardCertificate.count({
          where: {
            membershipId: membership.id,
            type: "MASAJE_60_MIN",
            periodStart: { gte: twelveMonthsAgo },
            status: { not: "VENCIDO" },
          },
        });

        const preview = previewPersonalStayCharge({
          currentTier: membership.tier,
          currentRolling12mNights: membership.rolling12mNights,
          currentRolling12mSpendMxn: toNumber(membership.rolling12mSpendMxn),
          currentRolling12mStaysCount: membership.rolling12mStaysCount,
          fifthStayBonusClaimedAt: membership.fifthStayBonusClaimedAt,
          existingMassagesInCurrent12mPeriod: existingMassagesCount,
          netEligibleAmountMxn: input.netEligibleAmountMxn,
          nightsCount: input.nightsCount,
          isConsecutiveStay: autoConsecutive,
          transactionDate: now,
        });

        await tx.transactionLedger.create({
          data: {
            membershipId: membership.id,
            propertyId: property.id,
            type: "ESTANCIA_HOSPEDAJE",
            description: input.description,
            grossAmountMxn: round2(input.grossAmountMxn),
            netEligibleAmountMxn: round2(input.netEligibleAmountMxn),
            nightsCount: input.nightsCount,
            pointsDelta: preview.pointsFromStay,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            isConsecutiveStay: autoConsecutive,
            expiresAt: pointsExpiry,
            createdByAdminId: admin.id,
          },
        });

        if (preview.qualifiesForFifthStayBonus) {
          await tx.transactionLedger.create({
            data: {
              membershipId: membership.id,
              propertyId: property.id,
              type: "BONO_QUINTA_ESTANCIA",
              description: "Bono automático por 5ta estancia pagada en periodo de 12 meses",
              grossAmountMxn: 0,
              netEligibleAmountMxn: 0,
              nightsCount: 0,
              pointsDelta: preview.fifthStayBonusPoints,
              expiresAt: pointsExpiry,
              createdByAdminId: admin.id,
            },
          });
        }

        await tx.membership.update({
          where: { id: membership.id },
          data: {
            pointsBalance: { increment: preview.totalPointsToAdd },
            rolling12mSpendMxn: preview.newRolling12mSpendMxn,
            rolling12mNights: preview.newRolling12mNights,
            rolling12mStaysCount: preview.newRolling12mStaysCount,
            fifthStayBonusClaimedAt: preview.qualifiesForFifthStayBonus
              ? now
              : membership.fifthStayBonusClaimedAt,
            tier: preview.projectedTier,
            discountPercentage: preview.newDiscountPercentage,
            assignedAdvisorName:
              preview.projectedTier === "DIAMANTE"
                ? membership.assignedAdvisorName ?? "Asesor Personal Diamante · Grupo Orgánico"
                : membership.assignedAdvisorName,
          },
        });

        for (const certTitle of preview.newMassageCertificates) {
          await tx.rewardCertificate.create({
            data: {
              membershipId: membership.id,
              type: "MASAJE_60_MIN",
              title: certTitle,
              beneficiaryName: certTitle.includes("Titular")
                ? `${membership.user.firstName} ${membership.user.lastName}`
                : "Acompañante designado",
              status: "DISPONIBLE",
              periodStart: now,
              expiresAt: certExpiry,
            },
          });
        }

        return `Acreditados +${preview.totalPointsToAdd} pts (${preview.projectedTier})${
          preview.qualifiesForFifthStayBonus ? " · Incluye bono +200 pts 5ta estancia" : ""
        }${
          preview.newMassageCertificates.length > 0
            ? ` · ${preview.newMassageCertificates.length} certificado(s) de masaje emitido(s)`
            : ""
        }`;
      }

      if (input.operationType === "COMPRA_EMPRESA") {
        if (membership.user.role !== "EMPRESA") {
          throw new Error("La operación Compra Empresa corresponde a una cuenta EMPRESA.");
        }

        const preview = previewCorporateCharge({
          currentTier: membership.tier,
          currentRolling12mSpendMxn: toNumber(membership.rolling12mSpendMxn),
          netEligibleAmountMxn: input.netEligibleAmountMxn,
        });

        await tx.transactionLedger.create({
          data: {
            membershipId: membership.id,
            propertyId: property.id,
            type: "COMPRA_EMPRESA",
            description: input.description,
            grossAmountMxn: round2(input.grossAmountMxn),
            netEligibleAmountMxn: round2(input.netEligibleAmountMxn),
            nightsCount: input.nightsCount,
            cashDeltaMxn: preview.cashbackToAddMxn,
            expiresAt: pointsExpiry,
            createdByAdminId: admin.id,
          },
        });

        await tx.membership.update({
          where: { id: membership.id },
          data: {
            cashBalanceMxn: { increment: preview.cashbackToAddMxn },
            rolling12mSpendMxn: preview.newRolling12mSpendMxn,
            rolling12mNights: { increment: input.nightsCount },
            tier: preview.projectedTier,
            discountPercentage: preview.projectedTier === "DIAMANTE" ? 30 : preview.projectedTier === "ORO" ? 20 : 15,
            assignedAdvisorName:
              preview.projectedTier === "DIAMANTE"
                ? membership.assignedAdvisorName ?? "Ejecutivo Corporativo Diamante"
                : membership.assignedAdvisorName,
          },
        });

        return `Acreditados +$${preview.cashbackToAddMxn.toFixed(2)} MXN (2% saldo) · Nivel ${preview.projectedTier}`;
      }

      // EVENTO_AGENCIA liquidado directamente desde el cargador administrativo
      if (membership.user.role !== "AGENCIA") {
        throw new Error("La operación Liquidación de Evento Agencia corresponde a una cuenta AGENCIA.");
      }

      const benefits = calculateAgencyEventBenefits(input.netEligibleAmountMxn);
      const existingEvents = await tx.agencyEvent.findMany({ select: { code: true } });
      let maxNum = 205;
      for (const ev of existingEvents) {
        const n = parseInt(ev.code.replace(/\D+/g, ""), 10);
        if (!Number.isNaN(n) && n > maxNum) maxNum = n;
      }

      const createdEvent = await tx.agencyEvent.create({
        data: {
          code: `E${maxNum + 1}`,
          membershipId: membership.id,
          clientName: input.agencyClientName?.trim() || input.description,
          propertyId: property.id,
          eventDate: now,
          netAmountMxn: round2(input.netEligibleAmountMxn),
          eventTier: benefits.eventTier,
          status: "REALIZADO_Y_PAGADO",
          commissionPercentage: benefits.commissionPercentage,
          commissionAmountMxn: benefits.commissionAmountMxn,
          commissionStatus: benefits.commissionAmountMxn > 0 ? "AUTORIZADA" : "SIN_COMISION",
          pointsGenerated: benefits.pointsGenerated,
          pointsReleased: true,
          rewardSummary: benefits.rewardSummary,
        },
      });

      await tx.transactionLedger.create({
        data: {
          membershipId: membership.id,
          propertyId: property.id,
          type: "EVENTO_AGENCIA",
          description: `Liquidación evento ${createdEvent.code}: ${input.description}`,
          grossAmountMxn: round2(input.grossAmountMxn),
          netEligibleAmountMxn: round2(input.netEligibleAmountMxn),
          pointsDelta: benefits.pointsGenerated,
          expiresAt: pointsExpiry,
          createdByAdminId: admin.id,
        },
      });

      await tx.membership.update({
        where: { id: membership.id },
        data: {
          pointsBalance: { increment: benefits.pointsGenerated },
          rolling12mSpendMxn: { increment: round2(input.netEligibleAmountMxn) },
          rolling12mStaysCount: { increment: 1 },
        },
      });

      if (benefits.giftNights === 1) {
        await tx.rewardCertificate.create({
          data: {
            membershipId: membership.id,
            agencyEventId: createdEvent.id,
            type: "NOCHE_REGALO_1",
            title: `Certificado 1 noche para 2 adultos (${createdEvent.code})`,
            beneficiaryName: "Por designar",
            status: "DISPONIBLE",
            preferredPropertyId: property.id,
            periodStart: now,
            expiresAt: certExpiry,
          },
        });
      } else if (benefits.giftNights === 2) {
        await tx.rewardCertificate.create({
          data: {
            membershipId: membership.id,
            agencyEventId: createdEvent.id,
            type: "NOCHES_REGALO_2",
            title: `Certificado 2 noches seguidas para 2 adultos (${createdEvent.code})`,
            beneficiaryName: "Por designar",
            status: "DISPONIBLE",
            preferredPropertyId: property.id,
            periodStart: now,
            expiresAt: certExpiry,
          },
        });
      }

      if (benefits.giftMassages >= 1) {
        await tx.rewardCertificate.create({
          data: {
            membershipId: membership.id,
            agencyEventId: createdEvent.id,
            type: "MASAJE_60_MIN",
            title: `Masaje relajante 60 min · 1 persona (${createdEvent.code})`,
            beneficiaryName: "Por designar",
            status: "DISPONIBLE",
            preferredPropertyId: property.id,
            periodStart: now,
            expiresAt: certExpiry,
          },
        });
      }

      return `Evento ${createdEvent.code} (${benefits.eventTier}) liquidado · +${benefits.pointsGenerated} pts · Comisión $${benefits.commissionAmountMxn.toLocaleString("es-MX")} MXN`;
    });

    revalidatePath("/admin");
    revalidatePath("/mi-circulo");
    revalidatePath("/empresa");
    revalidatePath("/agencia");

    return { ok: true as const, summary };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No fue posible registrar el consumo.",
    };
  }
}

const redemptionSchema = z.object({
  membershipId: z.string().min(1),
  propertyId: z.string().optional().nullable(),
  purpose: z.enum(["HOSPEDAJE", "EVENTO_EMPRESA", "PREMIO_CATALOGO"]),
  eligibleBaseAmountMxn: z.number().positive(),
  requestedAmountMxn: z.number().positive(),
  authorizedPersonId: z.string().optional().nullable(),
  description: z.string().trim().min(3),
});

export async function processAdminRedemptionAction(rawInput: unknown) {
  try {
    const admin = await requireAdminStaff();
    const parsed = redemptionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false as const, error: "Revisa los datos del canje." };
    }

    const input = parsed.data;

    await prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { id: input.membershipId },
        include: {
          user: true,
          b2bProfile: { include: { authorizedPeople: true } },
        },
      });
      if (!membership) throw new Error("Membresía no encontrada.");
      if (membership.user.role === "ADMIN_STAFF") {
        throw new Error("Las cuentas administrativas no realizan canjes.");
      }

      let isAuthorizedPerson = true;
      if (membership.user.role === "EMPRESA") {
        const people = membership.b2bProfile?.authorizedPeople ?? [];
        if (input.authorizedPersonId) {
          const person = people.find((p) => p.id === input.authorizedPersonId);
          isAuthorizedPerson = Boolean(
            person && person.isActive && person.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
          );
        } else {
          isAuthorizedPerson = people.some(
            (p) => p.isActive && p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
          );
        }
      }

      const available =
        membership.user.role === "EMPRESA"
          ? toNumber(membership.cashBalanceMxn)
          : membership.pointsBalance;

      const validation = validateRedemption({
        profileRole: membership.user.role,
        purpose: input.purpose,
        eligibleBaseAmountMxn: input.eligibleBaseAmountMxn,
        requestedAmountMxn: input.requestedAmountMxn,
        availableBalance: available,
        isAuthorizedPerson,
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const amount = validation.approvedAmountMxn;

      if (membership.user.role === "EMPRESA") {
        const updated = await tx.membership.updateMany({
          where: { id: membership.id, cashBalanceMxn: { gte: amount } },
          data: { cashBalanceMxn: { decrement: amount } },
        });
        if (updated.count === 0) throw new Error("Saldo empresarial insuficiente.");

        await tx.transactionLedger.create({
          data: {
            membershipId: membership.id,
            propertyId: input.propertyId || null,
            type: "CANJE_SALDO",
            description: input.description,
            grossAmountMxn: round2(input.eligibleBaseAmountMxn),
            netEligibleAmountMxn: round2(input.eligibleBaseAmountMxn - amount),
            cashDeltaMxn: -amount,
            createdByAdminId: admin.id,
          },
        });
      } else {
        const pts = Math.round(amount);
        const updated = await tx.membership.updateMany({
          where: { id: membership.id, pointsBalance: { gte: pts } },
          data: { pointsBalance: { decrement: pts } },
        });
        if (updated.count === 0) throw new Error("Puntos insuficientes.");

        await tx.transactionLedger.create({
          data: {
            membershipId: membership.id,
            propertyId: input.propertyId || null,
            type: "CANJE_PUNTOS",
            description: input.description,
            grossAmountMxn: round2(input.eligibleBaseAmountMxn),
            netEligibleAmountMxn: round2(input.eligibleBaseAmountMxn - pts),
            pointsDelta: -pts,
            createdByAdminId: admin.id,
          },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath("/mi-circulo");
    revalidatePath("/empresa");
    revalidatePath("/agencia");

    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Error al procesar el canje.",
    };
  }
}

export async function approveOrRejectB2BAction(params: {
  membershipId: string;
  action: "APPROVE" | "REJECT";
  agreedTariffNotes?: string;
  discountPercentage?: number;
}) {
  try {
    await requireAdminStaff();
    await prisma.$transaction(async (tx) => {
      await tx.membership.update({
        where: { id: params.membershipId },
        data: {
          status: params.action === "APPROVE" ? "ACTIVA" : "SUSPENDIDA",
          discountPercentage:
            params.action === "APPROVE" && params.discountPercentage
              ? params.discountPercentage
              : undefined,
        },
      });
      if (params.action === "APPROVE") {
        await tx.b2BProfile.updateMany({
          where: { membershipId: params.membershipId },
          data: {
            agreementApprovedAt: new Date(),
            agreedTariffNotes:
              params.agreedTariffNotes?.trim() || "Convenio corporativo aprobado por recepción/ventas.",
          },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath("/empresa");
    revalidatePath("/agencia");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No fue posible actualizar el convenio.",
    };
  }
}

export async function updateMassageCertificateStatusAction(params: {
  certificateId: string;
  status: "CONFIRMADO" | "USADO";
}) {
  try {
    await requireAdminStaff();
    await prisma.rewardCertificate.update({
      where: { id: params.certificateId },
      data: { status: params.status },
    });

    revalidatePath("/admin");
    revalidatePath("/mi-circulo");
    revalidatePath("/mi-circulo/masaje");
    revalidatePath("/agencia");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Error al actualizar la cita de bienestar.",
    };
  }
}

export async function settleAgencyEventAction(eventId: string) {
  try {
    const admin = await requireAdminStaff();
    const now = new Date();
    const pointsExpiry = addMonths(now, LOYALTY_CONSTANTS.POINTS_EXPIRY_MONTHS);
    const certExpiry = addMonths(now, LOYALTY_CONSTANTS.CERTIFICATE_EXPIRY_MONTHS);

    await prisma.$transaction(async (tx) => {
      const event = await tx.agencyEvent.findUnique({
        where: { id: eventId },
        include: { property: true },
      });
      if (!event) throw new Error("Evento no encontrado.");
      if (event.status === "REALIZADO_Y_PAGADO") {
        throw new Error("Este evento ya fue liquidado previamente.");
      }

      const benefits = calculateAgencyEventBenefits(toNumber(event.netAmountMxn));

      await tx.agencyEvent.update({
        where: { id: event.id },
        data: {
          status: "REALIZADO_Y_PAGADO",
          eventTier: benefits.eventTier,
          commissionPercentage: benefits.commissionPercentage,
          commissionAmountMxn: benefits.commissionAmountMxn,
          commissionStatus: benefits.commissionAmountMxn > 0 ? "AUTORIZADA" : "SIN_COMISION",
          pointsGenerated: benefits.pointsGenerated,
          pointsReleased: true,
          rewardSummary: benefits.rewardSummary,
        },
      });

      await tx.transactionLedger.create({
        data: {
          membershipId: event.membershipId,
          propertyId: event.propertyId,
          type: "EVENTO_AGENCIA",
          description: `Liquidación evento ${event.code} · ${event.property.name} (${benefits.eventTier})`,
          grossAmountMxn: event.netAmountMxn,
          netEligibleAmountMxn: event.netAmountMxn,
          pointsDelta: benefits.pointsGenerated,
          expiresAt: pointsExpiry,
          createdByAdminId: admin.id,
        },
      });

      await tx.membership.update({
        where: { id: event.membershipId },
        data: {
          pointsBalance: { increment: benefits.pointsGenerated },
          rolling12mSpendMxn: { increment: event.netAmountMxn },
          rolling12mStaysCount: { increment: 1 },
        },
      });

      if (benefits.giftNights === 1) {
        await tx.rewardCertificate.create({
          data: {
            membershipId: event.membershipId,
            agencyEventId: event.id,
            type: "NOCHE_REGALO_1",
            title: `Certificado 1 noche de regalo para 2 adultos (${event.code})`,
            beneficiaryName: "Por designar",
            status: "DISPONIBLE",
            preferredPropertyId: event.propertyId,
            periodStart: now,
            expiresAt: certExpiry,
          },
        });
      } else if (benefits.giftNights === 2) {
        await tx.rewardCertificate.create({
          data: {
            membershipId: event.membershipId,
            agencyEventId: event.id,
            type: "NOCHES_REGALO_2",
            title: `Certificado 2 noches seguidas para 2 adultos (${event.code})`,
            beneficiaryName: "Por designar",
            status: "DISPONIBLE",
            preferredPropertyId: event.propertyId,
            periodStart: now,
            expiresAt: certExpiry,
          },
        });
      }

      if (benefits.giftMassages >= 1) {
        await tx.rewardCertificate.create({
          data: {
            membershipId: event.membershipId,
            agencyEventId: event.id,
            type: "MASAJE_60_MIN",
            title: `Masaje relajante de 60 min · 1 persona (${event.code})`,
            beneficiaryName: "Por designar",
            status: "DISPONIBLE",
            preferredPropertyId: event.propertyId,
            periodStart: now,
            expiresAt: certExpiry,
          },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath("/agencia");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No fue posible liquidar el evento.",
    };
  }
}

export async function markAgencyCommissionPaidAction(eventId: string) {
  try {
    await requireAdminStaff();
    const event = await prisma.agencyEvent.findUnique({ where: { id: eventId } });
    if (!event) return { ok: false as const, error: "Evento no encontrado." };
    if (event.commissionStatus !== "AUTORIZADA") {
      return { ok: false as const, error: "Solo comisiones AUTORIZADAS pueden marcarse como PAGADAS." };
    }

    await prisma.agencyEvent.update({
      where: { id: eventId },
      data: { commissionStatus: "PAGADA" },
    });

    revalidatePath("/admin");
    revalidatePath("/agencia");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Error al actualizar comisión.",
    };
  }
}

export async function updateQuoteStatusAction(
  quoteId: string,
  status: "NUEVA" | "EN_REVISION" | "COTIZADA"
) {
  try {
    await requireAdminStaff();
    await prisma.quoteRequest.update({
      where: { id: quoteId },
      data: { status },
    });
    revalidatePath("/admin");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Error al actualizar cotización.",
    };
  }
}

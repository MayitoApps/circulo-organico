"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  addMonths,
  calculateAgencyEventBenefits,
  LOYALTY_CONSTANTS,
  PERSONAL_TIER_RULES,
  round2,
  simulateDirectStay,
  STAY_COURTESIES_CATALOG,
  validateRedemption,
} from "@/lib/loyalty-engine";
import { MOMENTOS_ORGANICO } from "@/lib/catalog-data";
import { toNumber } from "@/lib/utils";

const massageRequestSchema = z.object({
  certificateId: z.string().min(1),
  propertySlug: z.string().min(1, "Selecciona una sede"),
  preferredDate: z.string().min(1, "Selecciona una fecha"),
  preferredTimeSlot: z.string().min(1, "Selecciona un horario"),
});

export async function requestMassageAppointmentAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SOCIO_PERSONAL" || !session.user.membershipId) {
    return { ok: false as const, error: "Debes iniciar sesión como Socio Personal." };
  }

  const parsed = massageRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos incompletos." };
  }

  const { certificateId, propertySlug, preferredDate, preferredTimeSlot } = parsed.data;

  try {
    const property = await prisma.hotelProperty.findUnique({
      where: { slug: propertySlug },
    });
    if (!property || !property.hasSpaCenter) {
      return { ok: false as const, error: "Sede de bienestar no válida." };
    }

    const cert = await prisma.rewardCertificate.findFirst({
      where: {
        id: certificateId,
        membershipId: session.user.membershipId,
        type: "MASAJE_60_MIN",
      },
    });

    if (!cert) {
      return { ok: false as const, error: "Certificado de masaje no encontrado." };
    }
    if (cert.status !== "DISPONIBLE") {
      return { ok: false as const, error: "Este masaje ya tiene una solicitud o fue utilizado." };
    }
    if (cert.expiresAt <= new Date()) {
      return { ok: false as const, error: "Este certificado ha vencido." };
    }

    await prisma.rewardCertificate.update({
      where: { id: cert.id },
      data: {
        status: "CITA_SOLICITADA",
        preferredPropertyId: property.id,
        preferredDate: new Date(`${preferredDate}T12:00:00.000Z`),
        preferredTimeSlot,
      },
    });

    revalidatePath("/mi-circulo");
    revalidatePath("/mi-circulo/masaje");
    revalidatePath("/admin");

    return { ok: true as const };
  } catch (err) {
    console.error("Error requestMassageAppointmentAction:", err);
    return { ok: false as const, error: "No fue posible registrar la solicitud de masaje." };
  }
}

const courtesiesSchema = z.object({
  reservationId: z.string().min(1),
  courtesy1: z.string().optional().nullable(),
  courtesy2: z.string().optional().nullable(),
});

export async function updateReservationCourtesiesAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SOCIO_PERSONAL" || !session.user.membershipId) {
    return { ok: false as const, error: "Sesión de Socio Personal requerida." };
  }

  const parsed = courtesiesSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Selección inválida." };
  }

  const validTitles = new Set(STAY_COURTESIES_CATALOG.map((c) => c.title));

  try {
    const membership = await prisma.membership.findUnique({
      where: { id: session.user.membershipId },
    });
    if (!membership) return { ok: false as const, error: "Membresía no encontrada." };

    const maxCourtesies = PERSONAL_TIER_RULES[membership.tier].courtesiesPer2PlusNights;
    if (maxCourtesies === 0) {
      return {
        ok: false as const,
        error: "Las cortesías en estancia aplican a partir de nivel Oro en estancias de 2+ noches.",
      };
    }

    const reservation = await prisma.reservation.findFirst({
      where: { id: parsed.data.reservationId, membershipId: membership.id },
    });
    if (!reservation) {
      return { ok: false as const, error: "Reserva no encontrada." };
    }
    if (reservation.nights < 2) {
      return {
        ok: false as const,
        error: "Las cortesías aplican únicamente en estancias de 2 noches pagadas o más.",
      };
    }

    const c1 = parsed.data.courtesy1?.trim() || null;
    const c2 = maxCourtesies >= 2 ? parsed.data.courtesy2?.trim() || null : null;

    if (c1 && !validTitles.has(c1)) {
      return { ok: false as const, error: "Cortesía 1 no válida." };
    }
    if (c2 && !validTitles.has(c2)) {
      return { ok: false as const, error: "Cortesía 2 no válida." };
    }
    if (c1 && c2 && c1 === c2) {
      return { ok: false as const, error: "En nivel Diamante debes elegir 2 cortesías distintas." };
    }

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        selectedCourtesy1: c1,
        selectedCourtesy2: c2,
      },
    });

    revalidatePath("/mi-circulo");
    return { ok: true as const };
  } catch (err) {
    console.error("Error updateReservationCourtesiesAction:", err);
    return { ok: false as const, error: "No fue posible guardar las cortesías." };
  }
}

const directReservationSchema = z.object({
  propertySlug: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.number().int().min(1).max(20),
  pointsOrCashToUse: z.number().min(0).default(0),
  courtesy1: z.string().optional().nullable(),
  courtesy2: z.string().optional().nullable(),
  earlyCheckInRequested: z.boolean().default(false),
  lateCheckOutRequested: z.boolean().default(false),
});

export async function createDirectReservationAction(rawInput: unknown) {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.membershipId ||
    (session.user.role !== "SOCIO_PERSONAL" && session.user.role !== "EMPRESA")
  ) {
    return { ok: false as const, error: "Inicia sesión como Socio Personal o Empresa." };
  }

  const parsed = directReservationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Revisa las fechas y huéspedes de la reserva." };
  }

  const data = parsed.data;
  const checkInDate = new Date(`${data.checkIn}T15:00:00.000Z`);
  const checkOutDate = new Date(`${data.checkOut}T12:00:00.000Z`);
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (nights < 1 || Number.isNaN(nights)) {
    return { ok: false as const, error: "La fecha de salida debe ser posterior a la llegada." };
  }

  try {
    const property = await prisma.hotelProperty.findUnique({
      where: { slug: data.propertySlug },
    });
    if (!property) return { ok: false as const, error: "Propiedad no encontrada." };

    const result = await prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { id: session.user.membershipId! },
      });
      if (!membership) throw new Error("Membresía no encontrada.");

      const sim = simulateDirectStay({
        baseNightPriceMxn: toNumber(property.baseNightPriceMxn),
        nights,
        tier: membership.tier,
        availablePoints:
          session.user.role === "SOCIO_PERSONAL"
            ? membership.pointsBalance
            : toNumber(membership.cashBalanceMxn),
        pointsToUse: data.pointsOrCashToUse,
      });

      let appliedUseMxn = 0;
      if (data.pointsOrCashToUse > 0) {
        const available =
          session.user.role === "SOCIO_PERSONAL"
            ? membership.pointsBalance
            : toNumber(membership.cashBalanceMxn);

        const validation = validateRedemption({
          profileRole: session.user.role === "EMPRESA" ? "EMPRESA" : "SOCIO_PERSONAL",
          purpose: "HOSPEDAJE",
          eligibleBaseAmountMxn: sim.priceAfterDiscountMxn,
          requestedAmountMxn: data.pointsOrCashToUse,
          availableBalance: available,
          isAuthorizedPerson: true,
        });

        if (!validation.valid) {
          throw new Error(validation.error);
        }
        appliedUseMxn = validation.approvedAmountMxn;

        if (session.user.role === "SOCIO_PERSONAL") {
          const updated = await tx.membership.updateMany({
            where: {
              id: membership.id,
              pointsBalance: { gte: Math.round(appliedUseMxn) },
            },
            data: { pointsBalance: { decrement: Math.round(appliedUseMxn) } },
          });
          if (updated.count === 0) throw new Error("Puntos insuficientes.");

          await tx.transactionLedger.create({
            data: {
              membershipId: membership.id,
              propertyId: property.id,
              type: "CANJE_PUNTOS",
              description: `Canje de puntos en reserva directa (${property.name})`,
              grossAmountMxn: sim.priceAfterDiscountMxn,
              netEligibleAmountMxn: round2(sim.priceAfterDiscountMxn - appliedUseMxn),
              pointsDelta: -Math.round(appliedUseMxn),
            },
          });
        } else {
          const updated = await tx.membership.updateMany({
            where: {
              id: membership.id,
              cashBalanceMxn: { gte: appliedUseMxn },
            },
            data: { cashBalanceMxn: { decrement: appliedUseMxn } },
          });
          if (updated.count === 0) throw new Error("Saldo empresarial insuficiente.");

          await tx.transactionLedger.create({
            data: {
              membershipId: membership.id,
              propertyId: property.id,
              type: "CANJE_SALDO",
              description: `Aplicación de saldo en reserva directa (${property.name})`,
              grossAmountMxn: sim.priceAfterDiscountMxn,
              netEligibleAmountMxn: round2(sim.priceAfterDiscountMxn - appliedUseMxn),
              cashDeltaMxn: -appliedUseMxn,
            },
          });
        }
      }

      const finalPriceMxn = round2(sim.priceAfterDiscountMxn - appliedUseMxn);
      const reservation = await tx.reservation.create({
        data: {
          membershipId: membership.id,
          propertyId: property.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          adults: data.adults,
          baseAmountMxn: sim.grossAmountMxn,
          discountAppliedMxn: sim.discountAmountMxn,
          pointsOrCashUsedMxn: appliedUseMxn,
          finalPriceMxn,
          selectedCourtesy1: nights >= 2 ? data.courtesy1 || null : null,
          selectedCourtesy2: nights >= 2 && membership.tier === "DIAMANTE" ? data.courtesy2 || null : null,
          earlyCheckInRequested: data.earlyCheckInRequested,
          lateCheckOutRequested: data.lateCheckOutRequested,
          requestedByPerson: `${session.user.firstName} ${session.user.lastName}`.trim(),
          status: "POR_CONFIRMAR",
        },
      });

      return reservation;
    });

    revalidatePath("/mi-circulo");
    revalidatePath("/empresa");
    revalidatePath("/admin");

    return { ok: true as const, reservationId: result.id };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No fue posible crear la reserva.",
    };
  }
}

export async function redeemCatalogExperienceAction(experienceId: string) {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.membershipId ||
    (session.user.role !== "SOCIO_PERSONAL" && session.user.role !== "EMPRESA")
  ) {
    return { ok: false as const, error: "Inicia sesión para canjear experiencias del catálogo." };
  }

  const moment = MOMENTOS_ORGANICO.find((m) => m.id === experienceId);
  if (!moment) {
    return { ok: false as const, error: "Experiencia no encontrada en el catálogo." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { id: session.user.membershipId! },
      });
      if (!membership) throw new Error("Membresía no encontrada.");

      const role = session.user.role === "EMPRESA" ? "EMPRESA" : "SOCIO_PERSONAL";
      const available =
        role === "EMPRESA" ? toNumber(membership.cashBalanceMxn) : membership.pointsBalance;

      const validation = validateRedemption({
        profileRole: role,
        purpose: "PREMIO_CATALOGO",
        eligibleBaseAmountMxn: moment.pointsCost,
        requestedAmountMxn: moment.pointsCost,
        availableBalance: available,
        isAuthorizedPerson: true,
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (role === "SOCIO_PERSONAL") {
        const res = await tx.membership.updateMany({
          where: { id: membership.id, pointsBalance: { gte: moment.pointsCost } },
          data: { pointsBalance: { decrement: moment.pointsCost } },
        });
        if (res.count === 0) throw new Error("Puntos insuficientes.");

        await tx.transactionLedger.create({
          data: {
            membershipId: membership.id,
            type: "CANJE_PUNTOS",
            description: `Canje 100% premio de catálogo: ${moment.title}`,
            grossAmountMxn: moment.mxnReference,
            netEligibleAmountMxn: 0,
            pointsDelta: -moment.pointsCost,
          },
        });
      } else {
        const res = await tx.membership.updateMany({
          where: { id: membership.id, cashBalanceMxn: { gte: moment.mxnReference } },
          data: { cashBalanceMxn: { decrement: moment.mxnReference } },
        });
        if (res.count === 0) throw new Error("Saldo insuficiente.");

        await tx.transactionLedger.create({
          data: {
            membershipId: membership.id,
            type: "CANJE_SALDO",
            description: `Canje 100% premio de catálogo: ${moment.title}`,
            grossAmountMxn: moment.mxnReference,
            netEligibleAmountMxn: 0,
            cashDeltaMxn: -moment.mxnReference,
          },
        });
      }

      const now = new Date();
      await tx.rewardCertificate.create({
        data: {
          membershipId: membership.id,
          type: "PREMIO_CATALOGO",
          title: moment.title,
          beneficiaryName: `${session.user.firstName} ${session.user.lastName}`.trim(),
          status: "DISPONIBLE",
          periodStart: now,
          expiresAt: addMonths(now, LOYALTY_CONSTANTS.CERTIFICATE_EXPIRY_MONTHS),
        },
      });
    });

    revalidatePath("/mi-circulo");
    revalidatePath("/empresa");
    revalidatePath("/experiencias");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No fue posible canjear el premio.",
    };
  }
}

const addAuthorizedSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8),
  roleInAccount: z.enum(["RESERVA_Y_ADMINISTRA", "AUTORIZA_PREMIOS_Y_SALDO"]),
});

export async function addAuthorizedPersonAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPRESA" || !session.user.membershipId) {
    return { ok: false as const, error: "Acceso exclusivo para cuentas Empresa." };
  }

  const parsed = addAuthorizedSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Verifica los datos del colaborador." };
  }

  try {
    const b2b = await prisma.b2BProfile.findUnique({
      where: { membershipId: session.user.membershipId },
    });
    if (!b2b) return { ok: false as const, error: "Perfil corporativo no encontrado." };

    await prisma.authorizedPerson.create({
      data: {
        b2bProfileId: b2b.id,
        fullName: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        roleInAccount: parsed.data.roleInAccount,
        isActive: true,
      },
    });

    revalidatePath("/empresa");
    return { ok: true as const };
  } catch (err) {
    console.error("Error addAuthorizedPersonAction:", err);
    return { ok: false as const, error: "No fue posible agregar al colaborador." };
  }
}

export async function toggleAuthorizedPersonAction(personId: string, nextActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPRESA" || !session.user.membershipId) {
    return { ok: false as const, error: "Acceso exclusivo para cuentas Empresa." };
  }

  try {
    const b2b = await prisma.b2BProfile.findUnique({
      where: { membershipId: session.user.membershipId },
    });
    if (!b2b) return { ok: false as const, error: "Perfil corporativo no encontrado." };

    await prisma.authorizedPerson.updateMany({
      where: { id: personId, b2bProfileId: b2b.id },
      data: { isActive: nextActive },
    });

    revalidatePath("/empresa");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "No fue posible actualizar la autorización." };
  }
}

const agencyProspectSchema = z.object({
  clientName: z.string().trim().min(2, "Ingresa el nombre del cliente final"),
  propertySlug: z.string().min(1, "Selecciona la sede"),
  eventDate: z.string().min(1, "Selecciona la fecha tentativa"),
  netAmountMxn: z.number().positive("Ingresa el monto neto estimado"),
});

export async function registerAgencyEventProspectAction(rawInput: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "AGENCIA" || !session.user.membershipId) {
    return { ok: false as const, error: "Acceso exclusivo para cuentas Agencia." };
  }

  const parsed = agencyProspectSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const property = await prisma.hotelProperty.findUnique({
      where: { slug: parsed.data.propertySlug },
    });
    if (!property) return { ok: false as const, error: "Sede no válida." };

    const benefits = calculateAgencyEventBenefits(parsed.data.netAmountMxn);
    const existingEvents = await prisma.agencyEvent.findMany({
      select: { code: true },
    });

    let maxNum = 205;
    for (const ev of existingEvents) {
      const n = parseInt(ev.code.replace(/\D+/g, ""), 10);
      if (!Number.isNaN(n) && n > maxNum) maxNum = n;
    }

    await prisma.agencyEvent.create({
      data: {
        code: `E${maxNum + 1}`,
        membershipId: session.user.membershipId,
        clientName: parsed.data.clientName,
        propertyId: property.id,
        eventDate: new Date(`${parsed.data.eventDate}T12:00:00.000Z`),
        netAmountMxn: round2(parsed.data.netAmountMxn),
        eventTier: benefits.eventTier,
        status: "PROXIMO_EVENTO",
        commissionPercentage: benefits.commissionPercentage,
        commissionAmountMxn: benefits.commissionAmountMxn,
        commissionStatus: "SIN_COMISION",
        pointsGenerated: benefits.pointsGenerated,
        pointsReleased: false,
        rewardSummary: benefits.rewardSummary,
      },
    });

    revalidatePath("/agencia");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch (err) {
    console.error("Error registerAgencyEventProspectAction:", err);
    return { ok: false as const, error: "No fue posible registrar el evento." };
  }
}

export async function designateCertificateBeneficiaryAction(
  certificateId: string,
  beneficiaryName: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "AGENCIA" || !session.user.membershipId) {
    return { ok: false as const, error: "Acceso exclusivo para cuentas Agencia." };
  }

  const trimmed = beneficiaryName.trim();
  if (trimmed.length < 2) {
    return { ok: false as const, error: "Ingresa el nombre completo del beneficiario." };
  }

  try {
    const res = await prisma.rewardCertificate.updateMany({
      where: {
        id: certificateId,
        membershipId: session.user.membershipId,
      },
      data: { beneficiaryName: trimmed },
    });
    if (res.count === 0) {
      return { ok: false as const, error: "Certificado no encontrado." };
    }

    revalidatePath("/agencia");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "No fue posible asignar el beneficiario." };
  }
}

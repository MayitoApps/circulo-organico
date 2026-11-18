"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatMembershipNumber } from "@/lib/loyalty-engine";

const registerPersonalSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa tu nombre"),
  lastName: z.string().trim().min(2, "Ingresa tus apellidos"),
  email: z.string().trim().email("Correo electrónico no válido"),
  phone: z.string().trim().min(8, "Ingresa un teléfono o celular válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  acceptRules: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar las reglas del programa Círculo Orgánico" }),
  }),
  acceptMarketing: z.boolean().default(false),
});

const authorizedPersonSchema = z.object({
  fullName: z.string().trim().min(2, "Nombre completo requerido"),
  email: z.string().trim().email("Correo válido requerido"),
  phone: z.string().trim().min(8, "Teléfono requerido"),
  roleInAccount: z.enum(["RESERVA_Y_ADMINISTRA", "AUTORIZA_PREMIOS_Y_SALDO"]),
});

const registerB2BSchema = z.object({
  profileType: z.enum(["EMPRESA", "AGENCIA"]),
  legalName: z.string().trim().min(2, "Razón social o nombre comercial requerido"),
  rfc: z
    .string()
    .trim()
    .min(10, "RFC inválido")
    .max(15, "RFC inválido"),
  businessActivity: z.string().trim().min(2, "Actividad o giro requerido"),
  responsibleName: z.string().trim().min(2, "Nombre de la persona responsable requerido"),
  responsibleRole: z.string().trim().min(2, "Cargo requerido"),
  workEmail: z.string().trim().email("Correo corporativo no válido"),
  contactPhone: z.string().trim().min(8, "Teléfono de contacto requerido"),
  fiscalAddress: z.string().trim().min(8, "Domicilio fiscal completo requerido"),
  needsLodging: z.boolean().default(true),
  needsOtamEvents: z.boolean().default(false),
  needsAmanecerMerch: z.boolean().default(false),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  acceptRules: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos del convenio" }),
  }),
  authorizedPeople: z
    .array(authorizedPersonSchema)
    .min(1, "Agrega al menos una persona autorizada en la cuenta"),
});

async function generateNextMembershipNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
): Promise<string> {
  const existing = await tx.membership.findMany({
    select: { membershipNumber: true },
  });
  let maxSeq = 248;
  for (const row of existing) {
    const numeric = parseInt(row.membershipNumber.replace(/\s+/g, ""), 10);
    if (!Number.isNaN(numeric) && numeric > maxSeq) {
      maxSeq = numeric;
    }
  }
  return formatMembershipNumber(maxSeq + 1);
}

export async function registerPersonalAction(rawInput: unknown) {
  const parsed = registerPersonalSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.",
    };
  }

  const data = parsed.data;
  const normalizedEmail = data.email.toLowerCase();

  try {
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return {
        ok: false as const,
        error: "Ya existe una cuenta registrada con ese correo electrónico.",
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await prisma.$transaction(async (tx) => {
      const membershipNumber = await generateNextMembershipNumber(tx);
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: "SOCIO_PERSONAL",
          acceptMarketing: data.acceptMarketing,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          membershipNumber,
          tier: "ORIGEN",
          status: "ACTIVA",
          discountPercentage: 15,
        },
      });

      return { user, membership };
    });

    return {
      ok: true as const,
      membershipNumber: created.membership.membershipNumber,
      email: created.user.email,
      redirectTo: "/mi-circulo",
    };
  } catch (err) {
    console.error("Error en registerPersonalAction:", err);
    return {
      ok: false as const,
      error: "No fue posible crear tu membresía. Verifica la conexión con la base de datos.",
    };
  }
}

export async function registerB2BAction(rawInput: unknown) {
  const parsed = registerB2BSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Revisa los campos del formulario.",
    };
  }

  const data = parsed.data;
  const normalizedEmail = data.workEmail.toLowerCase();

  try {
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return {
        ok: false as const,
        error: "Ya existe una cuenta registrada con ese correo de trabajo.",
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const nameParts = data.responsibleName.split(/\s+/);
    const firstName = nameParts[0] || data.responsibleName;
    const lastName = nameParts.slice(1).join(" ") || data.legalName;

    const created = await prisma.$transaction(async (tx) => {
      const membershipNumber = await generateNextMembershipNumber(tx);
      const role = data.profileType === "EMPRESA" ? "EMPRESA" : "AGENCIA";

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          phone: data.contactPhone,
          role,
          acceptMarketing: true,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          membershipNumber,
          tier: "ORIGEN",
          status: "PENDIENTE_CONVENIO",
          discountPercentage: 15,
        },
      });

      const b2b = await tx.b2BProfile.create({
        data: {
          membershipId: membership.id,
          profileType: data.profileType,
          legalName: data.legalName,
          rfc: data.rfc.toUpperCase(),
          businessActivity: data.businessActivity,
          responsibleName: data.responsibleName,
          responsibleRole: data.responsibleRole,
          workEmail: normalizedEmail,
          contactPhone: data.contactPhone,
          fiscalAddress: data.fiscalAddress,
          needsLodging: data.needsLodging,
          needsOtamEvents: data.needsOtamEvents,
          needsAmanecerMerch: data.needsAmanecerMerch,
        },
      });

      await tx.authorizedPerson.createMany({
        data: data.authorizedPeople.map((person) => ({
          b2bProfileId: b2b.id,
          fullName: person.fullName,
          email: person.email.toLowerCase(),
          phone: person.phone,
          roleInAccount: person.roleInAccount,
          isActive: true,
        })),
      });

      return { user, membership };
    });

    return {
      ok: true as const,
      membershipNumber: created.membership.membershipNumber,
      email: created.user.email,
      redirectTo: data.profileType === "EMPRESA" ? "/empresa" : "/agencia",
    };
  } catch (err) {
    console.error("Error en registerB2BAction:", err);
    return {
      ok: false as const,
      error: "No fue posible registrar la solicitud de convenio en la base de datos.",
    };
  }
}

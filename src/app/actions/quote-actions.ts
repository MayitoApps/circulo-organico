"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const quoteSchema = z.object({
  category: z.enum(["OTAM_PERSONAL", "OTAM_CORPORATIVO", "AMANECER_MERCH"]),
  requesterType: z.enum(["PERSONA", "EMPRESA", "AGENCIA"]),
  propertySlug: z.string().optional().nullable(),
  experienceOrItems: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().positive().optional(),
      notes: z.string().optional(),
    })
  ).min(1, "Selecciona al menos una experiencia o artículo"),
  participantsCount: z.number().int().min(1).max(2000),
  preferredDate: z.string().optional().nullable(),
  payWithPointsOrBalance: z.boolean().default(false),
  contactName: z.string().trim().min(2, "Ingresa tu nombre completo"),
  contactEmail: z.string().trim().email("Correo electrónico inválido"),
  contactPhone: z.string().trim().min(8, "Ingresa un teléfono de contacto"),
  notes: z.string().optional().nullable(),
});

export async function submitQuoteRequestAction(rawInput: unknown) {
  const parsed = quoteSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Revisa los datos de la solicitud.",
    };
  }

  const data = parsed.data;
  const session = await auth();

  try {
    let propertyId: string | null = null;
    if (data.propertySlug) {
      const prop = await prisma.hotelProperty.findUnique({
        where: { slug: data.propertySlug },
        select: { id: true },
      });
      propertyId = prop?.id ?? null;
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        membershipId: session?.user?.membershipId ?? null,
        category: data.category,
        requesterType: data.requesterType,
        propertyId,
        experienceOrItems: data.experienceOrItems,
        participantsCount: data.participantsCount,
        preferredDate: data.preferredDate || null,
        payWithPointsOrBalance: data.payWithPointsOrBalance,
        contactName: data.contactName,
        contactEmail: data.contactEmail.toLowerCase(),
        contactPhone: data.contactPhone,
        notes: data.notes || null,
      },
    });

    revalidatePath("/admin");

    return {
      ok: true as const,
      quoteId: quote.id,
    };
  } catch (err) {
    console.error("Error en submitQuoteRequestAction:", err);
    return {
      ok: false as const,
      error: "No pudimos guardar tu solicitud. Verifica la conexión a la base de datos.",
    };
  }
}

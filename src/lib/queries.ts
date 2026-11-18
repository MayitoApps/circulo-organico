import { prisma } from "@/lib/prisma";
import { CANONICAL_PROPERTIES, type CanonicalProperty } from "@/lib/properties-data";
import { toNumber } from "@/lib/utils";

export async function getPropertiesSafe(): Promise<
  Array<CanonicalProperty & { id?: string }>
> {
  if (!process.env.DATABASE_URL) {
    return CANONICAL_PROPERTIES;
  }

  try {
    const dbProps = await prisma.hotelProperty.findMany({
      orderBy: { name: "asc" },
    });
    if (dbProps.length === 0) {
      return CANONICAL_PROPERTIES;
    }

    return CANONICAL_PROPERTIES.map((canon) => {
      const match = dbProps.find((p) => p.slug === canon.slug);
      if (!match) return canon;
      return {
        ...canon,
        id: match.id,
        name: match.name,
        tagline: match.tagline,
        baseNightPriceMxn: toNumber(match.baseNightPriceMxn),
        hasSpaCenter: match.hasSpaCenter,
        imageUrl: match.imageUrl || canon.imageUrl,
        location: match.location || canon.location,
        description: match.description || canon.description,
      };
    });
  } catch {
    return CANONICAL_PROPERTIES;
  }
}

export async function getPropertyBySlugSafe(
  slug: string
): Promise<(CanonicalProperty & { id?: string }) | null> {
  const all = await getPropertiesSafe();
  return all.find((p) => p.slug === slug) ?? null;
}

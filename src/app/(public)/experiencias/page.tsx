import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MOMENTOS_ORGANICO } from "@/lib/catalog-data";
import { ExperiencesClient } from "@/components/ExperiencesClient";
import { SectionEyebrow } from "@/components/ui/primitives";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExperienciasPage() {
  let sessionRole = null;
  let availableBalance = 0;

  try {
    const session = await auth();
    if (session?.user?.membershipId) {
      sessionRole = session.user.role;
      const membership = await prisma.membership.findUnique({
        where: { id: session.user.membershipId },
      });
      if (membership) {
        availableBalance =
          session.user.role === "EMPRESA"
            ? toNumber(membership.cashBalanceMxn)
            : membership.pointsBalance;
      }
    }
  } catch {
    // fallback silencioso
  }

  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow className="animate-hero-1">Catálogo de experiencias y premios</SectionEyebrow>
            <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Momentos Orgánico
            </h1>
            <p className="animate-hero-3 mt-3 text-base text-[#4C524E]">
              Todos los momentos oficiales de cada una de nuestras seis propiedades y de Origen
              Centro Holístico y Spa. Canjea el 100% del valor con tus puntos Círculo Orgánico (1
              punto = $1 MXN) o saldo empresarial.
            </p>
          </div>
          {sessionRole && (
            <div className="animate-hero-3 rounded-2xl border border-[#DFD2BA] bg-[#F2EFE9] px-5 py-3 text-right transition-shadow duration-300 hover:shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                Tu saldo disponible
              </p>
              <p className="font-editorial text-2xl font-semibold text-[#1B3B2B] tabular-nums">
                {sessionRole === "EMPRESA"
                  ? `$${availableBalance.toLocaleString("es-MX")} MXN`
                  : `${availableBalance.toLocaleString("es-MX")} puntos`}
              </p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <ExperiencesClient
            moments={MOMENTOS_ORGANICO}
            sessionRole={sessionRole}
            availableBalance={availableBalance}
          />
        </div>
      </div>
    </div>
  );
}

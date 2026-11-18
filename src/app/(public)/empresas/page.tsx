import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  Hotel,
  Package,
  ShieldCheck,
  Trees,
  Users,
  Wallet,
} from "lucide-react";
import { auth } from "@/auth";
import { FaqAccordion, type FaqItem } from "@/components/FaqAccordion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow, TierBadge } from "@/components/ui/primitives";
import { CORPORATE_TIER_RULES } from "@/lib/loyalty-engine";

export const dynamic = "force-dynamic";

const EMPRESA_FAQS: FaqItem[] = [
  {
    question: "¿Cómo se calcula el 2% de saldo a favor de la empresa?",
    answer:
      "Se calcula exclusivamente sobre el importe neto elegible pagado en hospedaje, eventos o experiencias después de aplicar descuentos o saldos previos, sin incluir IVA, ISH, propinas ni servicios de terceros. Por cada $100 MXN netos elegibles, la cuenta recibe $2 MXN en saldo a favor.",
  },
  {
    question: "¿En qué se puede utilizar el saldo empresarial?",
    answer:
      "El saldo tiene vigencia de 24 meses desde su emisión y puede cubrir hasta el 25% de reservaciones de hospedaje, hasta el 10% de un evento corporativo o retiro, o el 100% de premios y experiencias del catálogo Momentos Orgánico.",
  },
  {
    question: "¿Quién puede usar el saldo de la empresa?",
    answer:
      "Únicamente las personas autorizadas activas en la cuenta con facultad de autorización de premios y saldo. Desde el dashboard de Empresa puedes dar de alta colaboradores que solo reservan y administran o autorizadores de saldo.",
  },
  {
    question: "¿Cómo sube de nivel nuestra cuenta empresarial?",
    answer:
      "Al aprobarse el convenio inicias en Empresas Origen. Si en los últimos 12 meses acumulas $250,000 MXN netos elegibles avanzas a Empresas Oro (atención prioritaria y descuentos acordados), y desde $500,000 MXN alcanzas Empresas Diamante con descuentos exclusivos y ejecutivo asignado.",
  },
];

export default async function EmpresasLandingPage() {
  const session = await auth();
  const isEmpresa = session?.user?.role === "EMPRESA";

  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Empresas */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <SectionEyebrow className="animate-hero-1">Cuentas corporativas · B2B</SectionEyebrow>
            <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Círculo Orgánico para Empresas
            </h1>
            <p className="animate-hero-3 mt-3 text-base leading-relaxed text-[#4C524E]">
              Centraliza el hospedaje ejecutivo, los retiros de liderazgo con OTAM y los kits
              corporativos de Amanecer de tu organización. Todas tus compras netas elegibles
              acumulan <strong className="text-[#1B3B2B]">2% en saldo a favor</strong> ($2 MXN por
              cada $100 MXN), con control total sobre qué colaboradores pueden reservar y quién
              autoriza usar el saldo.
            </p>
          </div>
          <div className="animate-hero-3 flex flex-wrap gap-3">
            {isEmpresa ? (
              <Link
                href="/empresa"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
              >
                Ir a mi Dashboard de Empresa
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href="/registro?tab=empresa"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
              >
                Solicitar convenio empresarial
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Cómo funciona en 3 pasos para Empresas */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <ScrollReveal delayMs={0}>
            <Card
              variant="sand"
              className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
            >
              <FileCheck2 className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
              <h2 className="mt-3 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                1. Alta de convenio
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#4C524E]">
                Registra razón social, RFC, domicilio fiscal y personas autorizadas en 2 pasos (con
                opción a descargar el formato para firma interna). Al aprobarse, tu tarifa corporativa
                queda activa.
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal delayMs={100}>
            <Card
              variant="sand"
              className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
            >
              <Wallet className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
              <h2 className="mt-3 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                2. Acumula 2% en saldo
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#4C524E]">
                Cada estancia o evento pagado sobre importe neto elegible genera 2% en saldo a favor
                con vigencia de 24 meses, además de sumar al historial móvil de 12 meses.
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal delayMs={200}>
            <Card
              variant="sand"
              className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
            >
              <Users className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
              <h2 className="mt-3 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                3. Controla y canjea
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#4C524E]">
                Desde tu dashboard corporativo consultas reservas del equipo, avance hacia Oro o
                Diamante y gestionas en tiempo real a los colaboradores autorizados.
              </p>
            </Card>
          </ScrollReveal>
        </div>

        {/* 3 Niveles Corporativos */}
        <section className="mt-14">
          <ScrollReveal>
            <SectionEyebrow>Escala corporativa en 12 meses</SectionEyebrow>
            <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Niveles Empresas Origen, Oro y Diamante
            </h2>
          </ScrollReveal>

          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {(["ORIGEN", "ORO", "DIAMANTE"] as const).map((tierKey, idx) => {
              const rule = CORPORATE_TIER_RULES[tierKey];
              return (
                <ScrollReveal key={tierKey} delayMs={idx * 110}>
                  <Card
                    variant={
                      tierKey === "ORIGEN" ? "forest" : tierKey === "ORO" ? "gold" : "obsidian"
                    }
                    className="flex h-full flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.35)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-85">
                          {rule.minSpend12mMxn === 0
                            ? "Al aprobar convenio"
                            : `Desde $${rule.minSpend12mMxn.toLocaleString("es-MX")} MXN / 12m`}
                        </span>
                        <TierBadge tier={tierKey} />
                      </div>
                      <h3 className="mt-2 font-editorial text-3xl font-medium">{rule.label}</h3>
                      <ul className="mt-5 space-y-2.5 text-sm">
                        {rule.perks.map((p) => (
                          <li key={p} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Qué incluye el ecosistema empresarial */}
        <ScrollReveal>
          <section className="mt-14 rounded-3xl border border-[#E4DDD1] bg-white p-7 shadow-xs transition-shadow duration-300 hover:shadow-md sm:p-9">
            <SectionEyebrow>Soluciones integradas</SectionEyebrow>
            <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Todo lo que puedes gestionar en tu cuenta Empresa
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-3">
              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <Hotel className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Hospedaje en 6 destinos
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Habitaciones ejecutivas en Roma Norte y Tlalpan (Quinta Soledad) o refugios en
                  Ajusco, Tepoztlán, Valle de Bravo y Veracruz, con hasta 25% cubierto con saldo.
                </p>
              </div>
              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <Trees className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Retiros y Team Building OTAM
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Producción llave en mano de dinámicas para 10 a 500 personas, con opción a cubrir
                  hasta 10% del evento con el saldo acumulado de la empresa.
                </p>
              </div>
              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <Package className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Amanecer - Merchandising
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Kits de bienvenida, uniformes y artículos personalizados con intención (sudaderas,
                  termos Yeti, chalecos, cobijas) para tus convenciones o colaboradores.
                </p>
              </div>
            </div>

            {/* Reglas de redención y gobierno */}
            <div className="mt-8 grid gap-4 border-t border-[#EFE8DC] pt-6 md:grid-cols-2">
              <div className="rounded-2xl border border-transparent bg-[#FAF8F5] p-5 transition-all duration-300 hover:border-[#DFD2BA] hover:shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9E6B4B]">
                  <Building2 className="h-4 w-4" />
                  Topes de uso de saldo (vigencia 24 meses)
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-[#4C524E]">
                  <li>• Hasta <strong>25%</strong> en hospedaje directo.</li>
                  <li>• Hasta <strong>10%</strong> en eventos corporativos o grupales.</li>
                  <li>• Hasta <strong>100%</strong> en premios del catálogo Momentos Orgánico.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-transparent bg-[#FAF8F5] p-5 transition-all duration-300 hover:border-[#DFD2BA] hover:shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9E6B4B]">
                  <ShieldCheck className="h-4 w-4" />
                  Roles de personas autorizadas
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-[#4C524E]">
                  <li>• <strong>Reserva y administra:</strong> agenda estancias y eventos del equipo.</li>
                  <li>• <strong>Autoriza premios y saldo:</strong> único rol habilitado para aprobar el descuento del saldo a favor.</li>
                </ul>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Preguntas frecuentes Empresas */}
        <section className="mt-14">
          <ScrollReveal>
            <SectionEyebrow>Dudas frecuentes B2B</SectionEyebrow>
            <h2 className="mt-1.5 mb-5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Preguntas frecuentes para Empresas
            </h2>
            <FaqAccordion items={EMPRESA_FAQS} />
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}

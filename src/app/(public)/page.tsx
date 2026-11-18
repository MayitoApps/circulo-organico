import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  Gift,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  Package,
  Sparkles,
  Trees,
  UserCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/auth.config";
import { HeroCardShowcase } from "@/components/HeroCardShowcase";
import { MemberCard } from "@/components/MemberCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow, TierBadge } from "@/components/ui/primitives";
import { getPropertiesSafe } from "@/lib/queries";
import {
  formatMxn,
  PERSONAL_TIER_RULES,
  STAY_COURTESIES_CATALOG,
} from "@/lib/loyalty-engine";

export const dynamic = "force-dynamic";

export default async function LandingHomePage() {
  const properties = await getPropertiesSafe();
  let session = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  const dashboardHref = session?.user
    ? getDashboardPathForRole(session.user.role)
    : null;

  return (
    <div className="bg-[#FAF8F5]">
      {/* 1. HERO EDITORIAL CON ANIMACIONES DE ENTRADA, KEN BURNS Y TARJETA 3D */}
      <section className="relative overflow-hidden border-b border-[#244A37] bg-[#13291E] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img
            src="https://www.gohb.com.mx/assets/images/ajusco1.jpg"
            alt=""
            className="animate-ken-burns h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2218]/95 via-[#163325]/90 to-[#11251B]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(200,178,137,0.22),transparent_52%)]" />
          <svg
            viewBox="0 0 600 600"
            className="animate-spin-slow absolute -right-24 -top-24 h-[520px] w-[520px] opacity-20"
            fill="none"
          >
            <circle cx="300" cy="300" r="110" stroke="#C8B289" strokeWidth="1" />
            <circle cx="300" cy="300" r="175" stroke="#C8B289" strokeWidth="0.9" strokeDasharray="6 6" />
            <circle cx="300" cy="300" r="240" stroke="#C8B289" strokeWidth="0.8" />
            <circle cx="300" cy="300" r="295" stroke="#C8B289" strokeWidth="0.7" strokeDasharray="4 8" />
          </svg>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <span className="animate-hero-1 inline-flex items-center gap-2 rounded-full border border-[#C8B289]/40 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#DFCFAF] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#C8B289]" />
              Grupo Orgánico Hoteles Boutique
            </span>

            <h1 className="animate-hero-2 mt-5 font-editorial text-4xl leading-[1.02] font-medium tracking-tight text-white sm:text-5xl lg:text-[64px]">
              Cada visita te da{" "}
              <span className="italic text-[#DFCFAF]">algo más.</span>
            </h1>

            <p className="animate-hero-3 mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              El programa de lealtad para huéspedes individuales, empresas y agencias en nuestros
              seis hoteles boutique, experiencias{" "}
              <strong className="font-semibold text-[#DFCFAF]">OTAM</strong> y merchandising{" "}
              <strong className="font-semibold text-[#DFCFAF]">Amanecer</strong>.
            </p>

            <div className="animate-hero-4 mt-8 flex flex-wrap items-center gap-3.5">
              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#C8B289] px-7 py-3.5 text-sm font-semibold text-[#1B3B2B] shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DFCFAF] hover:shadow-xl"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Ir a mi Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/registro"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#C8B289] px-7 py-3.5 text-sm font-semibold text-[#1B3B2B] shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DFCFAF] hover:shadow-xl"
                  >
                    Únete gratis
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/entrar"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20"
                  >
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>

            <div className="animate-hero-4 mt-8 flex flex-wrap items-center gap-2 border-t border-white/15 pt-5 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-[#C8B289]">
                <MapPin className="h-3.5 w-3.5" />
                6 destinos:
              </span>
              {properties.map((prop) => (
                <a
                  key={prop.slug}
                  href="#nuestros-hoteles"
                  className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C8B289]/60 hover:bg-white/15 hover:text-[#DFCFAF]"
                >
                  {prop.name.replace("Orgánico ", "")}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <HeroCardShowcase />
          </div>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA CÍRCULO ORGÁNICO (3 PASOS CLAROS) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl">
            <SectionEyebrow>¿Cómo funciona Círculo Orgánico?</SectionEyebrow>
            <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B] sm:text-4xl">
              Tres pasos para aprovechar cada visita y evento
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#4C524E]">
              Un solo programa que une nuestras seis propiedades, las experiencias de OTAM y la
              línea Amanecer bajo reglas transparentes para personas, empresas y agencias.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Únete y recibe tu tarjeta digital",
              desc: "Regístrate gratis eligiendo el perfil adecuado para ti: Socio Personal, Empresa o Agencia. Desde el primer momento obtienes tu número de membresía y tu código QR personal en tu dashboard.",
              bullets: [
                "Ingreso inmediato sin costo en nivel Origen.",
                "Presenta tu tarjeta QR al reservar o hacer check-in.",
              ],
            },
            {
              step: "02",
              title: "Reserva directo y acumula por cada pago",
              desc: "Obtén descuentos directos o tarifas convenidas al hospedarte o realizar eventos con nosotros. Tus recompensas se calculan sobre el monto neto pagado (sin impuestos, propinas ni terceros).",
              bullets: [
                "Personales: 15% a 30% dto. + 3 a 5 pts por cada $100 MXN.",
                "Empresas y Agencias: 2% en saldo o comisiones y bonos por evento.",
              ],
            },
            {
              step: "03",
              title: "Sube de nivel y canjea tus beneficios",
              desc: "Con tus estancias o consumo acumulado en 12 meses avanzas a Oro o Diamante (y en Agencias según el monto de cada evento). Cada punto o peso de saldo equivale a $1 MXN y dura 24 meses.",
              bullets: [
                "Cubre hasta 25% de hospedaje, 10% en eventos o 100% del catálogo.",
                "Desbloquea masajes de 60 min, upgrades y cortesías de estancia.",
              ],
            },
          ].map((item, idx) => (
            <ScrollReveal key={item.step} delayMs={idx * 100}>
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-[#E4DDD1] bg-[#F2EFE9]/75 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-[0_20px_40px_-20px_rgba(27,59,43,0.18)]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-editorial text-3xl font-semibold leading-none text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110">
                      {item.step}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1B3B2B] transition-colors duration-300 group-hover:bg-[#1B3B2B] group-hover:text-[#DFCFAF]">
                      Paso {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-editorial text-2xl font-medium text-[#1B3B2B]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#4C524E]">{item.desc}</p>
                </div>
                <ul className="mt-5 space-y-1.5 border-t border-[#E4DDD1] pt-4 text-[11px] leading-relaxed text-[#1B3B2B]">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9E6B4B]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 3. LOS 3 PERFILES: INDIVIDUAL, EMPRESA Y AGENCIA */}
      <section className="border-y border-[#E4DDD1] bg-[#F2EFE9]/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl">
              <SectionEyebrow>¿Cómo participas?</SectionEyebrow>
              <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B] sm:text-4xl">
                Tres perfiles con beneficios claros
              </h2>
            </div>
          </ScrollReveal>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Individual */}
            <ScrollReveal delayMs={0}>
              <Card
                variant="forest"
                className="flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.4)]"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8B289]">
                    <UserCheck className="h-3.5 w-3.5" /> Individual
                  </span>
                  <h3 className="mt-2 font-editorial text-2xl font-medium text-white">
                    Para ti
                  </h3>
                  <ul className="mt-4 space-y-2 text-xs text-white/85">
                    <li>• 15% a 30% de descuento en hospedaje directo</li>
                    <li>• 3, 4 o 5 pts por cada $100 MXN (+200 pts en 5ta estancia)</li>
                    <li>• Masajes de regalo y cortesías en estancias de 2+ noches</li>
                  </ul>
                </div>
                <div className="mt-6 flex gap-2">
                  <Link
                    href="/registro?tab=personal"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#C8B289] px-4 py-2.5 text-xs font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#DFCFAF]"
                  >
                    Registrarme gratis
                  </Link>
                  <Link
                    href="/membresias"
                    className="inline-flex items-center justify-center rounded-full border border-white/25 px-3.5 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10"
                  >
                    Más info
                  </Link>
                </div>
              </Card>
            </ScrollReveal>

            {/* Empresa */}
            <ScrollReveal delayMs={100}>
              <Card
                variant="white"
                className="flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.2)]"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                    <Building2 className="h-3.5 w-3.5" /> Corporativo
                  </span>
                  <h3 className="mt-2 font-editorial text-2xl font-medium text-[#1B3B2B]">
                    Para tu empresa
                  </h3>
                  <ul className="mt-4 space-y-2 text-xs text-[#4C524E]">
                    <li>• 2% en saldo a favor ($2 por cada $100 netos)</li>
                    <li>• Niveles Origen, Oro ($250k) y Diamante ($500k en 12m)</li>
                    <li>• Úsalo en hospedaje (25%), eventos (10%) o catálogo (100%)</li>
                  </ul>
                </div>
                <div className="mt-6 flex gap-2">
                  <Link
                    href="/registro?tab=empresa"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1B3B2B] px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#132A1E]"
                  >
                    Registrar empresa
                  </Link>
                  <Link
                    href="/empresas"
                    className="inline-flex items-center justify-center rounded-full border border-[#DCD4C6] px-3.5 py-2.5 text-xs font-medium text-[#1B3B2B] transition-all duration-200 hover:border-[#1B3B2B] hover:bg-[#F2EFE9]"
                  >
                    Más info
                  </Link>
                </div>
              </Card>
            </ScrollReveal>

            {/* Agencia */}
            <ScrollReveal delayMs={200}>
              <Card
                variant="obsidian"
                className="flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-18px_rgba(0,0,0,0.45)]"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8B289]">
                    <Briefcase className="h-3.5 w-3.5" /> Eventos
                  </span>
                  <h3 className="mt-2 font-editorial text-2xl font-medium text-white">
                    Para tu agencia
                  </h3>
                  <ul className="mt-4 space-y-2 text-xs text-white/80">
                    <li>• Evaluación individual por cada evento pagado</li>
                    <li>• Comisión 0% (Origen), 5% (Oro) u 8% (Diamante)</li>
                    <li>• Hasta 2% en puntos + noches de regalo y masajes</li>
                  </ul>
                </div>
                <div className="mt-6 flex gap-2">
                  <Link
                    href="/registro?tab=agencia"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#C8B289] px-4 py-2.5 text-xs font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#DFCFAF]"
                  >
                    Registrar agencia
                  </Link>
                  <Link
                    href="/agencias"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-3.5 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10"
                  >
                    Más info
                  </Link>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. MEMBRESÍAS INDIVIDUALES (VISUAL + EXPLICACIÓN CLARA) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <SectionEyebrow>Membresías Individuales</SectionEyebrow>
              <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B] sm:text-4xl">
                Origen, Oro y Diamante: así lucen y así se ganan
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                Inicias gratis en <strong className="text-[#1B3B2B]">Origen</strong> y subes de
                nivel al cumplir la meta de noches pagadas o consumo neto en los últimos 12 meses
                (lo que ocurra primero). Cada punto vale{" "}
                <strong className="text-[#1B3B2B]">$1 MXN</strong> y dura 24 meses.
              </p>
            </div>
            <Link
              href="/membresias"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
            >
              Ver tabla comparativa y FAQ
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-7 lg:grid-cols-3">
          {[
            {
              tier: "ORIGEN" as const,
              holder: "Camila Herrera",
              number: "000 105",
              requirement: "Gratis al registrarte (sin mínimo)",
              highlights: [
                "Bono automático de +200 puntos en tu 5ta estancia anual",
                "Horario estándar de entrada (15:00) y salida (12:00)",
                "Mejora de habitación con puntos o promoción",
              ],
            },
            {
              tier: "ORO" as const,
              holder: "Ana López",
              number: "000 248",
              requirement: `6 noches o ${formatMxn(PERSONAL_TIER_RULES.ORO.minSpend12mMxn)} en 12 meses`,
              highlights: [
                "1 masaje relajante de 60 min cada 12 meses (sin requerir hotel)",
                "1 cortesía a elegir en estancias de 2 noches o más",
                "Check-in 13:00 / Check-out 14:00 (sujeto a confirmación) y upgrade",
              ],
            },
            {
              tier: "DIAMANTE" as const,
              holder: "Diego Santana",
              number: "000 417",
              requirement: `12 noches o ${formatMxn(PERSONAL_TIER_RULES.DIAMANTE.minSpend12mMxn)} en 12 meses`,
              highlights: [
                "Hasta 2 masajes de 60 min al año (titular y acompañante)",
                "2 cortesías distintas a elegir en estancias de 2 noches o más",
                "Check-in 12:00 / Check-out 16:00, upgrade prioritario y asesor personal",
              ],
            },
          ].map((item, idx) => {
            const rule = PERSONAL_TIER_RULES[item.tier];
            return (
              <ScrollReveal key={item.tier} delayMs={idx * 110}>
                <div className="group flex h-full flex-col">
                  <div className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <MemberCard
                      holderName={item.holder}
                      membershipNumber={item.number}
                      tier={item.tier}
                      qrValue={`circulo-organico://socio/${item.number.replace(/\s+/g, "-")}`}
                      accountTypeLabel={`Socio Personal · ${rule.discountPct}% dto.`}
                      compact
                      className="max-w-none"
                    />
                  </div>

                  <Card
                    variant="white"
                    className="mt-4 flex flex-1 flex-col justify-between p-5 transition-all duration-300 group-hover:border-[#C8B289] group-hover:shadow-[0_20px_40px_-20px_rgba(27,59,43,0.18)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-editorial text-2xl font-medium text-[#1B3B2B]">
                          Membresía {rule.label}
                        </h3>
                        <TierBadge tier={item.tier} />
                      </div>

                      <div className="mt-3 rounded-xl border border-[#EFE8DC] bg-[#FAF8F5] px-3.5 py-2 text-xs">
                        <span className="font-semibold text-[#9E6B4B]">Cómo se obtiene: </span>
                        <span className="font-medium text-[#1B3B2B]">{item.requirement}</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-[#F2EFE9]/80 p-3 transition-colors duration-300 group-hover:bg-[#EFE8DB]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5E645F]">
                            Descuento directo
                          </p>
                          <p className="mt-0.5 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                            {rule.discountPct}%
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#F2EFE9]/80 p-3 transition-colors duration-300 group-hover:bg-[#EFE8DB]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5E645F]">
                            Por cada $100 MXN
                          </p>
                          <p className="mt-0.5 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                            {rule.pointsPer100Mxn} pts
                          </p>
                        </div>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[#4C524E]">
                        {item.highlights.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3B2B]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Cortesías y uso de puntos en bloque visual claro */}
        <ScrollReveal delayMs={120}>
          <div className="mt-7 rounded-2xl border border-[#DFD2BA] bg-[#F2EFE9] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9E6B4B]">
                  Estancias de 2 noches pagadas o más
                </p>
                <h3 className="mt-0.5 font-editorial text-xl font-medium text-[#1B3B2B]">
                  Las 4 cortesías a elegir (Oro elige 1 · Diamante elige 2)
                </h3>
              </div>
              <span className="rounded-full border border-[#DFD2BA] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#1B3B2B]">
                Canje desde 100 pts: hasta 25% en hospedaje o 100% del catálogo
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STAY_COURTESIES_CATALOG.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-[#E4DDD1] bg-white p-3.5 text-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md"
                >
                  <p className="font-semibold text-[#1B3B2B]">{c.title}</p>
                  <p className="mt-1 leading-relaxed text-[#5E645F]">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. NUESTROS SEIS HOTELES (INFO + LINK A SITIO WEB OFICIAL) */}
      <section id="nuestros-hoteles" className="border-y border-[#E4DDD1] bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionEyebrow>Las 6 sedes oficiales</SectionEyebrow>
                <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
                  Nuestros hoteles
                </h2>
              </div>
              <Link
                href="/hoteles"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1B3B2B] transition-colors hover:text-[#9E6B4B]"
              >
                Ver detalle completo de hoteles
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop, idx) => (
              <ScrollReveal key={prop.slug} delayMs={(idx % 3) * 90}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4DDD1] bg-[#FAF8F5] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.22)]">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
                    <span className="absolute left-3.5 top-3 rounded-full bg-[#FAF8F5]/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1B3B2B] transition-colors duration-300 group-hover:bg-[#C8B289]">
                      {prop.regionLabel}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-editorial text-2xl font-medium">{prop.name}</h3>
                      <p className="text-xs text-white/85">{prop.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E645F]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9E6B4B]" />
                          {prop.location}
                        </span>
                        <span className="font-semibold text-[#1B3B2B] tabular-nums">
                          {formatMxn(prop.baseNightPriceMxn)} / noche
                        </span>
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-[#4C524E]">
                        {prop.description}
                      </p>
                    </div>

                    <a
                      href={prop.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#132A1E] group-hover:shadow-md"
                    >
                      Visitar sitio web del hotel
                      <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </a>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ECOSISTEMA: EXPERIENCIAS, OTAM, AMANECER Y COMPROMISO */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-xl">
            <SectionEyebrow>Todo el ecosistema</SectionEyebrow>
            <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Experiencias, regalos y propósito
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ScrollReveal delayMs={0}>
            <Link
              href="/experiencias"
              className="group flex h-full flex-col justify-between rounded-2xl border border-[#E4DDD1] bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1B3B2B] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.16)]"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#9E6B4B] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#1B3B2B] group-hover:text-[#C8B289]">
                  <Gift className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Momentos Orgánico
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5E645F]">
                  Masajes, cenas, fogatas y cine al aire libre canjeables al 100% con puntos.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1B3B2B]">
                Ver catálogo{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delayMs={80}>
            <Link
              href="/otam"
              className="group flex h-full flex-col justify-between rounded-2xl border border-[#E4DDD1] bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1B3B2B] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.16)]"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#9E6B4B] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#1B3B2B] group-hover:text-[#C8B289]">
                  <Trees className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  OTAM · Casa Productora
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5E645F]">
                  Nuestra casa productora de experiencias llave en mano en las 6 sedes y fuera de
                  nuestros hoteles.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1B3B2B]">
                Conocer OTAM{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delayMs={160}>
            <Link
              href="/amanecer"
              className="group flex h-full flex-col justify-between rounded-2xl border border-[#E4DDD1] bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1B3B2B] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.16)]"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#9E6B4B] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#1B3B2B] group-hover:text-[#C8B289]">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  AMANECER - MERCHANDISING
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5E645F]">
                  Diseñamos piezas y objetos personalizados con intención que trascienden el
                  souvenir convencional.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1B3B2B]">
                Conocer Amanecer{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delayMs={240}>
            <Link
              href="/compromiso"
              className="group flex h-full flex-col justify-between rounded-2xl border border-[#E4DDD1] bg-[#F2EFE9] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1B3B2B] hover:bg-white hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.16)]"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1B3B2B] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#1B3B2B] group-hover:text-[#C8B289]">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Compromiso
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5E645F]">
                  Comunidad local, reforestación en Ajusco y cuidado en agua, energía y residuos.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#1B3B2B]">
                Conocer más{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. CTA FINAL BREVE */}
      <section className="relative overflow-hidden border-t border-[#E4DDD1] bg-[#1B3B2B] py-14 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(200,178,137,0.18),transparent_55%)]"
        />
        <ScrollReveal>
          <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
            <div>
              <h2 className="font-editorial text-3xl font-medium text-white">
                ¿Listo para consultar tus puntos y beneficios?
              </h2>
              <p className="mt-1 text-xs text-white/75 sm:text-sm">
                Crea tu cuenta gratis o inicia sesión para entrar directo a tu dashboard.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#C8B289] px-6 py-3 text-xs font-semibold text-[#1B3B2B] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DFCFAF] hover:shadow-xl"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Ir a mi Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/registro"
                    className="inline-flex items-center gap-2 rounded-full bg-[#C8B289] px-6 py-3 text-xs font-semibold text-[#1B3B2B] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DFCFAF] hover:shadow-xl"
                  >
                    Únete gratis
                  </Link>
                  <Link
                    href="/entrar"
                    className="rounded-full border border-white/30 px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
                  >
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

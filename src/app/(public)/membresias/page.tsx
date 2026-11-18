import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Gift,
  QrCode,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { FaqAccordion, type FaqItem } from "@/components/FaqAccordion";
import { MemberCard } from "@/components/MemberCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow, TierBadge } from "@/components/ui/primitives";
import { PERSONAL_TIER_RULES, STAY_COURTESIES_CATALOG } from "@/lib/loyalty-engine";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Cuánto vale cada punto de Círculo Orgánico?",
    answer:
      "Cada punto equivale exactamente a $1 MXN dentro del programa Círculo Orgánico. Los puntos no son canjeables por efectivo y se calculan sobre el importe neto pagado después de descuentos, puntos o saldo a favor, excluyendo impuestos (IVA/ISH), propinas y servicios de terceros.",
  },
  {
    question: "¿Cuál es la vigencia de mis puntos?",
    answer:
      "Los puntos emitidos para socios personales tienen una vigencia de 24 meses a partir de su fecha de acreditación. En tu dashboard puedes consultar siempre el saldo disponible y la vigencia de cada movimiento.",
  },
  {
    question: "¿Cómo puedo pagar con mis puntos?",
    answer:
      "A partir de 100 puntos disponibles puedes usarlos para cubrir hasta el 25% de tu hospedaje (después de aplicar tu descuento de nivel), o pagar el 100% de las experiencias y premios del catálogo Momentos Orgánico.",
  },
  {
    question: "¿Cómo funciona el bono de 200 puntos en la quinta estancia?",
    answer:
      "Al registrar tu quinta estancia pagada dentro de un periodo de 12 meses, el sistema abona automáticamente 200 puntos extra (máximo una vez cada 12 meses). Ten en cuenta que reservas consecutivas en el mismo hotel cuentan como una sola estancia.",
  },
  {
    question: "¿Qué pasa con mi masaje de regalo si subo de Oro a Diamante en el mismo año?",
    answer:
      "Los socios Diamante tienen hasta 2 sesiones de masaje de 60 minutos cada 12 meses (1 para titular y 1 para acompañante). Si ya tenías o usaste tu sesión de regalo Oro dentro de ese mismo periodo de 12 meses, esa sesión cuenta dentro del tope de 2 sesiones de Diamante y conserva su fecha de vencimiento original.",
  },
  {
    question: "¿Los descuentos de socio se suman a otras promociones?",
    answer:
      "Los descuentos de membresía (15% Origen, 20% Oro y 30% Diamante) aplican en reservas directas de hospedaje y no son acumulables con otras promociones ni con tarifas negociadas.",
  },
];

export default function MembresiasPage() {
  const showcase = [
    {
      tier: "ORIGEN" as const,
      holder: "Camila Herrera",
      number: "000 105",
      subtitle: "Gratis al registrarte (sin mínimo)",
      bullets: [
        "15% de descuento directo en las 6 sedes",
        "3 puntos por cada $100 MXN netos pagados",
        "Bono automático de +200 puntos en tu 5ta estancia anual",
      ],
    },
    {
      tier: "ORO" as const,
      holder: "Ana López",
      number: "000 248",
      subtitle: "6 noches pagadas o $18,000 MXN en 12 meses",
      bullets: [
        "20% de descuento + 4 puntos por cada $100 MXN",
        "1 masaje relajante de 60 min cada 12 meses",
        "1 cortesía a elegir en estancias de 2+ noches pagadas",
      ],
    },
    {
      tier: "DIAMANTE" as const,
      holder: "Diego Santana",
      number: "000 417",
      subtitle: "12 noches pagadas o $40,000 MXN en 12 meses",
      bullets: [
        "30% de descuento + 5 puntos por cada $100 MXN",
        "Hasta 2 masajes de 60 min cada 12 meses + asesor personal",
        "2 cortesías distintas en estancias de 2+ noches pagadas",
      ],
    },
  ];

  const comparisonRows: Array<{ label: string; values: [string, string, string] }> = [
    {
      label: "Meta en últimos 12 meses",
      values: [
        "Ingreso gratuito al registrarte",
        "6 noches pagadas o $18,000 MXN netos",
        "12 noches pagadas o $40,000 MXN netos",
      ],
    },
    {
      label: "Descuento en hospedaje directo",
      values: ["15%", "20%", "30%"],
    },
    {
      label: "Acumulación de puntos (1 pt = $1 MXN)",
      values: [
        "3 puntos por cada $100 MXN",
        "4 puntos por cada $100 MXN",
        "5 puntos por cada $100 MXN",
      ],
    },
    {
      label: "Horarios de entrada / salida",
      values: [
        "Normal (15:00 / 12:00)",
        "Check-in 13:00 · Check-out 14:00 (sujeto a confirmación)",
        "Check-in 12:00 · Check-out 16:00 (sujeto a confirmación)",
      ],
    },
    {
      label: "Mejora de habitación",
      values: [
        "Con puntos o promoción",
        "Mejora a siguiente categoría",
        "Mejora prioritaria de habitación",
      ],
    },
    {
      label: "Masajes relajantes de 60 min",
      values: ["—", "1 sesión cada 12 meses", "Hasta 2 sesiones cada 12 meses (titular + acompañante)"],
    },
    {
      label: "Cortesías en estancias de 2+ noches",
      values: ["—", "1 cortesía a elegir", "2 cortesías distintas a elegir"],
    },
    {
      label: "Asesor personal de reservas",
      values: ["Atención estándar", "Atención preferente", "Incluido (asesor asignado)"],
    },
  ];

  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow className="animate-hero-1">Membresías para individuales</SectionEyebrow>
            <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Membresías digitales y niveles
            </h1>
            <p className="animate-hero-3 mt-3 text-base text-[#4C524E]">
              Toda la información para socios personales: credenciales digitales con QR, niveles
              Origen, Oro y Diamante, cortesías de estancia, masajes de regalo y reglas de
              acumulación.
            </p>
          </div>
          <Link
            href="/registro?tab=personal"
            className="group animate-hero-3 inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
          >
            Obtener mi membresía Origen gratis
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Galería de las 3 credenciales digitales */}
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {showcase.map((item, idx) => {
            const rule = PERSONAL_TIER_RULES[item.tier];
            return (
              <ScrollReveal key={item.tier} delayMs={idx * 110}>
                <div className="group flex h-full flex-col">
                  <div className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <MemberCard
                      holderName={item.holder}
                      membershipNumber={item.number}
                      tier={item.tier}
                      qrValue={`circulo-organico://demo/${item.number.replace(/\s+/g, "-")}`}
                      accountTypeLabel={`Socio Personal · ${rule.discountPct}% dto.`}
                    />
                  </div>
                  <Card
                    variant="white"
                    className="mt-5 flex-1 p-6 transition-all duration-300 group-hover:border-[#C8B289] group-hover:shadow-[0_20px_40px_-20px_rgba(27,59,43,0.18)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                        Membresía {rule.label}
                      </h2>
                      <TierBadge tier={item.tier} />
                    </div>
                    <div className="mt-3 rounded-xl border border-[#EFE8DC] bg-[#FAF8F5] px-3.5 py-2 text-xs">
                      <span className="font-semibold text-[#9E6B4B]">Cómo se obtiene: </span>
                      <span className="font-medium text-[#1B3B2B]">{item.subtitle}</span>
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
                    <ul className="mt-4 space-y-2.5 text-sm text-[#4C524E]">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3B2B]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Tabla comparativa completa */}
        <section className="mt-16">
          <ScrollReveal>
            <div className="mb-6">
              <SectionEyebrow>Comparativa completa</SectionEyebrow>
              <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
                Beneficios por nivel en los últimos 12 meses
              </h2>
              <p className="mt-1.5 text-sm text-[#4C524E]">
                Subes de nivel al alcanzar la meta de noches pagadas o de gasto neto elegible — lo
                que suceda primero.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={80}>
            <div className="overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white shadow-xs transition-shadow duration-300 hover:shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#5E645F]">
                        Beneficio
                      </th>
                      <th className="px-6 py-4 font-editorial text-lg font-semibold text-[#1B3B2B]">
                        Origen
                      </th>
                      <th className="px-6 py-4 font-editorial text-lg font-semibold text-[#9E6B4B]">
                        Oro
                      </th>
                      <th className="px-6 py-4 font-editorial text-lg font-semibold text-[#1E2422]">
                        Diamante
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DC]">
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="transition-colors duration-150 hover:bg-[#FAF8F5]">
                        <td className="px-6 py-4 font-medium text-[#1C201E]">{row.label}</td>
                        {row.values.map((val, idx) => (
                          <td key={idx} className="px-6 py-4 text-[#4C524E]">
                            {val === "—" ? (
                              <span className="text-[#A5ABA5]">—</span>
                            ) : (
                              <span className="inline-flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1B3B2B]" />
                                <span>{val}</span>
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Las 4 Cortesías */}
        <section className="mt-16">
          <ScrollReveal>
            <div className="max-w-2xl">
              <SectionEyebrow>Todo claro, desde el principio</SectionEyebrow>
              <h2 className="mt-2 font-editorial text-3xl font-medium text-[#1B3B2B]">
                Las 4 cortesías elegibles en estancias de 2 noches o más
              </h2>
              <p className="mt-2 text-sm text-[#4C524E]">
                Socios Oro eligen 1 cortesía y socios Diamante eligen 2 cortesías distintas en cada
                estancia pagada de 2 noches o más.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STAY_COURTESIES_CATALOG.map((courtesy, idx) => (
              <ScrollReveal key={courtesy.id} delayMs={idx * 80}>
                <Card
                  variant="sand"
                  className="group flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-editorial text-2xl font-semibold text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110">
                        0{idx + 1}
                      </span>
                      <Gift className="h-4 w-4 text-[#1B3B2B] transition-transform duration-300 group-hover:rotate-6" />
                    </div>
                    <h3 className="mt-3 font-editorial text-xl font-semibold text-[#1B3B2B]">
                      {courtesy.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#4C524E]">
                      {courtesy.description}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] font-medium text-[#9E6B4B]">{courtesy.note}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Uso práctico en recepción */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <ScrollReveal delayMs={0}>
            <Card
              variant="white"
              className="group flex h-full items-start gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#C8B289] transition-transform duration-300 group-hover:scale-105">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Lectura instantánea en recepción y bienestar
                </h3>
                <p className="mt-1.5 text-sm text-[#4C524E]">
                  Presenta tu QR o tu número{" "}
                  <span className="font-mono font-semibold text-[#1B3B2B]">SOCIO 000 XXX</span> al
                  llegar o al hacer check-out para acreditar puntos, elegir cortesías y disfrutar tu
                  masaje de regalo sin requerir hospedaje.
                </p>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delayMs={100}>
            <Card
              variant="white"
              className="group flex h-full items-start gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#C8B289] transition-transform duration-300 group-hover:scale-105">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-semibold text-[#1B3B2B]">
                  Descargable desde tu dashboard personal
                </h3>
                <p className="mt-1.5 text-sm text-[#4C524E]">
                  Dentro de tu cuenta puedes descargar tu código QR en PNG, revisar el avance dual
                  por noches y gasto hacia el siguiente nivel y solicitar tu cita de masaje.
                </p>
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* Preguntas Frecuentes */}
        <section className="mt-16">
          <ScrollReveal>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <SectionEyebrow>Reglas transparentes</SectionEyebrow>
                <h2 className="mt-2 font-editorial text-3xl font-medium text-[#1B3B2B]">
                  Preguntas frecuentes para socios individuales
                </h2>
              </div>
              <Sparkles className="hidden h-6 w-6 text-[#9E6B4B] sm:block" />
            </div>
            <FaqAccordion items={FAQ_ITEMS} />
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}

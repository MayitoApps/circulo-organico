import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarCheck2,
  CheckCircle2,
  Coins,
  Gift,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { FaqAccordion, type FaqItem } from "@/components/FaqAccordion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow, TierBadge } from "@/components/ui/primitives";
import { AGENCY_EVENT_RULES } from "@/lib/loyalty-engine";

export const dynamic = "force-dynamic";

const AGENCIA_FAQS: FaqItem[] = [
  {
    question: "¿Cómo se determina el nivel de beneficio en Agencias?",
    answer:
      "A diferencia de cuentas personales o empresas, en Agencias el nivel se evalúa de manera independiente por el monto neto elegible de cada evento individual realizado y pagado: Origen (< $100,000 MXN), Oro ($100,000 a $249,999.99 MXN) y Diamante (desde $250,000 MXN).",
  },
  {
    question: "¿Cuándo se liberan las comisiones, los puntos y las noches de regalo?",
    answer:
      "Mientras un evento está registrado como 'Próximo evento', muestra sus puntos estimados de referencia sin liberar regalos ni comisiones. Una vez que el evento se marca como 'Realizado y pagado', se liberan los puntos a tu cuenta, se autoriza la comisión en efectivo y se emiten los certificados correspondientes.",
  },
  {
    question: "¿Qué incluyen y cómo funcionan los certificados de noches de regalo?",
    answer:
      "Cada noche de regalo incluye habitación estándar e impuestos para 2 adultos, con vigencia de 12 meses desde su emisión y mejora sin costo sujeta a disponibilidad. Cada certificado conserva sus propias fechas, no se unen automáticamente entre distintos eventos y tu agencia decide el nombre del beneficiario.",
  },
  {
    question: "¿Cuánto duran los puntos de agencia y en qué se usan?",
    answer:
      "Cada punto equivale a $1 MXN y tiene vigencia de 24 meses desde su liberación. Pueden canjearse para cubrir hasta 25% de hospedaje o el 100% de premios y experiencias del catálogo.",
  },
];

export default async function AgenciasLandingPage() {
  const session = await auth();
  const isAgencia = session?.user?.role === "AGENCIA";

  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Agencias */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <SectionEyebrow className="animate-hero-1">
              Agencias, planners y organizadores de eventos
            </SectionEyebrow>
            <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Círculo Orgánico para Agencias
            </h1>
            <p className="animate-hero-3 mt-3 text-base leading-relaxed text-[#4C524E]">
              Diseñado para agencias de eventos, wedding planners y DMC. Cada evento que traes a
              cualquiera de nuestras 6 sedes se evalúa de forma independiente por su monto neto
              elegible: gana <strong className="text-[#1B3B2B]">hasta 8% en comisión en efectivo</strong>,{" "}
              <strong className="text-[#1B3B2B]">hasta 2% en puntos</strong> y certificados de
              noches de regalo y masajes para tu equipo o tus clientes.
            </p>
          </div>
          {isAgencia ? (
            <Link
              href="/agencia"
              className="group animate-hero-3 inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
            >
              Ir a mi Dashboard de Agencia
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : (
            <Link
              href="/registro?tab=agencia"
              className="group animate-hero-3 inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
            >
              Registrar mi agencia
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Escala por evento individual */}
        <section className="mt-12">
          <ScrollReveal>
            <SectionEyebrow>Evaluación independiente por evento</SectionEyebrow>
            <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Tabla de recompensas por evento realizado y pagado
            </h2>
          </ScrollReveal>

          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {(["ORIGEN", "ORO", "DIAMANTE"] as const).map((tierKey, idx) => {
              const rule = AGENCY_EVENT_RULES[tierKey];
              const range =
                tierKey === "ORIGEN"
                  ? "Menos de $100,000 MXN netos"
                  : tierKey === "ORO"
                    ? "De $100,000 a $249,999.99 MXN"
                    : "Desde $250,000 MXN netos";
              return (
                <ScrollReveal key={tierKey} delayMs={idx * 110}>
                  <Card
                    variant={
                      tierKey === "ORIGEN" ? "forest" : tierKey === "ORO" ? "gold" : "obsidian"
                    }
                    className="h-full p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.35)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-85">
                        {range}
                      </span>
                      <TierBadge tier={tierKey} />
                    </div>
                    <h3 className="mt-2 font-editorial text-3xl font-medium">{rule.label}</h3>
                    <ul className="mt-5 space-y-2.5 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {rule.commissionPct === 0
                            ? "Sin comisión en efectivo"
                            : `${rule.commissionPct}% de comisión en efectivo`}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{rule.pointsPct}% en puntos sobre el monto neto del evento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{rule.rewardSummary}</span>
                      </li>
                    </ul>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Ciclo operativo y Reglas de Certificados */}
        <ScrollReveal>
          <section className="mt-14 rounded-3xl border border-[#E4DDD1] bg-white p-7 shadow-xs transition-shadow duration-300 hover:shadow-md sm:p-9">
            <SectionEyebrow>Operación transparente en tu portal</SectionEyebrow>
            <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Cómo gestionas tus eventos, comisiones y regalos
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <CalendarCheck2 className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  1. Pre-registro de prospectos
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Registra a tu cliente y sede desde tu dashboard para ver el nivel y puntos
                  estimados de inmediato mientras confirmas el evento.
                </p>
              </div>

              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <Coins className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  2. Liquidación y comisiones
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Al liquidarse el evento, tu comisión pasa de <em>Autorizada</em> a <em>Pagada</em>{" "}
                  con trazabilidad completa por código (ej. E204).
                </p>
              </div>

              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <Gift className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  3. Certificados de noches
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Incluyen habitación estándar e impuestos para 2 adultos, vigencia de 12 meses y
                  mejora sin costo sujeta a disponibilidad.
                </p>
              </div>

              <div className="group rounded-2xl border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8DC] hover:bg-[#FAF8F5]">
                <UserCheck className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-2.5 font-editorial text-xl font-semibold text-[#1B3B2B]">
                  4. Beneficiarios independientes
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                  Cada certificado conserva sus fechas propias sin unirse entre eventos, y tú designas
                  libremente quién utiliza cada regalo.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F2EFE9] p-5 text-xs text-[#1B3B2B] transition-colors duration-200 hover:bg-[#EFE8DB]">
              <div className="flex items-center gap-2.5">
                <Award className="h-4 w-4 text-[#9E6B4B]" />
                <span>
                  <strong>Ejemplo real Evento Diamante ($250,000 MXN):</strong> $20,000 MXN de
                  comisión (8%) + 5,000 puntos ($5,000 MXN) + certificado de 2 noches seguidas + 1
                  masaje de 60 min.
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-[#9E6B4B]">
                <ShieldCheck className="h-4 w-4" />
                Sin impuestos ni propinas en base de cálculo
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Preguntas frecuentes Agencias */}
        <section className="mt-14">
          <ScrollReveal>
            <SectionEyebrow>Dudas frecuentes</SectionEyebrow>
            <h2 className="mt-1.5 mb-5 font-editorial text-3xl font-medium text-[#1B3B2B]">
              Preguntas frecuentes para Agencias y Organizadores
            </h2>
            <FaqAccordion items={AGENCIA_FAQS} />
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  HeartHandshake,
  Leaf,
  Recycle,
  Sun,
  Trees,
  Users,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Sección compartida de Compromiso Social y Medioambiente (Pilares Personas/Comunidad y Naturaleza/Entorno).
 */
export function CompromisoSection({
  headingAs = "h2",
  className,
}: {
  headingAs?: "h1" | "h2";
  className?: string;
}) {
  const isPageHero = headingAs === "h1";

  return (
    <section id="compromiso" className={cn("scroll-mt-24", className)}>
      {isPageHero ? (
        <div className="max-w-3xl">
          <SectionEyebrow className="animate-hero-1">Propósito Grupo Orgánico</SectionEyebrow>
          <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
            Compromiso Social y Medioambiente
          </h1>
          <p className="animate-hero-3 mt-3 text-base leading-relaxed text-[#4C524E]">
            Creemos en una hospitalidad que cuida el territorio que habita y dignifica a quienes la
            hacen posible todos los días.
          </p>
        </div>
      ) : (
        <ScrollReveal>
          <div className="max-w-3xl">
            <SectionEyebrow>Propósito Grupo Orgánico</SectionEyebrow>
            <h2 className="mt-2 font-editorial text-3xl font-medium text-[#1B3B2B] sm:text-4xl">
              Compromiso Social y Medioambiente
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#4C524E]">
              Creemos en una hospitalidad que cuida el territorio que habita y dignifica a quienes
              la hacen posible todos los días.
            </p>
          </div>
        </ScrollReveal>
      )}

      {/* Personas y Comunidad */}
      <div className="mt-12">
        <ScrollReveal>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B3B2B] text-[#C8B289]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <SectionEyebrow>Pilar 01</SectionEyebrow>
              <h3 className="font-editorial text-3xl font-medium text-[#1B3B2B]">
                Personas y Comunidad
              </h3>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          <ScrollReveal delayMs={0}>
            <Card
              variant="white"
              className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.18)]"
            >
              <Users className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
              <h4 className="mt-3 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                En nuestros hoteles
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                Hospitalidad cercana, proveeduría de productores locales en cocina y bienestar, y
                experiencias culturales que respetan el ritmo de cada destino.
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal delayMs={100}>
            <Card
              variant="white"
              className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.18)]"
            >
              <Trees className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
              <h4 className="mt-3 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                En nuestras ubicaciones
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                Colaboración directa con ejidos y comunidades de Ajusco, Tepoztlán, Valle de Bravo,
                Veracruz, Morelos y Ciudad de México mediante empleo local y compras justas.
              </p>
            </Card>
          </ScrollReveal>

          <ScrollReveal delayMs={200}>
            <Card
              variant="white"
              className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.18)]"
            >
              <HeartHandshake className="h-5 w-5 text-[#9E6B4B] transition-transform duration-300 group-hover:scale-110" />
              <h4 className="mt-3 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                En nuestros equipos
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                Capacitación continua en servicio boutique, bienestar laboral y desarrollo de carrera
                interna en todas nuestras propiedades.
              </p>
            </Card>
          </ScrollReveal>
        </div>
      </div>

      {/* Naturaleza y Entorno */}
      <div className="mt-14">
        <ScrollReveal>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B3B2B] text-[#C8B289]">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <SectionEyebrow>Pilar 02</SectionEyebrow>
              <h3 className="font-editorial text-3xl font-medium text-[#1B3B2B]">
                Naturaleza y Entorno
              </h3>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-12">
          <ScrollReveal className="lg:col-span-5" delayMs={0}>
            <Card
              variant="forest"
              className="flex h-full flex-col justify-between p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.4)]"
            >
              <div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8B289]">
                  Actividad insignia con OTAM
                </span>
                <h4 className="mt-4 font-editorial text-3xl font-medium text-white">
                  Jornadas de reforestación en Orgánico Ajusco
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Grupos de 10 a 100 participantes plantan especies nativas de oyamel y pino junto a
                  brigadas forestales locales, integrando impacto ambiental real dentro de retiros
                  empresariales y viajes de incentivo.
                </p>
              </div>
              <Link
                href="/otam"
                className="group mt-6 inline-flex items-center gap-2 self-start rounded-full bg-[#C8B289] px-5 py-2.5 text-xs font-semibold text-[#1B3B2B] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#DFCFAF] hover:shadow-md"
              >
                Cotizar jornada OTAM en Ajusco
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Card>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-7">
            <ScrollReveal delayMs={80}>
              <Card
                variant="sand"
                className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
              >
                <Droplets className="h-6 w-6 text-[#1B3B2B] transition-transform duration-300 group-hover:scale-110" />
                <h4 className="mt-4 font-editorial text-2xl font-semibold text-[#1B3B2B]">Agua</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                  Captación pluvial en zonas boscosas, grifería de bajo flujo y plantas de
                  tratamiento para riego de jardines sin desperdicio.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delayMs={160}>
              <Card
                variant="sand"
                className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
              >
                <Sun className="h-6 w-6 text-[#1B3B2B] transition-transform duration-300 group-hover:scale-110" />
                <h4 className="mt-4 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Energía
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                  Calentamiento solar térmico, iluminación LED cálida de bajo consumo y diseño
                  bioclimático que reduce climatización artificial.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delayMs={240}>
              <Card
                variant="sand"
                className="group h-full p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:bg-white hover:shadow-md"
              >
                <Recycle className="h-6 w-6 text-[#1B3B2B] transition-transform duration-300 group-hover:scale-110" />
                <h4 className="mt-4 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Residuos
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                  Eliminación de plásticos de un solo uso en habitaciones, compostaje de residuos de
                  cocina y amenidades recargables botánicas.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

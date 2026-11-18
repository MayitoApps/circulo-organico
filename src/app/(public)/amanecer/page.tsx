import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Coffee,
  Compass,
  Layers,
  Package,
  Shirt,
  Sparkles,
  Utensils,
} from "lucide-react";
import { AMANECER_ITEMS } from "@/lib/catalog-data";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow } from "@/components/ui/primitives";

const VOLUME_TIERS = [
  {
    range: "15 a 49 piezas",
    title: "Producción boutique y grupos privados",
    description:
      "Mínimos accesibles desde 15 piezas en líneas ejecutivas (chalecos, mandiles de taller, termos tipo Yeti) para consejos directivos, retiros íntimos o amenidades VIP.",
  },
  {
    range: "50 a 250 piezas",
    title: "Convenciones, retiros y equipos",
    description:
      "Escala ideal para kits de bienvenida, congresos empresariales, team buildings operados con OTAM y dotación de uniformes para eventos en nuestras 6 sedes.",
  },
  {
    range: "250 a +2,000 piezas",
    title: "Gran escala y campañas de marca",
    description:
      "Producción continua para onboarding anual, regalos corporativos de fin de año, lanzamientos nacionales y agencias con entregas por lote o multi-sede.",
  },
];

const MERCH_CATEGORIES = [
  {
    title: "Textil Corporativo y Exterior",
    icon: Shirt,
    examples: "Sudaderas de algodón peinado de alto gramaje, chalecos acolchados resistentes al viento y gorras de gabardina lavada.",
    minimum: "Desde 15 a 25 piezas",
    finishes: "Bordado tonal o 3D, parche tejido y serigrafía.",
  },
  {
    title: "Hidratación Térmica y Ecológica",
    icon: Sparkles,
    examples: "Termos tipo Yeti de doble pared al vacío para regalos directivos y botellas de aluminio reciclable con tapa de bambú o acero.",
    minimum: "Desde 15 a 30 piezas",
    finishes: "Grabado láser de alta precisión y acabado permanente.",
  },
  {
    title: "Experiencias y Gastronomía",
    icon: Utensils,
    examples: "Mandiles de lona orgánica con herrajes metálicos y bolsas frontales pensados para talleres culinarios, asados y dinámicas OTAM.",
    minimum: "Desde 15 piezas",
    finishes: "Grabado en piel vegana o bordado frontal.",
  },
  {
    title: "Mesa Artesanal y Hospitalidad",
    icon: Coffee,
    examples: "Tazas de cerámica esmaltada en tonos tierra y bosque para coffee breaks, habitaciones y regalos de oficina.",
    minimum: "Desde 24 piezas",
    finishes: "Impresión vitrificada o relieve artesanal.",
  },
  {
    title: "Viaje, Confort y Bienestar",
    icon: Compass,
    examples: "Morrales repelentes al agua con espacio acolchado para laptop, cobijas tejidas con cincho portador y toallas faciales de algodón turco (550 gsm).",
    minimum: "Desde 20 a 30 piezas",
    finishes: "Placa metálica, etiqueta en cincho o bordado en cenefa.",
  },
  {
    title: "Kits Curados y Piezas Especiales",
    icon: Package,
    examples: "Armado integral de welcome kits para habitaciones, paquetes de onboarding empresarial, sets conmemorativos y desarrollos bajo medida.",
    minimum: "Armado personalizado por proyecto",
    finishes: "Empaque curado e identidad visual de marca.",
  },
];

export default function AmanecerPage() {
  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. Encabezado + Volúmenes de producción */}
        <div className="grid items-start gap-8 border-b border-[#E4DDD1] pb-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionEyebrow className="animate-hero-1">
              Grupo Orgánico · Diseño y confección de marca
            </SectionEyebrow>
            <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium tracking-tight text-[#1B3B2B] sm:text-5xl">
              AMANECER - MERCHANDISING
            </h1>
            <p className="animate-hero-3 mt-4 text-lg leading-relaxed text-[#1B3B2B]">
              Diseñamos piezas y objetos personalizados con intención que trascienden el souvenir
              convencional.
            </p>
            <p className="animate-hero-3 mt-3 text-sm leading-relaxed text-[#4C524E]">
              Amanecer es nuestra línea de diseño y producción de merchandising personalizado para
              empresas, agencias organizadoras y eventos dentro de Grupo Orgánico. Combinamos
              materiales durables, paleta estética orgánica y acabados de marca listos para uso real.
            </p>

            {/* Cifras clave de capacidad */}
            <div className="animate-hero-4 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  {AMANECER_ITEMS.length} líneas
                </p>
                <p className="text-[11px] text-[#5E645F]">Base de catálogo + kits</p>
              </div>
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">15 pzas.</p>
                <p className="text-[11px] text-[#5E645F]">Pedido mínimo de arranque</p>
              </div>
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">+2,000</p>
                <p className="text-[11px] text-[#5E645F]">Piezas en gran escala</p>
              </div>
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">6 tipos</p>
                <p className="text-[11px] text-[#5E645F]">De familias y acabados</p>
              </div>
            </div>
          </div>

          {/* Tarjeta lateral: Cantidad y escalas de merchandising */}
          <Card
            variant="forest"
            className="animate-hero-3 p-7 transition-shadow duration-300 hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.35)] lg:col-span-5"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8B289]">
              <Layers className="h-3.5 w-3.5" />
              Cantidad y escalas de producción
            </span>
            <h2 className="mt-2 font-editorial text-2xl font-medium text-white">
              ¿Qué cantidad de merchandising podemos manejar?
            </h2>

            <div className="mt-5 space-y-4">
              {VOLUME_TIERS.map((tier) => (
                <div
                  key={tier.range}
                  className="rounded-2xl border border-white/15 bg-white/5 p-4 text-xs transition-all duration-300 hover:border-[#C8B289]/50 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#C8B289]">{tier.range}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                  </div>
                  <p className="mt-1 font-semibold text-white">{tier.title}</p>
                  <p className="mt-1 leading-relaxed text-white/80">{tier.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 2. Tipos de merchandising que manejamos */}
        <section className="mt-12">
          <ScrollReveal>
            <div className="max-w-3xl">
              <SectionEyebrow>Familias y aplicaciones</SectionEyebrow>
              <h2 className="mt-2 font-editorial text-3xl font-medium text-[#1B3B2B]">
                Tipos de merchandising que podemos manejar
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4C524E]">
                Trabajamos seis grandes categorías de objetos y textiles personalizables que se adaptan
                tanto a piezas individuales por lote como a kits completos de bienvenida o evento.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MERCH_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <ScrollReveal key={cat.title} delayMs={(idx % 3) * 90}>
                  <Card
                    variant="white"
                    className="group flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.18)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2EFE9] text-[#9E6B4B] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#1B3B2B] group-hover:text-[#C8B289]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-[#F2EFE9] px-3 py-1 text-[11px] font-semibold text-[#1B3B2B] transition-colors duration-300 group-hover:bg-[#EFE8DB]">
                          {cat.minimum}
                        </span>
                      </div>
                      <h3 className="mt-4 font-editorial text-2xl font-medium text-[#1B3B2B]">
                        {cat.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[#4C524E]">{cat.examples}</p>
                    </div>
                    <p className="mt-4 border-t border-[#EFE8DC] pt-3 text-[11px] font-medium text-[#5E645F]">
                      <span className="text-[#9E6B4B]">Acabados:</span> {cat.finishes}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* 3. Muestrario informativo de las 10 piezas de línea (solo lectura) */}
        <section className="mt-14 border-t border-[#E4DDD1] pt-12">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <SectionEyebrow>Líneas de catálogo de referencia</SectionEyebrow>
                <h2 className="mt-2 font-editorial text-3xl font-medium text-[#1B3B2B]">
                  Las {AMANECER_ITEMS.length} piezas base de Amanecer
                </h2>
                <p className="mt-2 text-sm text-[#4C524E]">
                  Referencia informativa de nuestras líneas disponibles, su técnica de personalización
                  recomendada y el volumen mínimo de fabricación por artículo.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {AMANECER_ITEMS.map((item, idx) => (
              <ScrollReveal key={item.id} delayMs={(idx % 5) * 60}>
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4DDD1] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_20px_40px_-18px_rgba(27,59,43,0.18)]">
                  <div className="relative h-40 overflow-hidden bg-[#F2EFE9]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
                        {item.category}
                      </span>
                      <h3 className="mt-0.5 font-editorial text-lg font-semibold text-[#1B3B2B]">
                        {item.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#4C524E]">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-3 border-t border-[#EFE8DC] pt-2.5 text-[11px] text-[#5E645F]">
                      <p className="font-medium text-[#1C201E]">{item.personalization}</p>
                      <p className="mt-1 font-semibold text-[#1B3B2B]">{item.minOrder}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 4. Integración informativa con Círculo Orgánico */}
        <ScrollReveal>
          <section className="mt-14 rounded-3xl border border-[#DFD6C7] bg-[#F2EFE9] p-7 transition-shadow duration-300 hover:shadow-md sm:p-9">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionEyebrow>Integración con Círculo Orgánico</SectionEyebrow>
                <h2 className="mt-2 font-editorial text-3xl font-medium text-[#1B3B2B]">
                  Merchandising conectado con tus estancias y eventos
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#4C524E]">
                  Amanecer se coordina directamente a través del convenio corporativo de tu empresa o
                  del equipo operativo de tu evento en Grupo Orgánico y OTAM, sin necesidad de gestiones
                  aisladas.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E4DDD1] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8B289] hover:shadow-xs">
                    <p className="flex items-center gap-2 text-xs font-semibold text-[#1B3B2B]">
                      <Building2 className="h-4 w-4 text-[#9E6B4B]" />
                      Para Empresas
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5E645F]">
                      Tus pedidos elegibles bajo convenio suman hacia tu nivel corporativo y acumulan{" "}
                      <strong className="text-[#1B3B2B]">2% en saldo a favor</strong>.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E4DDD1] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8B289] hover:shadow-xs">
                    <p className="flex items-center gap-2 text-xs font-semibold text-[#1B3B2B]">
                      <Briefcase className="h-4 w-4 text-[#9E6B4B]" />
                      Para Agencias y OTAM
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5E645F]">
                      Integra kits de bienvenida y uniformes de actividad dentro de eventos grupales en
                      cualquiera de las 6 sedes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
                <Link
                  href="/empresas"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md sm:w-auto"
                >
                  Ver programa para Empresas
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/agencias"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1B3B2B] bg-white px-6 py-3 text-xs font-semibold text-[#1B3B2B] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FAF8F5] hover:shadow-xs sm:w-auto"
                >
                  Ver programa para Agencias
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}

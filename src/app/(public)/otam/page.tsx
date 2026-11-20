import { CheckCircle2, Compass, ExternalLink, PlayCircle, Sparkles, Trees, Users } from "lucide-react";
import { auth } from "@/auth";
import {
  OTAM_CORPORATE_ACTIVITIES,
  OTAM_PERSONAL_ACTIVITIES,
} from "@/lib/catalog-data";
import { OtamCatalogClient } from "@/components/OtamCatalogClient";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, SectionEyebrow } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function OtamPage() {
  let defaultName = "";
  let defaultEmail = "";
  let defaultRequesterType: "PERSONA" | "EMPRESA" | "AGENCIA" = "PERSONA";

  try {
    const session = await auth();
    if (session?.user) {
      defaultName = `${session.user.firstName} ${session.user.lastName}`.trim();
      defaultEmail = session.user.email ?? "";
      if (session.user.role === "EMPRESA") defaultRequesterType = "EMPRESA";
      if (session.user.role === "AGENCIA") defaultRequesterType = "AGENCIA";
    }
  } catch {
    // ignore
  }

  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ¿Qué es OTAM? */}
        <div className="grid items-start gap-8 border-b border-[#E4DDD1] pb-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionEyebrow className="animate-hero-1">OTAM · Casa productora de experiencias</SectionEyebrow>
            <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Nuestra casa productora de experiencias
            </h1>
            <p className="animate-hero-3 mt-4 text-base leading-relaxed text-[#4C524E]">
              <strong className="text-[#1B3B2B]">OTAM</strong> es la casa productora de experiencias
              de <strong>Grupo Orgánico Hoteles Boutique</strong>. Nos encargamos de la planeación,
              organización y operación de actividades y momentos memorables hechos a la medida, para
              que tú y tu grupo solo se dediquen a disfrutar.
            </p>
            <p className="animate-hero-3 mt-3 text-sm leading-relaxed text-[#5E645F]">
              Todas nuestras experiencias están disponibles en cualquiera de las{" "}
              <strong className="text-[#1B3B2B]">6 propiedades de Grupo Orgánico</strong> y también
              bajo la modalidad <strong className="text-[#1B3B2B]">“OTAM Va Contigo”</strong> fuera
              de nuestros hoteles, llevándolas a cualquier lugar que tu imaginación o empresa
              proponga.
            </p>

            {/* Cifras reales de trayectoria OTAM */}
            <div className="animate-hero-4 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">+8 años</p>
                <p className="text-[11px] text-[#5E645F]">Creando experiencias</p>
              </div>
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">+50</p>
                <p className="text-[11px] text-[#5E645F]">Operadores capacitados</p>
              </div>
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">+150,000</p>
                <p className="text-[11px] text-[#5E645F]">Maletas llenas de sueños</p>
              </div>
              <div className="rounded-2xl border border-[#E4DDD1] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B289] hover:shadow-md">
                <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">+200,000</p>
                <p className="text-[11px] text-[#5E645F]">Sonrisas compartidas</p>
              </div>
            </div>

            <div className="animate-hero-4 mt-6">
              <a
                href="https://www.somosotam.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-[#1B3B2B] bg-white px-5 py-2.5 text-xs font-semibold text-[#1B3B2B] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F2EFE9] hover:shadow-sm"
              >
                Conocer sitio oficial de OTAM
                <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Tarjeta lateral: Déjalo en nuestras manos */}
          <Card variant="forest" className="animate-hero-3 p-7 transition-all duration-300 hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.35)] lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8B289]">
              <Sparkles className="h-3.5 w-3.5" />
              Déjalo en nuestras manos
            </span>
            <h2 className="mt-2 font-editorial text-2xl font-medium text-white">
              Producción llave en mano para momentos personales e integración
            </h2>

            <div className="mt-5 space-y-4 text-xs text-white/85">
              <div>
                <p className="flex items-center gap-1.5 font-semibold text-[#C8B289]">
                  <Compass className="h-3.5 w-3.5" /> Beneficios para ti
                </p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                    <span>Nos encargamos de todo: tú solo vives la experiencia.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                    <span>Vivencias hechas a la medida con ejecución impecable y sin estrés.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                    <span>Ahorro total de tiempo y energía operativa.</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-white/15 pt-4">
                <p className="flex items-center gap-1.5 font-semibold text-[#C8B289]">
                  <Users className="h-3.5 w-3.5" /> Impacto en integración de equipos
                </p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                    <span>Mejora conexión, comunicación, confianza y trabajo colaborativo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                    <span>Reduce el estrés y alinea a las personas con objetivos comunes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Video destacado OTAM */}
        <ScrollReveal className="mt-12 border-b border-[#E4DDD1] pb-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionEyebrow>OTAM en acción</SectionEyebrow>
              <h2 className="mt-1.5 flex items-center gap-2 font-editorial text-3xl font-medium text-[#1B3B2B]">
                <PlayCircle className="h-6 w-6 text-[#9E6B4B]" />
                Vive la experiencia OTAM
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-[#5E645F]">
              Mira cómo diseñamos e implementamos experiencias memorables en nuestras sedes y en
              locaciones externas.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#DFD2BA] bg-[#132A1E] p-2 shadow-[0_24px_54px_-24px_rgba(27,59,43,0.35)] sm:p-3">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src="https://www.youtube.com/embed/Hr1uMRNerKM?rel=0"
                title="Video OTAM · Casa productora de experiencias"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Catálogo interactivo OTAM */}
        <div className="mt-12">
          <ScrollReveal>
            <div className="mb-6 flex items-center gap-2">
              <Trees className="h-5 w-5 text-[#9E6B4B]" />
              <h2 className="font-editorial text-3xl font-medium text-[#1B3B2B]">
                Catálogo de experiencias OTAM
              </h2>
            </div>
          </ScrollReveal>

          <OtamCatalogClient
            personalActivities={OTAM_PERSONAL_ACTIVITIES}
            corporateActivities={OTAM_CORPORATE_ACTIVITIES}
            defaultContactName={defaultName}
            defaultContactEmail={defaultEmail}
            defaultRequesterType={defaultRequesterType}
          />
        </div>
      </div>
    </div>
  );
}

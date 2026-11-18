import { ExternalLink, MapPin, PawPrint, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getPropertiesSafe } from "@/lib/queries";
import { formatMxn } from "@/lib/loyalty-engine";
import { SectionEyebrow } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function HotelesPage() {
  const properties = await getPropertiesSafe();

  return (
    <div className="bg-[#FAF8F5] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <SectionEyebrow className="animate-hero-1">Nuestros seis hoteles</SectionEyebrow>
          <h1 className="animate-hero-2 mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
            Seis destinos, un mismo Círculo Orgánico
          </h1>
          <p className="animate-hero-3 mt-3 text-base leading-relaxed text-[#4C524E]">
            Conoce la ubicación, esencia y amenidades de cada una de nuestras seis propiedades y
            visita su sitio web oficial.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop, idx) => (
            <ScrollReveal key={prop.slug} delayMs={(idx % 3) * 90}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.22)]">
                <div className="relative h-56 overflow-hidden bg-[#F2EFE9]">
                  <img
                    src={prop.imageUrl}
                    alt={prop.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#FAF8F5]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1B3B2B] transition-colors duration-300 group-hover:bg-[#C8B289]">
                    {prop.regionLabel}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="font-editorial text-2xl font-medium">{prop.name}</h2>
                    <p className="text-xs text-white/85">{prop.tagline}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E645F]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9E6B4B]" />
                        {prop.location}
                      </span>
                      <span className="font-semibold text-[#1B3B2B] tabular-nums">
                        Desde {formatMxn(prop.baseNightPriceMxn)} / noche
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#4C524E]">{prop.description}</p>

                    <ul className="mt-3 space-y-1 text-xs text-[#5E645F]">
                      {prop.highlights.map((h) => (
                        <li key={h}>• {h}</li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {prop.hasSpaCenter && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EFE9] px-2.5 py-1 text-[11px] font-medium text-[#1B3B2B] transition-colors duration-200 group-hover:bg-[#EFE8DB]">
                          <Sparkles className="h-3 w-3 text-[#9E6B4B]" />
                          Centro de bienestar
                        </span>
                      )}
                      {prop.petFriendly && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EFE9] px-2.5 py-1 text-[11px] font-medium text-[#1B3B2B] transition-colors duration-200 group-hover:bg-[#EFE8DB]">
                          <PawPrint className="h-3 w-3 text-[#9E6B4B]" />
                          Pet-friendly
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={prop.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#132A1E] group-hover:shadow-md"
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
    </div>
  );
}

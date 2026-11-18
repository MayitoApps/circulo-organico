"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Gift, MapPin, Sparkles, Users } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { ExperienceMoment, MomentHotelKey } from "@/lib/catalog-data";
import { formatMxn, type ProfileRole } from "@/lib/loyalty-engine";
import { redeemCatalogExperienceAction } from "@/app/actions/member-actions";
import { cn } from "@/lib/utils";

interface HotelGroupMeta {
  key: MomentHotelKey;
  label: string;
  filterLabel: string;
  subtitle: string;
  officialUrl?: string;
}

const HOTEL_GROUPS: HotelGroupMeta[] = [
  {
    key: "origen",
    label: "Origen Centro Holístico y Spa",
    filterLabel: "Bienestar · Todas",
    subtitle: "Cabinas de masaje y rituales disponibles en nuestras sedes con centro de bienestar",
    officialUrl: "https://www.origencentroholisticoyspa.com/",
  },
  {
    key: "ajusco",
    label: "Orgánico Ajusco",
    filterLabel: "Ajusco",
    subtitle: "San Miguel Ajusco · 3,000 m s. n. m. · Momentos Íntimos, Rebeldía y Para Compartir",
    officialUrl: "https://www.organicohotelboutique.com/experiencias",
  },
  {
    key: "tepoztlan",
    label: "Orgánico Tepoztlán",
    filterLabel: "Tepoztlán",
    subtitle: "Pueblo Mágico · Faldas del Tepozteco · Cinema, jardines y aventura",
    officialUrl: "https://www.organicohotelboutiquetepoz.com/momentos",
  },
  {
    key: "valle",
    label: "Orgánico Valle",
    filterLabel: "Valle",
    subtitle: "Valle de Bravo · 6+ hectáreas de bosque, lago, fogatas y Origen Spa",
    officialUrl: "https://www.organicohotelboutiquevalle.com/momentos",
  },
  {
    key: "veracruz",
    label: "Orgánico Veracruz",
    filterLabel: "Veracruz",
    subtitle: "Costa Esmeralda · Restaurante El Muelle, playa privada y alberca frente al mar",
    officialUrl: "https://www.gohb.com.mx/hoteles-organicos",
  },
  {
    key: "quinta-soledad",
    label: "Quinta Soledad",
    filterLabel: "Quinta Soledad",
    subtitle: "Centro Cultural en Tlalpan (1870) · Cenas bajo faroles, maridajes y talleres",
    officialUrl: "https://www.centroculturalquintasoledad.com/momentos",
  },
  {
    key: "roma-norte",
    label: "Roma Norte · Frontera 49",
    filterLabel: "Roma Norte",
    subtitle: "Frontera 49, CDMX · Rooftop, Foro Cultural, cine boutique y cena de autor",
    officialUrl: "https://www.frontera49.com/momentos",
  },
];

export function ExperiencesClient({
  moments,
  sessionRole,
  availableBalance,
}: {
  moments: ExperienceMoment[];
  sessionRole?: ProfileRole | null;
  availableBalance: number;
}) {
  const router = useRouter();
  const [selectedHotel, setSelectedHotel] = useState<"todas" | MomentHotelKey>("todas");
  const [statusMessage, setStatusMessage] = useState<{
    id: string;
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRedeem = (moment: ExperienceMoment) => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await redeemCatalogExperienceAction(moment.id);
      if (!res.ok) {
        setStatusMessage({ id: moment.id, type: "err", text: res.error });
        return;
      }
      setStatusMessage({
        id: moment.id,
        type: "ok",
        text: `¡Canje confirmado! Se generó tu certificado "${moment.title}" en tu panel.`,
      });
      router.refresh();
    });
  };

  const renderMomentCard = (m: ExperienceMoment, idx: number, filterKey: string) => {
    const canRedeem =
      (sessionRole === "SOCIO_PERSONAL" || sessionRole === "EMPRESA") &&
      availableBalance >= m.pointsCost;
    const feedback = statusMessage?.id === m.id ? statusMessage : null;

    return (
      <ScrollReveal key={`${filterKey}-${m.id}`} delayMs={(idx % 3) * 80}>
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.22)]">
          <div className="relative h-52 overflow-hidden bg-[#F2EFE9]">
            <img
              src={m.imageUrl}
              alt={`${m.title} — ${m.hotelName}`}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
            <span className="absolute left-4 top-4 rounded-full bg-[#FAF8F5]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B] transition-colors duration-300 group-hover:bg-[#C8B289] group-hover:text-[#1B3B2B]">
              {m.badge}
            </span>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#DFCFAF]">
                {m.hotelName}
              </p>
              <h3 className="mt-0.5 font-editorial text-2xl font-medium">{m.title}</h3>
              <p className="text-xs text-white/85">{m.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <p className="text-sm leading-relaxed text-[#4C524E]">{m.description}</p>

              <div className="mt-4 space-y-1.5 border-y border-[#EFE8DC] py-3 text-xs text-[#4C524E]">
                <p className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0 text-[#9E6B4B]" />
                  <span>{m.capacity}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9E6B4B]" />
                  <span>{m.properties.join(" · ")}</span>
                </p>
              </div>

              <ul className="mt-4 space-y-1.5 text-xs text-[#1C201E]">
                {m.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3B2B]" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-[#EFE8DC] pt-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                    Canje 100% catálogo
                  </span>
                  <p className="font-editorial text-2xl font-semibold text-[#1B3B2B] tabular-nums">
                    {m.pointsCost.toLocaleString("es-MX")} pts
                  </p>
                </div>
                <span className="text-xs text-[#5E645F] tabular-nums">
                  Equiv. {formatMxn(m.mxnReference)}
                </span>
              </div>

              {feedback && (
                <div
                  className={cn(
                    "mt-3 rounded-xl px-3 py-2 text-xs",
                    feedback.type === "ok"
                      ? "bg-[#E6F2EB] text-[#1B3B2B]"
                      : "bg-[#FCECEC] text-[#9B2C2C]"
                  )}
                >
                  {feedback.text}
                </div>
              )}

              {m.isGiftForGoldDiamond && sessionRole === "SOCIO_PERSONAL" ? (
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/mi-circulo/masaje"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#C8B289] px-4 py-2.5 text-xs font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#DFCFAF]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Ver mi masaje gratis
                  </Link>
                  <button
                    type="button"
                    disabled={!canRedeem || isPending}
                    onClick={() => handleRedeem(m)}
                    className="rounded-full border border-[#1B3B2B]/25 px-4 py-2.5 text-xs font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F2EFE9] disabled:opacity-45"
                  >
                    Canjear pts
                  </button>
                </div>
              ) : sessionRole === "SOCIO_PERSONAL" || sessionRole === "EMPRESA" ? (
                <button
                  type="button"
                  disabled={!canRedeem || isPending}
                  onClick={() => handleRedeem(m)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#132A1E] disabled:cursor-not-allowed disabled:bg-[#D5CFC4] disabled:text-[#5E645F] disabled:hover:translate-y-0"
                >
                  <Gift className="h-3.5 w-3.5" />
                  {canRedeem
                    ? isPending
                      ? "Canjeando..."
                      : "Canjear al 100% ahora"
                    : `Te faltan ${(m.pointsCost - availableBalance).toLocaleString("es-MX")} pts`}
                </button>
              ) : (
                <Link
                  href="/entrar"
                  className="mt-3 block w-full rounded-full border border-[#1B3B2B] px-4 py-2.5 text-center text-xs font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1B3B2B] hover:text-white"
                >
                  Entra para canjear con tus puntos
                </Link>
              )}
            </div>
          </div>
        </article>
      </ScrollReveal>
    );
  };

  const visibleGroups =
    selectedHotel === "todas"
      ? HOTEL_GROUPS
      : HOTEL_GROUPS.filter((g) => g.key === selectedHotel || g.key === "origen");

  return (
    <div>
      {/* Filtro por hotel */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedHotel("todas")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5",
            selectedHotel === "todas"
              ? "border-[#1B3B2B] bg-[#1B3B2B] text-white shadow-xs"
              : "border-[#E4DDD1] bg-white text-[#4C524E] hover:border-[#C8B289] hover:text-[#1B3B2B]"
          )}
        >
          Todos los hoteles ({moments.length})
        </button>

        {HOTEL_GROUPS.filter((g) => g.key !== "origen").map((group) => {
          const count = moments.filter((m) => m.hotelKey === group.key).length;
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => setSelectedHotel(group.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5",
                selectedHotel === group.key
                  ? "border-[#1B3B2B] bg-[#1B3B2B] text-white shadow-xs"
                  : "border-[#E4DDD1] bg-white text-[#4C524E] hover:border-[#C8B289] hover:text-[#1B3B2B]"
              )}
            >
              {group.filterLabel} ({count})
            </button>
          );
        })}
      </div>

      {/* Secciones agrupadas por hotel */}
      <div className="mt-10 space-y-14">
        {visibleGroups.map((group) => {
          const groupMoments = moments.filter((m) => m.hotelKey === group.key);
          if (groupMoments.length === 0) return null;

          return (
            <section key={group.key} className="border-t border-[#E4DDD1] pt-8 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9E6B4B]">
                    {group.key === "origen" ? "Bienestar transversal" : `Momentos en ${group.filterLabel}`} · {groupMoments.length}{" "}
                    {groupMoments.length === 1 ? "experiencia" : "experiencias"}
                  </p>
                  <h2 className="mt-1 font-editorial text-3xl font-medium text-[#1B3B2B]">
                    {group.label}
                  </h2>
                  <p className="mt-1 text-xs text-[#5E645F]">{group.subtitle}</p>
                </div>

                {group.officialUrl && (
                  <a
                    href={group.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-[#DFD2BA] bg-white px-4 py-1.5 text-[11px] font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1B3B2B] hover:bg-[#F2EFE9]"
                  >
                    Ver en sitio oficial
                    <ExternalLink className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>

              <div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {groupMoments.map((m, idx) => renderMomentCard(m, idx, selectedHotel))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

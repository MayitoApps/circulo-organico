"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { OtamActivity } from "@/lib/catalog-data";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CANONICAL_PROPERTIES } from "@/lib/properties-data";
import { submitQuoteRequestAction } from "@/app/actions/quote-actions";
import { inputBaseClass, labelBaseClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function OtamCatalogClient({
  personalActivities,
  corporateActivities,
  defaultContactName = "",
  defaultContactEmail = "",
  defaultRequesterType = "PERSONA",
}: {
  personalActivities: OtamActivity[];
  corporateActivities: OtamActivity[];
  defaultContactName?: string;
  defaultContactEmail?: string;
  defaultRequesterType?: "PERSONA" | "EMPRESA" | "AGENCIA";
}) {
  const [activeTab, setActiveTab] = useState<"PERSONAL" | "CORPORATIVO">(
    defaultRequesterType === "PERSONA" ? "PERSONAL" : "CORPORATIVO"
  );
  const [selectedActivity, setSelectedActivity] = useState<OtamActivity | null>(null);

  // Estado del modal de propuesta
  const [requesterType, setRequesterType] = useState<"PERSONA" | "EMPRESA" | "AGENCIA">(
    defaultRequesterType
  );
  const [propertySlug, setPropertySlug] = useState("ajusco");
  const [participantsCount, setParticipantsCount] = useState(25);
  const [preferredDate, setPreferredDate] = useState("2027-02-20");
  const [payWithPointsOrBalance, setPayWithPointsOrBalance] = useState(false);
  const [contactName, setContactName] = useState(defaultContactName);
  const [contactEmail, setContactEmail] = useState(defaultContactEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const activities = activeTab === "PERSONAL" ? personalActivities : corporateActivities;

  const openModal = (act: OtamActivity) => {
    setSelectedActivity(act);
    setFeedback(null);
    if (act.audience === "PERSONAL") {
      setRequesterType("PERSONA");
      setParticipantsCount(2);
    } else {
      setRequesterType(defaultRequesterType === "AGENCIA" ? "AGENCIA" : "EMPRESA");
      setParticipantsCount(30);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await submitQuoteRequestAction({
        category: activeTab === "PERSONAL" ? "OTAM_PERSONAL" : "OTAM_CORPORATIVO",
        requesterType,
        propertySlug,
        experienceOrItems: [
          {
            name: selectedActivity.title,
            quantity: participantsCount,
            notes: notes || undefined,
          },
        ],
        participantsCount,
        preferredDate,
        payWithPointsOrBalance,
        contactName,
        contactEmail,
        contactPhone,
        notes,
      });

      if (!res.ok) {
        setFeedback({ type: "err", text: res.error });
        return;
      }

      setFeedback({
        type: "ok",
        text: "Propuesta solicitada con éxito. Nuestro equipo OTAM te contactará con el itinerario y desglose neto.",
      });
    });
  };

  return (
    <div>
      {/* Pestañas OTAM */}
      <div className="inline-flex rounded-full border border-[#DFD6C7] bg-[#F2EFE9] p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("PERSONAL")}
          className={cn(
            "rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "PERSONAL"
              ? "bg-[#1B3B2B] text-white shadow-xs"
              : "text-[#4C524E] hover:text-[#1B3B2B]"
          )}
        >
          Personal y Amigos ({personalActivities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("CORPORATIVO")}
          className={cn(
            "rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "CORPORATIVO"
              ? "bg-[#1B3B2B] text-white shadow-xs"
              : "text-[#4C524E] hover:text-[#1B3B2B]"
          )}
        >
          Empresas, Agencias y Grupos ({corporateActivities.length})
        </button>
      </div>

      {/* Grid de actividades */}
      <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((act, idx) => (
          <ScrollReveal key={act.id} delayMs={(idx % 3) * 80}>
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C8B289] hover:shadow-[0_24px_48px_-18px_rgba(27,59,43,0.22)]">
              <div className="relative h-48 overflow-hidden bg-[#F2EFE9]">
                <img
                  src={act.imageUrl}
                  alt={act.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h2 className="font-editorial text-2xl font-medium">{act.title}</h2>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[#1B3B2B]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EFE9] px-2.5 py-1 transition-colors duration-200 group-hover:bg-[#EFE8DB]">
                      <Users className="h-3 w-3 text-[#9E6B4B]" />
                      {act.paxRange}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EFE9] px-2.5 py-1 transition-colors duration-200 group-hover:bg-[#EFE8DB]">
                      <Clock className="h-3 w-3 text-[#9E6B4B]" />
                      {act.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EFE9] px-2.5 py-1 transition-colors duration-200 group-hover:bg-[#EFE8DB]">
                      <MapPin className="h-3 w-3 text-[#9E6B4B]" />
                      {act.propertiesLabel}
                    </span>
                  </div>

                  <p className="mt-3.5 text-sm leading-relaxed text-[#4C524E]">{act.description}</p>

                  <ul className="mt-4 space-y-1.5 text-xs text-[#1C201E]">
                    {act.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3B2B]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openModal(act)}
                  className="mt-6 w-full rounded-full bg-[#1B3B2B] px-5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#132A1E] group-hover:shadow-md"
                >
                  {act.audience === "PERSONAL"
                    ? "Solicitar experiencia"
                    : "Pedir propuesta grupal"}
                </button>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>

      {/* Modal de Propuesta OTAM */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-hero-1 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E4DDD1] bg-[#FAF8F5] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9E6B4B]">
                  Solicitud OTAM
                </span>
                <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  {selectedActivity.title}
                </h3>
                <p className="mt-0.5 text-xs text-[#5E645F]">
                  {selectedActivity.paxRange} · {selectedActivity.duration} ·{" "}
                  {selectedActivity.propertiesLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-full border border-[#DCD4C6] bg-white p-1.5 text-[#4C524E] hover:text-[#1B3B2B]"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelBaseClass}>Perfil solicitante</label>
                  <select
                    value={requesterType}
                    onChange={(e) =>
                      setRequesterType(e.target.value as "PERSONA" | "EMPRESA" | "AGENCIA")
                    }
                    className={inputBaseClass}
                  >
                    <option value="PERSONA">Personal / Amigos</option>
                    <option value="EMPRESA">Empresa (hasta 10% con saldo)</option>
                    <option value="AGENCIA">Agencia / Organizador</option>
                  </select>
                </div>

                <div>
                  <label className={labelBaseClass}>Sede de interés</label>
                  <select
                    value={propertySlug}
                    onChange={(e) => setPropertySlug(e.target.value)}
                    className={inputBaseClass}
                  >
                    {CANONICAL_PROPERTIES.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelBaseClass}>Participantes</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Math.max(1, Number(e.target.value)))}
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Fecha preferida</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelBaseClass}>Nombre de contacto</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nombre completo"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+52 55 0000 0000"
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelBaseClass}>Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contacto@ejemplo.com"
                  className={inputBaseClass}
                />
              </div>

              <div>
                <label className={labelBaseClass}>Notas del evento o requerimientos</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Restricciones alimentarias, horarios o combinación con hospedaje..."
                  className={inputBaseClass}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-[#DFD2BA] bg-[#F2EFE9] p-3.5 text-xs text-[#1B3B2B]">
                <input
                  type="checkbox"
                  checked={payWithPointsOrBalance}
                  onChange={(e) => setPayWithPointsOrBalance(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#1B3B2B]"
                />
                <span>
                  <strong className="font-semibold">
                    Deseo pagar parcial o totalmente con mis puntos o saldo a favor
                  </strong>
                  <span className="mt-0.5 block text-[11px] text-[#5E645F]">
                    Cuentas Empresa pueden cubrir hasta 10% de un evento con su saldo del 2%.
                  </span>
                </span>
              </label>

              {feedback && (
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 text-xs",
                    feedback.type === "ok"
                      ? "bg-[#E6F2EB] text-[#1B3B2B]"
                      : "bg-[#FCECEC] text-[#9B2C2C]"
                  )}
                >
                  {feedback.text}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="rounded-full border border-[#DCD4C6] bg-white px-5 py-2.5 text-xs font-semibold text-[#4C524E]"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3B2B] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#132A1E] disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#C8B289]" />
                  {isPending ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, Sparkles } from "lucide-react";
import { CANONICAL_PROPERTIES } from "@/lib/properties-data";
import { requestMassageAppointmentAction } from "@/app/actions/member-actions";
import {
  Card,
  inputBaseClass,
  labelBaseClass,
  SectionEyebrow,
  StatusBadge,
  TierBadge,
} from "@/components/ui/primitives";
import { formatLongDate } from "@/lib/utils";
import type { Tier } from "@/lib/loyalty-engine";

export interface MassageCertView {
  id: string;
  title: string;
  beneficiaryName: string | null;
  status: string;
  preferredPropertyName: string | null;
  preferredDate: string | null;
  preferredTimeSlot: string | null;
  expiresAt: string;
}

const TIME_SLOTS = ["10:00 hrs", "12:00 hrs", "14:00 hrs", "16:00 hrs", "18:00 hrs"];

export function MassageRequestClient({
  tier,
  certificates,
}: {
  tier: Tier;
  certificates: MassageCertView[];
}) {
  const router = useRouter();
  const availableCerts = certificates.filter((c) => c.status === "DISPONIBLE");
  const [selectedCertId, setSelectedCertId] = useState(availableCerts[0]?.id ?? "");
  const [propertySlug, setPropertySlug] = useState("valle");
  const [preferredDate, setPreferredDate] = useState("2026-12-05");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("16:00 hrs");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertId) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await requestMassageAppointmentAction({
        certificateId: selectedCertId,
        propertySlug,
        preferredDate,
        preferredTimeSlot,
      });

      if (!res.ok) {
        setFeedback({ ok: false, text: res.error });
        return;
      }

      setFeedback({
        ok: true,
        text: "Tu solicitud de cita fue enviada al centro de bienestar. En breve recibirás confirmación.",
      });
      router.refresh();
    });
  };

  return (
    <div className="bg-[#FAF8F5] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/mi-circulo"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#5E645F] hover:text-[#1B3B2B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Mi Círculo
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <SectionEyebrow>Beneficio de bienestar incluido</SectionEyebrow>
              <TierBadge tier={tier} />
            </div>
            <h1 className="mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Tu masaje de regalo
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4C524E]">
              Sesión relajante de 60 minutos sin costo en puntos.{" "}
              <strong className="text-[#1B3B2B]">
                Puedes acudir directamente al centro de bienestar de cualquiera de nuestras sedes
                sin necesidad de reservar noche de hotel.
              </strong>
            </p>
          </div>
        </div>

        {tier === "ORIGEN" ? (
          <Card variant="sand" className="mt-8 p-8">
            <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
              Beneficio exclusivo para niveles Oro y Diamante
            </h2>
            <p className="mt-2 text-sm text-[#4C524E]">
              Al alcanzar 6 noches pagadas o $18,000 MXN netos en 12 meses, recibirás
              automáticamente 1 masaje relajante de 60 min cada 12 meses (y hasta 2 en Diamante).
            </p>
            <Link
              href="/niveles"
              className="mt-5 inline-flex rounded-full bg-[#1B3B2B] px-5 py-2.5 text-xs font-semibold text-white"
            >
              Ver metas de nivel
            </Link>
          </Card>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Listado de sesiones del socio */}
            <div className="space-y-4 lg:col-span-6">
              <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                Tus certificados de masaje ({certificates.length})
              </h2>

              {certificates.length === 0 ? (
                <Card variant="sand" className="p-6 text-sm text-[#4C524E]">
                  No tienes certificados emitidos en este periodo todavía.
                </Card>
              ) : (
                certificates.map((cert) => (
                  <Card key={cert.id} variant="white" className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#C8B289]">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-editorial text-xl font-semibold text-[#1B3B2B]">
                            {cert.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#5E645F]">
                            Vence el{" "}
                            <strong className="text-[#1C201E]">
                              {formatLongDate(cert.expiresAt)}
                            </strong>
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        label={
                          cert.status === "DISPONIBLE"
                            ? "Disponible"
                            : cert.status === "CITA_SOLICITADA"
                              ? "Solicitada"
                              : cert.status === "CONFIRMADO"
                                ? "Confirmada"
                                : cert.status
                        }
                        tone={
                          cert.status === "DISPONIBLE"
                            ? "success"
                            : cert.status === "CITA_SOLICITADA"
                              ? "warning"
                              : cert.status === "CONFIRMADO"
                                ? "info"
                                : "neutral"
                        }
                      />
                    </div>

                    {(cert.preferredPropertyName || cert.preferredDate) && (
                      <div className="mt-4 flex flex-wrap gap-3 rounded-xl bg-[#FAF8F5] px-3.5 py-2.5 text-xs text-[#4C524E]">
                        {cert.preferredPropertyName && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#9E6B4B]" />
                            {cert.preferredPropertyName}
                          </span>
                        )}
                        {cert.preferredDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-[#9E6B4B]" />
                            {formatLongDate(cert.preferredDate)}
                          </span>
                        )}
                        {cert.preferredTimeSlot && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#9E6B4B]" />
                            {cert.preferredTimeSlot}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>

            {/* Formulario Solicitar mi cita */}
            <Card variant="white" className="p-6 sm:p-7 lg:col-span-6">
              <SectionEyebrow>Reserva de cabina</SectionEyebrow>
              <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                Solicitar mi cita
              </h2>
              <p className="mt-1.5 text-xs text-[#5E645F]">
                Elige sede, fecha y horario preferido. Nuestro equipo de recepción confirmará la
                disponibilidad en cabina.
              </p>

              {availableCerts.length === 0 ? (
                <div className="mt-5 rounded-2xl bg-[#F2EFE9] p-5 text-xs text-[#4C524E]">
                  <CheckCircle2 className="mb-2 h-5 w-5 text-[#1B3B2B]" />
                  Tus sesiones de este periodo de 12 meses ya tienen cita solicitada, confirmada o
                  utilizada.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className={labelBaseClass}>Sesión disponible a utilizar</label>
                    <select
                      value={selectedCertId}
                      onChange={(e) => setSelectedCertId(e.target.value)}
                      className={inputBaseClass}
                    >
                      {availableCerts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} (Vence {formatLongDate(c.expiresAt)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelBaseClass}>Sede con centro de bienestar</label>
                    <select
                      value={propertySlug}
                      onChange={(e) => setPropertySlug(e.target.value)}
                      className={inputBaseClass}
                    >
                      {CANONICAL_PROPERTIES.filter((p) => p.hasSpaCenter).map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name} — {p.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelBaseClass}>Fecha preferida</label>
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className={inputBaseClass}
                      />
                    </div>
                    <div>
                      <label className={labelBaseClass}>Horario preferido</label>
                      <select
                        value={preferredTimeSlot}
                        onChange={(e) => setPreferredTimeSlot(e.target.value)}
                        className={inputBaseClass}
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {feedback && (
                    <div
                      className={`rounded-xl px-4 py-3 text-xs ${
                        feedback.ok
                          ? "bg-[#E6F2EB] text-[#1B3B2B]"
                          : "bg-[#FCECEC] text-[#9B2C2C]"
                      }`}
                    >
                      {feedback.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-full bg-[#1B3B2B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#132A1E] disabled:opacity-60"
                  >
                    {isPending ? "Enviando solicitud..." : "Solicitar mi cita"}
                  </button>
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Gift,
  Plus,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { MemberCard } from "@/components/MemberCard";
import {
  Card,
  inputBaseClass,
  labelBaseClass,
  SectionEyebrow,
  StatusBadge,
  TierBadge,
} from "@/components/ui/primitives";
import {
  calculateAgencyEventBenefits,
  formatMxn,
  type Tier,
} from "@/lib/loyalty-engine";
import { CANONICAL_PROPERTIES } from "@/lib/properties-data";
import {
  designateCertificateBeneficiaryAction,
  registerAgencyEventProspectAction,
} from "@/app/actions/member-actions";
import { formatShortDate } from "@/lib/utils";

export function AgenciaPortalClient({
  agencyName,
  rfc,
  membershipNumber,
  qrToken,
  tier,
  status,
  pointsBalance,
  realizedTotalMxn,
  commissionPaidMxn,
  commissionPendingMxn,
  events,
  certificates,
}: {
  agencyName: string;
  rfc: string;
  membershipNumber: string;
  qrToken: string;
  tier: Tier;
  status: string;
  pointsBalance: number;
  realizedTotalMxn: number;
  commissionPaidMxn: number;
  commissionPendingMxn: number;
  events: Array<{
    id: string;
    code: string;
    clientName: string;
    propertyName: string;
    eventDate: string;
    netAmountMxn: number;
    eventTier: Tier;
    status: string;
    commissionPercentage: number;
    commissionAmountMxn: number;
    commissionStatus: string;
    pointsGenerated: number;
    pointsReleased: boolean;
    rewardSummary: string;
  }>;
  certificates: Array<{
    id: string;
    type: string;
    title: string;
    eventCode: string | null;
    beneficiaryName: string | null;
    status: string;
    propertyName: string | null;
    periodStart: string;
    expiresAt: string;
  }>;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [propertySlug, setPropertySlug] = useState("quinta-soledad");
  const [eventDate, setEventDate] = useState("2027-03-15");
  const [netAmount, setNetAmount] = useState(180000);
  const [modalFeedback, setModalFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [beneficiaryDrafts, setBeneficiaryDrafts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const c of certificates) {
      map[c.id] = c.beneficiaryName ?? "";
    }
    return map;
  });
  const [certFeedback, setCertFeedback] = useState<{ id: string; ok: boolean; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const prospectPreview = useMemo(
    () => calculateAgencyEventBenefits(netAmount),
    [netAmount]
  );

  const handleRegisterProspect = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    startTransition(async () => {
      const res = await registerAgencyEventProspectAction({
        clientName,
        propertySlug,
        eventDate,
        netAmountMxn: netAmount,
      });
      if (!res.ok) {
        setModalFeedback({ ok: false, text: res.error });
        return;
      }
      setModalFeedback({
        ok: true,
        text: "Prospecto de evento registrado. Aparece como Próximo evento hasta su liquidación.",
      });
      setClientName("");
      router.refresh();
    });
  };

  const handleSaveBeneficiary = (certId: string) => {
    const name = beneficiaryDrafts[certId] ?? "";
    setCertFeedback(null);
    startTransition(async () => {
      const res = await designateCertificateBeneficiaryAction(certId, name);
      if (!res.ok) {
        setCertFeedback({ id: certId, ok: false, text: res.error });
        return;
      }
      setCertFeedback({ id: certId, ok: true, text: "Beneficiario asignado." });
      router.refresh();
    });
  };

  return (
    <div className="bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl space-y-9 px-4 sm:px-6 lg:px-8">
        {status === "PENDIENTE_CONVENIO" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8D1A3] bg-[#FBF3E2] px-5 py-4 text-xs text-[#8A5A19]">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                <strong>Convenio de agencia en revisión:</strong> Puedes pre-registrar eventos; la
                liberación de comisiones y certificados se habilita al aprobarse el convenio en{" "}
                <code className="font-mono">/admin</code>.
              </span>
            </div>
            <StatusBadge label="Pendiente de convenio" tone="warning" />
          </div>
        )}

        {/* Encabezado + Botón Registrar cliente / evento */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <SectionEyebrow>Portal Agencias y Organizadores</SectionEyebrow>
              <TierBadge tier={tier} />
            </div>
            <h1 className="mt-2 font-editorial text-4xl font-medium text-[#1B3B2B]">
              {agencyName}
            </h1>
            <p className="mt-1 text-sm text-[#4C524E]">
              RFC {rfc} · Evaluación independiente por cada evento realizado y pagado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalFeedback(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#1B3B2B] px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#132A1E]"
          >
            <Plus className="h-4 w-4 text-[#C8B289]" />
            Registrar un cliente / evento
          </button>
        </div>

        {/* 4 Tarjetas KPI Superiores */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="white" className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
              Eventos Realizados
            </p>
            <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
              {formatMxn(realizedTotalMxn)}
            </p>
            <p className="mt-1 text-xs text-[#5E645F]">Monto total realizado y pagado</p>
          </Card>

          <Card variant="sand" className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
              Comisión Pagada
            </p>
            <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
              {formatMxn(commissionPaidMxn)}
            </p>
            <p className="mt-1 text-xs text-[#5E645F]">Liquidada a la agencia</p>
          </Card>

          <Card variant="white" className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
              Comisión por Recibir
            </p>
            <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#9E6B4B] tabular-nums">
              {formatMxn(commissionPendingMxn)}
            </p>
            <p className="mt-1 text-xs text-[#5E645F]">Autorizada pendiente de pago</p>
          </Card>

          <Card variant="obsidian" className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#C8B289]">
              Puntos Disponibles
            </p>
            <p className="mt-1.5 font-editorial text-3xl font-semibold text-white tabular-nums">
              {pointsBalance.toLocaleString("es-MX")} pts
            </p>
            <p className="mt-1 text-xs text-white/75">Equivale a {formatMxn(pointsBalance)}</p>
          </Card>
        </div>

        {/* Tabla "El detalle de tus eventos" */}
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionEyebrow>Cálculo por evento individual</SectionEyebrow>
              <h2 className="mt-1 font-editorial text-3xl font-medium text-[#1B3B2B]">
                El detalle de tus eventos
              </h2>
            </div>
            <span className="text-xs text-[#5E645F]">
              Los eventos próximos muestran puntos estimados sin liberar regalos hasta su pago.
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80 text-xs uppercase tracking-[0.12em] text-[#5E645F]">
                    <th className="px-5 py-3.5">Código y Sede</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5">Monto y Nivel</th>
                    <th className="px-5 py-3.5">Comisión</th>
                    <th className="px-5 py-3.5">Puntos</th>
                    <th className="px-5 py-3.5">Regalos liberados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DC]">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#FAF8F5]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1B3B2B]">
                          {ev.code} · {ev.propertyName}
                        </p>
                        <p className="text-xs text-[#5E645F]">
                          {ev.clientName} · {formatShortDate(ev.eventDate)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={
                            ev.status === "REALIZADO_Y_PAGADO"
                              ? "Realizado y pagado"
                              : "Próximo evento"
                          }
                          tone={ev.status === "REALIZADO_Y_PAGADO" ? "success" : "warning"}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1C201E] tabular-nums">
                          {formatMxn(ev.netAmountMxn)}
                        </p>
                        <div className="mt-1">
                          <TierBadge tier={ev.eventTier} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#1C201E] tabular-nums">
                          {formatMxn(ev.commissionAmountMxn)} ({ev.commissionPercentage}%)
                        </p>
                        <div className="mt-1">
                          <StatusBadge
                            label={
                              ev.commissionStatus === "PAGADA"
                                ? "Pagada"
                                : ev.commissionStatus === "AUTORIZADA"
                                  ? "Autorizada"
                                  : "Sin comisión"
                            }
                            tone={
                              ev.commissionStatus === "PAGADA"
                                ? "success"
                                : ev.commissionStatus === "AUTORIZADA"
                                  ? "info"
                                  : "neutral"
                            }
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 tabular-nums">
                        <p className="font-semibold text-[#1B3B2B]">
                          {ev.pointsGenerated.toLocaleString("es-MX")} pts
                        </p>
                        <p className="text-[11px] text-[#5E645F]">
                          {ev.pointsReleased ? "Disponibles" : "Estimados"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#4C524E]">
                        {ev.status === "REALIZADO_Y_PAGADO" ? (
                          <span className="font-medium text-[#1B3B2B]">{ev.rewardSummary}</span>
                        ) : (
                          <span className="text-[#8E938E]">Pendiente al realizar y pagar</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Certificados de Regalo y Tarjeta de Agencia */}
        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div>
              <SectionEyebrow>Autorización de beneficiarios</SectionEyebrow>
              <h2 className="mt-1 font-editorial text-3xl font-medium text-[#1B3B2B]">
                Certificados de regalo liberados ({certificates.length})
              </h2>
              <p className="mt-1 text-xs text-[#5E645F]">
                Las noches incluyen habitación estándar e impuestos (vigencia 12 meses). Cada
                certificado conserva sus fechas propias sin unirse entre distintos eventos.
              </p>
            </div>

            {certificates.map((cert) => {
              const fb = certFeedback?.id === cert.id ? certFeedback : null;
              return (
                <Card key={cert.id} variant="white" className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#C8B289]">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-editorial text-xl font-semibold text-[#1B3B2B]">
                          {cert.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#5E645F]">
                          {cert.propertyName ? `${cert.propertyName} · ` : ""}
                          Vigencia: {formatShortDate(cert.periodStart)} al{" "}
                          {formatShortDate(cert.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={cert.status}
                      tone={cert.status === "DISPONIBLE" ? "success" : "neutral"}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-[#EFE8DC] pt-3.5">
                    <UserCheck className="h-4 w-4 text-[#9E6B4B]" />
                    <input
                      type="text"
                      value={beneficiaryDrafts[cert.id] ?? ""}
                      onChange={(e) =>
                        setBeneficiaryDrafts((prev) => ({ ...prev, [cert.id]: e.target.value }))
                      }
                      placeholder="Nombre del beneficiario autorizado"
                      className="min-w-[220px] flex-1 rounded-xl border border-[#DCD4C6] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#1C201E] focus:border-[#1B3B2B] focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveBeneficiary(cert.id)}
                      className="rounded-full bg-[#1B3B2B] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#132A1E]"
                    >
                      Designar beneficiario
                    </button>
                  </div>
                  {fb && (
                    <p
                      className={`mt-2 text-xs ${fb.ok ? "text-[#1B3B2B]" : "text-[#9B2C2C]"}`}
                    >
                      {fb.text}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col items-center lg:col-span-5 lg:items-end">
            <MemberCard
              holderName={agencyName}
              membershipNumber={membershipNumber}
              tier={tier}
              qrValue={`circulo-organico://qr/${qrToken}`}
              accountTypeLabel="Agencia & Eventos"
              downloadable
            />
          </div>
        </div>

        {/* Modal: Registrar cliente / evento */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-lg rounded-3xl border border-[#E4DDD1] bg-[#FAF8F5] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SectionEyebrow>Nuevo prospecto</SectionEyebrow>
                  <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                    Registrar un cliente / evento
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-[#DCD4C6] bg-white p-1.5 text-[#4C524E]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterProspect} className="mt-5 space-y-4">
                <div>
                  <label className={labelBaseClass}>Nombre del cliente final</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Corporativo Aurora / Boda Martínez"
                    className={inputBaseClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelBaseClass}>Sede del evento</label>
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
                  <div>
                    <label className={labelBaseClass}>Fecha tentativa</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={inputBaseClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelBaseClass}>Monto neto estimado (MXN, sin impuestos)</label>
                  <input
                    type="number"
                    min={1000}
                    step={5000}
                    required
                    value={netAmount}
                    onChange={(e) => setNetAmount(Math.max(0, Number(e.target.value)))}
                    className={inputBaseClass}
                  />
                </div>

                {/* Previsualización estimada del evento */}
                <div className="rounded-2xl border border-[#DFD2BA] bg-[#F2EFE9] p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1B3B2B]">Proyección al liquidarse</span>
                    <TierBadge tier={prospectPreview.eventTier} />
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-[#4C524E]">
                    <div>
                      <span className="block text-[10px] uppercase">Comisión ({prospectPreview.commissionPercentage}%)</span>
                      <strong className="text-[#1B3B2B]">
                        {formatMxn(prospectPreview.commissionAmountMxn)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase">Puntos estimados</span>
                      <strong className="text-[#1B3B2B]">
                        {prospectPreview.pointsGenerated.toLocaleString("es-MX")} pts
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase">Regalo</span>
                      <strong className="text-[#1B3B2B]">{prospectPreview.rewardSummary}</strong>
                    </div>
                  </div>
                </div>

                {modalFeedback && (
                  <div
                    className={`rounded-xl px-4 py-3 text-xs ${
                      modalFeedback.ok
                        ? "bg-[#E6F2EB] text-[#1B3B2B]"
                        : "bg-[#FCECEC] text-[#9B2C2C]"
                    }`}
                  >
                    {modalFeedback.text}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
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
                    {isPending ? "Guardando..." : "Registrar evento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

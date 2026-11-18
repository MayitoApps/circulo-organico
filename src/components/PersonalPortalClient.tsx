"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Gift,
  Sparkles,
} from "lucide-react";
import { MemberCard } from "@/components/MemberCard";
import {
  Card,
  inputBaseClass,
  ProgressBar,
  SectionEyebrow,
  StatusBadge,
  TierBadge,
} from "@/components/ui/primitives";
import {
  formatMxn,
  LOYALTY_CONSTANTS,
  PERSONAL_TIER_RULES,
  STAY_COURTESIES_CATALOG,
  type Tier,
} from "@/lib/loyalty-engine";
import { updateReservationCourtesiesAction } from "@/app/actions/member-actions";
import { usePortalTab } from "@/lib/portal-tab";
import { cn, formatShortDate } from "@/lib/utils";

const PERSONAL_TABS = ["resumen", "reservas", "historial"] as const;
type PersonalTab = (typeof PERSONAL_TABS)[number];

export interface PersonalReservationRow {
  id: string;
  propertyName: string;
  propertySlug: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  finalPriceMxn: number;
  selectedCourtesy1: string | null;
  selectedCourtesy2: string | null;
  status: string;
}

export interface PersonalLedgerRow {
  id: string;
  type: string;
  description: string;
  propertyName: string | null;
  netEligibleAmountMxn: number;
  nightsCount: number;
  pointsDelta: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface PersonalCertificateRow {
  id: string;
  type: string;
  title: string;
  status: string;
  preferredPropertyName: string | null;
  preferredDate: string | null;
  preferredTimeSlot: string | null;
  expiresAt: string;
}

export function PersonalPortalClient({
  initialTab,
  fullName,
  membershipNumber,
  qrToken,
  tier,
  pointsBalance,
  rolling12mNights,
  rolling12mSpendMxn,
  rolling12mStaysCount,
  fifthStayBonusClaimedAt,
  assignedAdvisorName,
  reservations,
  ledgers,
  certificates,
}: {
  initialTab?: string;
  fullName: string;
  membershipNumber: string;
  qrToken: string;
  tier: Tier;
  pointsBalance: number;
  rolling12mNights: number;
  rolling12mSpendMxn: number;
  rolling12mStaysCount: number;
  fifthStayBonusClaimedAt: string | null;
  assignedAdvisorName: string | null;
  reservations: PersonalReservationRow[];
  ledgers: PersonalLedgerRow[];
  certificates: PersonalCertificateRow[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = usePortalTab(PERSONAL_TABS, "resumen", initialTab);
  const [courtesyDrafts, setCourtesyDrafts] = useState<
    Record<string, { c1: string; c2: string }>
  >(() => {
    const initial: Record<string, { c1: string; c2: string }> = {};
    for (const r of reservations) {
      initial[r.id] = {
        c1: r.selectedCourtesy1 ?? "",
        c2: r.selectedCourtesy2 ?? "",
      };
    }
    return initial;
  });
  const [courtesyFeedback, setCourtesyFeedback] = useState<{
    id: string;
    ok: boolean;
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const tierRule = PERSONAL_TIER_RULES[tier];
  const nextTier: Tier | null =
    tier === "ORIGEN" ? "ORO" : tier === "ORO" ? "DIAMANTE" : null;
  const nextRule = nextTier ? PERSONAL_TIER_RULES[nextTier] : null;

  const nightsTarget = nextRule ? nextRule.minNights12m : PERSONAL_TIER_RULES.DIAMANTE.minNights12m;
  const spendTarget = nextRule
    ? nextRule.minSpend12mMxn
    : PERSONAL_TIER_RULES.DIAMANTE.minSpend12mMxn;

  const nightsRemaining = Math.max(0, nightsTarget - rolling12mNights);
  const spendRemaining = Math.max(0, spendTarget - rolling12mSpendMxn);
  const nightsPct = Math.min(100, Math.round((rolling12mNights / nightsTarget) * 100));
  const spendPct = Math.min(100, Math.round((rolling12mSpendMxn / spendTarget) * 100));

  const availableMassages = certificates.filter(
    (c) => c.type === "MASAJE_60_MIN" && c.status === "DISPONIBLE"
  );
  const activeCertificates = certificates.filter(
    (c) => c.status !== "VENCIDO" && c.status !== "USADO"
  );

  const handleSaveCourtesies = (reservationId: string) => {
    const draft = courtesyDrafts[reservationId] ?? { c1: "", c2: "" };
    setCourtesyFeedback(null);
    startTransition(async () => {
      const res = await updateReservationCourtesiesAction({
        reservationId,
        courtesy1: draft.c1 || null,
        courtesy2: draft.c2 || null,
      });
      if (!res.ok) {
        setCourtesyFeedback({ id: reservationId, ok: false, text: res.error });
        return;
      }
      setCourtesyFeedback({
        id: reservationId,
        ok: true,
        text: "Cortesías guardadas para tu estancia.",
      });
      router.refresh();
    });
  };

  const tabs: Array<{ id: PersonalTab; label: string }> = [
    { id: "resumen", label: "Resumen y Tarjeta" },
    { id: "reservas", label: `Mis Reservas (${reservations.length})` },
    { id: "historial", label: `Historial de Puntos (${ledgers.length})` },
  ];

  return (
    <div className="bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Encabezado global + Navegación rápida por pestañas */}
        <div className="flex flex-col justify-between gap-5 border-b border-[#E4DDD1] pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <SectionEyebrow>Mi Círculo · Socio Personal</SectionEyebrow>
              <TierBadge tier={tier} />
            </div>
            <h1 className="mt-2 font-editorial text-4xl font-medium text-[#1B3B2B] sm:text-5xl">
              Hola, {fullName}
            </h1>
            <p className="mt-1.5 text-sm text-[#4C524E]">
              Disfrutas de <strong>{tierRule.discountPct}% de descuento</strong> en hospedaje
              directo y acumulas{" "}
              <strong>{tierRule.pointsPer100Mxn} puntos por cada $100 MXN</strong>.
              {assignedAdvisorName && (
                <span className="mt-0.5 block text-[#9E6B4B]">
                  Asesor asignado: {assignedAdvisorName}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold transition",
                  activeTab === tab.id
                    ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                    : "border-[#DFD6C7] bg-white text-[#4C524E] hover:border-[#1B3B2B]"
                )}
              >
                {tab.label}
              </button>
            ))}
            <Link
              href="/mi-circulo/masaje"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#C8B289] px-4 py-2 text-xs font-semibold text-[#1B3B2B] transition hover:bg-[#DFCFAF]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Mi masaje de regalo
            </Link>
          </div>
        </div>

        {/* PESTAÑA 1: RESUMEN Y TARJETA */}
        {activeTab === "resumen" && (
          <div className="space-y-8">
            <div className="grid items-start gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                {/* 3 KPIs principales */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card variant="white" className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                      Tus puntos
                    </p>
                    <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
                      {pointsBalance.toLocaleString("es-MX")} pts
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#5E645F] tabular-nums">
                      Equivale a {formatMxn(pointsBalance * LOYALTY_CONSTANTS.POINT_VALUE_MXN)}
                    </p>
                  </Card>

                  <Card variant="white" className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                      Tus regalos
                    </p>
                    <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
                      {activeCertificates.length}
                    </p>
                    <Link
                      href="/mi-circulo/masaje"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#1B3B2B] underline"
                    >
                      {availableMassages.length > 0
                        ? `${availableMassages.length} masaje disponible`
                        : "Gestionar masaje de regalo"}
                    </Link>
                  </Card>

                  <Card variant="sand" className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                      Bono 5ta estancia
                    </p>
                    <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
                      {Math.min(rolling12mStaysCount, 5)} / 5
                    </p>
                    <p className="mt-1 text-xs text-[#5E645F]">
                      {fifthStayBonusClaimedAt
                        ? "Bono +200 pts acreditado"
                        : rolling12mStaysCount >= 4
                          ? "¡Tu próxima estancia suma +200 pts!"
                          : "Estancias en últimos 12 meses"}
                    </p>
                  </Card>
                </div>

                {/* Progreso dual hacia el siguiente nivel */}
                <Card variant="white" className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
                        Avance en los últimos 12 meses
                      </span>
                      <h2 className="mt-0.5 font-editorial text-2xl font-medium text-[#1B3B2B]">
                        {nextRule
                          ? `Progreso dual hacia Nivel ${nextRule.label}`
                          : "Has alcanzado el nivel máximo Diamante"}
                      </h2>
                    </div>
                    <Award className="h-5 w-5 text-[#C8B289]" />
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1C201E]">Por noches pagadas</span>
                        <span className="font-medium text-[#1B3B2B] tabular-nums">
                          {rolling12mNights} de {nightsTarget} noches
                        </span>
                      </div>
                      <ProgressBar valuePct={nightsPct} />
                      <p className="mt-1.5 text-[11px] text-[#5E645F]">
                        {nextRule
                          ? nightsRemaining === 0
                            ? "¡Meta de noches cumplida!"
                            : `Te faltan ${nightsRemaining} ${nightsRemaining === 1 ? "noche" : "noches"}`
                          : "Mantén 12 noches o $40,000 MXN para conservar Diamante"}
                      </p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1C201E]">
                          Por gasto neto elegible
                        </span>
                        <span className="font-medium text-[#1B3B2B] tabular-nums">
                          {formatMxn(rolling12mSpendMxn)} de {formatMxn(spendTarget)}
                        </span>
                      </div>
                      <ProgressBar valuePct={spendPct} barClassName="bg-[#9E6B4B]" />
                      <p className="mt-1.5 text-[11px] text-[#5E645F]">
                        {nextRule
                          ? spendRemaining === 0
                            ? "¡Meta de gasto cumplida!"
                            : `Te faltan ${formatMxn(spendRemaining)}`
                          : "Beneficios Diamante activos"}
                      </p>
                    </div>
                  </div>

                  {/* Beneficios activos del nivel actual */}
                  <div className="mt-6 grid gap-3 border-t border-[#EFE8DC] pt-5 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#FAF8F5] p-3.5 text-xs">
                      <p className="font-semibold text-[#1B3B2B]">Horarios y ascenso</p>
                      <p className="mt-1 text-[#5E645F]">
                        Check-in: {tierRule.checkInLabel} · Check-out: {tierRule.checkOutLabel}
                      </p>
                      <p className="mt-1 text-[#9E6B4B]">{tierRule.upgradeRule}</p>
                    </div>
                    <div className="rounded-xl bg-[#FAF8F5] p-3.5 text-xs">
                      <p className="font-semibold text-[#1B3B2B]">Amenidades de tu nivel</p>
                      <p className="mt-1 text-[#5E645F]">
                        Cortesías en estancias de 2+ noches:{" "}
                        <strong className="text-[#1B3B2B]">
                          {tierRule.courtesiesPer2PlusNights}
                        </strong>{" "}
                        · Masajes incluidos/año:{" "}
                        <strong className="text-[#1B3B2B]">{tierRule.annualMassagesCap}</strong>
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tarjeta digital + accesos rápidos internos */}
              <div className="flex flex-col items-center lg:col-span-5 lg:items-end">
                <MemberCard
                  holderName={fullName}
                  membershipNumber={membershipNumber}
                  tier={tier}
                  qrValue={`circulo-organico://qr/${qrToken}`}
                  accountTypeLabel={`Socio Personal · ${tierRule.discountPct}% dto.`}
                  downloadable
                />
                <div className="mt-4 flex w-full max-w-[440px] gap-3">
                  <Link
                    href="/mi-circulo/masaje"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#C8B289] px-4 py-2.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#DFCFAF]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Tu masaje de regalo
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reservas")}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#1B3B2B] bg-white px-4 py-2.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#F2EFE9]"
                  >
                    Ver mis reservas
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vista rápida inferior: Próxima reserva + Últimos movimientos */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card variant="white" className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <SectionEyebrow>Próxima visita</SectionEyebrow>
                    <h2 className="mt-1 font-editorial text-2xl font-medium text-[#1B3B2B]">
                      Mis Reservas ({reservations.length})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reservas")}
                    className="text-xs font-semibold text-[#1B3B2B] underline hover:text-[#9E6B4B]"
                  >
                    Gestionar cortesías
                  </button>
                </div>

                {reservations.length === 0 ? (
                  <p className="mt-4 text-xs text-[#5E645F]">
                    Aún no tienes reservas registradas en tu historial.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reservations.slice(0, 2).map((res) => (
                      <div
                        key={res.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#EFE8DC] bg-[#FAF8F5] px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-[#1B3B2B]">{res.propertyName}</p>
                          <p className="text-xs text-[#5E645F]">
                            {formatShortDate(res.checkIn)} — {formatShortDate(res.checkOut)} (
                            {res.nights} {res.nights === 1 ? "noche" : "noches"})
                          </p>
                        </div>
                        <StatusBadge
                          label={res.status.replace("_", " ")}
                          tone={res.status === "CONFIRMADA" ? "success" : "warning"}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card variant="white" className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <SectionEyebrow>Actividad reciente</SectionEyebrow>
                    <h2 className="mt-1 font-editorial text-2xl font-medium text-[#1B3B2B]">
                      Últimos movimientos ({ledgers.length})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("historial")}
                    className="text-xs font-semibold text-[#1B3B2B] underline hover:text-[#9E6B4B]"
                  >
                    Ver historial completo
                  </button>
                </div>

                {ledgers.length === 0 ? (
                  <p className="mt-4 text-xs text-[#5E645F]">
                    Aún no tienes movimientos registrados en tu cuenta.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {ledgers.slice(0, 3).map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#EFE8DC] bg-[#FAF8F5] px-4 py-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#1C201E]">{row.description}</p>
                          <p className="text-[#9E6B4B]">{formatShortDate(row.createdAt)}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 font-semibold tabular-nums",
                            row.pointsDelta >= 0 ? "text-[#1B3B2B]" : "text-[#9B2C2C]"
                          )}
                        >
                          {row.pointsDelta >= 0 ? `+${row.pointsDelta}` : row.pointsDelta} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: MIS RESERVAS Y CORTESÍAS */}
        {activeTab === "reservas" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <SectionEyebrow>Estancias y amenidades</SectionEyebrow>
                <h2 className="mt-1 font-editorial text-3xl font-medium text-[#1B3B2B]">
                  Mis Reservas y Cortesías
                </h2>
              </div>
              <span className="text-xs text-[#5E645F]">
                Nivel actual: <strong>{tierRule.label}</strong> ({tierRule.courtesiesPer2PlusNights}{" "}
                cortesías en estancias de 2+ noches)
              </span>
            </div>

            {reservations.length === 0 ? (
              <Card variant="sand" className="p-8 text-center">
                <p className="text-sm text-[#4C524E]">
                  Aún no tienes reservas registradas. Cuando registres una estancia, aparecerá aquí
                  para elegir tus cortesías disponibles.
                </p>
              </Card>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {reservations.map((res) => {
                  const canSelectCourtesies =
                    tierRule.courtesiesPer2PlusNights > 0 &&
                    res.nights >= 2 &&
                    res.status !== "CANCELADA";
                  const draft = courtesyDrafts[res.id] ?? { c1: "", c2: "" };
                  const fb = courtesyFeedback?.id === res.id ? courtesyFeedback : null;

                  return (
                    <Card key={res.id} variant="white" className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                            {res.propertyName}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#5E645F]">
                            <Calendar className="h-3.5 w-3.5 text-[#9E6B4B]" />
                            {formatShortDate(res.checkIn)} — {formatShortDate(res.checkOut)} ·{" "}
                            {res.nights} {res.nights === 1 ? "noche" : "noches"} · {res.adults}{" "}
                            adultos
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge
                            label={res.status.replace("_", " ")}
                            tone={
                              res.status === "CONFIRMADA"
                                ? "success"
                                : res.status === "POR_CONFIRMAR"
                                  ? "warning"
                                  : "neutral"
                            }
                          />
                          <p className="mt-1.5 font-semibold text-[#1B3B2B] tabular-nums">
                            {formatMxn(res.finalPriceMxn)}
                          </p>
                        </div>
                      </div>

                      {canSelectCourtesies && (
                        <div className="mt-5 rounded-2xl border border-[#DFD2BA] bg-[#FAF8F5] p-4">
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#1B3B2B]">
                            <Gift className="h-3.5 w-3.5 text-[#9E6B4B]" />
                            Elige{" "}
                            {tierRule.courtesiesPer2PlusNights === 1
                              ? "1 cortesía para tu estancia"
                              : "2 cortesías distintas para tu estancia"}
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <select
                              value={draft.c1}
                              onChange={(e) =>
                                setCourtesyDrafts((prev) => ({
                                  ...prev,
                                  [res.id]: { ...draft, c1: e.target.value },
                                }))
                              }
                              className={inputBaseClass}
                            >
                              <option value="">Elegir cortesía 1...</option>
                              {STAY_COURTESIES_CATALOG.map((c) => (
                                <option key={c.id} value={c.title}>
                                  {c.title}
                                </option>
                              ))}
                            </select>

                            {tierRule.courtesiesPer2PlusNights >= 2 && (
                              <select
                                value={draft.c2}
                                onChange={(e) =>
                                  setCourtesyDrafts((prev) => ({
                                    ...prev,
                                    [res.id]: { ...draft, c2: e.target.value },
                                  }))
                                }
                                className={inputBaseClass}
                              >
                                <option value="">Elegir cortesía 2...</option>
                                {STAY_COURTESIES_CATALOG.filter((c) => c.title !== draft.c1).map(
                                  (c) => (
                                    <option key={c.id} value={c.title}>
                                      {c.title}
                                    </option>
                                  )
                                )}
                              </select>
                            )}
                          </div>

                          {fb && (
                            <p
                              className={`mt-2 text-xs ${
                                fb.ok ? "text-[#1B3B2B]" : "text-[#9B2C2C]"
                              }`}
                            >
                              {fb.text}
                            </p>
                          )}

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSaveCourtesies(res.id)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1B3B2B] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#132A1E] disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Guardar cortesías
                          </button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* PESTAÑA 3: HISTORIAL DE PUNTOS */}
        {activeTab === "historial" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <SectionEyebrow>Estado de cuenta</SectionEyebrow>
                <h2 className="mt-1 font-editorial text-3xl font-medium text-[#1B3B2B]">
                  Historial de puntos y visitas
                </h2>
              </div>
              <Card variant="sand" className="px-4 py-2 text-xs">
                Saldo vigente:{" "}
                <strong className="text-[#1B3B2B] tabular-nums">
                  {pointsBalance.toLocaleString("es-MX")} pts ({formatMxn(pointsBalance)})
                </strong>
              </Card>
            </div>

            {ledgers.length === 0 ? (
              <Card variant="sand" className="p-8 text-center">
                <p className="text-sm text-[#4C524E]">
                  Todavía no tienes movimientos de puntos acreditados o canjeados.
                </p>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-[#E4DDD1] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80 text-xs uppercase tracking-[0.12em] text-[#5E645F]">
                        <th className="px-5 py-3.5">Fecha</th>
                        <th className="px-5 py-3.5">Concepto / Sede</th>
                        <th className="px-5 py-3.5">Neto elegible</th>
                        <th className="px-5 py-3.5">Noches</th>
                        <th className="px-5 py-3.5">Puntos</th>
                        <th className="px-5 py-3.5">Vigencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE8DC]">
                      {ledgers.map((row) => (
                        <tr key={row.id} className="hover:bg-[#FAF8F5]">
                          <td className="px-5 py-3.5 text-xs text-[#5E645F]">
                            {formatShortDate(row.createdAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-[#1C201E]">{row.description}</p>
                            {row.propertyName && (
                              <p className="text-xs text-[#9E6B4B]">{row.propertyName}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-[#4C524E]">
                            {row.netEligibleAmountMxn > 0
                              ? formatMxn(row.netEligibleAmountMxn)
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums text-[#4C524E]">
                            {row.nightsCount > 0 ? row.nightsCount : "—"}
                          </td>
                          <td className="px-5 py-3.5 font-semibold tabular-nums">
                            <span
                              className={
                                row.pointsDelta >= 0 ? "text-[#1B3B2B]" : "text-[#9B2C2C]"
                              }
                            >
                              {row.pointsDelta >= 0 ? `+${row.pointsDelta}` : row.pointsDelta} pts
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#5E645F]">
                            {formatShortDate(row.expiresAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

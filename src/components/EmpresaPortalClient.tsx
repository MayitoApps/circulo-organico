"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Clock,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { MemberCard } from "@/components/MemberCard";
import {
  Card,
  inputBaseClass,
  labelBaseClass,
  ProgressBar,
  SectionEyebrow,
  StatusBadge,
  TierBadge,
} from "@/components/ui/primitives";
import {
  CORPORATE_TIER_RULES,
  formatMxn,
  previewCorporateCharge,
  type Tier,
} from "@/lib/loyalty-engine";
import {
  addAuthorizedPersonAction,
  toggleAuthorizedPersonAction,
} from "@/app/actions/member-actions";
import { cn, formatShortDate } from "@/lib/utils";

type EmpresaTab = "resumen" | "reservas" | "saldo" | "equipo" | "convenio";

export function EmpresaPortalClient({
  legalName,
  rfc,
  businessActivity,
  responsibleName,
  responsibleRole,
  workEmail,
  contactPhone,
  fiscalAddress,
  agreedTariffNotes,
  agreementApprovedAt,
  membershipNumber,
  qrToken,
  tier,
  status,
  assignedAdvisorName,
  rolling12mSpendMxn,
  cashBalanceMxn,
  totalEarnedMxn,
  totalUsedMxn,
  reservations,
  ledgers,
  authorizedPeople,
}: {
  legalName: string;
  rfc: string;
  businessActivity: string;
  responsibleName: string;
  responsibleRole: string;
  workEmail: string;
  contactPhone: string;
  fiscalAddress: string;
  agreedTariffNotes: string | null;
  agreementApprovedAt: string | null;
  membershipNumber: string;
  qrToken: string;
  tier: Tier;
  status: string;
  assignedAdvisorName: string | null;
  rolling12mSpendMxn: number;
  cashBalanceMxn: number;
  totalEarnedMxn: number;
  totalUsedMxn: number;
  reservations: Array<{
    id: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    finalPriceMxn: number;
    requestedByPerson: string | null;
    status: string;
  }>;
  ledgers: Array<{
    id: string;
    type: string;
    description: string;
    propertyName: string | null;
    netEligibleAmountMxn: number;
    cashDeltaMxn: number;
    expiresAt: string | null;
    createdAt: string;
  }>;
  authorizedPeople: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    roleInAccount: string;
    isActive: boolean;
  }>;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EmpresaTab>("resumen");
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<"RESERVA_Y_ADMINISTRA" | "AUTORIZA_PREMIOS_Y_SALDO">(
    "RESERVA_Y_ADMINISTRA"
  );
  const [teamFeedback, setTeamFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const progress = previewCorporateCharge({
    currentTier: tier,
    currentRolling12mSpendMxn: rolling12mSpendMxn,
    netEligibleAmountMxn: 0,
  });

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamFeedback(null);
    startTransition(async () => {
      const res = await addAuthorizedPersonAction({
        fullName: newFullName,
        email: newEmail,
        phone: newPhone,
        roleInAccount: newRole,
      });
      if (!res.ok) {
        setTeamFeedback({ ok: false, text: res.error });
        return;
      }
      setNewFullName("");
      setNewEmail("");
      setNewPhone("");
      setTeamFeedback({ ok: true, text: "Colaborador autorizado agregado al equipo." });
      router.refresh();
    });
  };

  const handleTogglePerson = (personId: string, nextActive: boolean) => {
    startTransition(async () => {
      await toggleAuthorizedPersonAction(personId, nextActive);
      router.refresh();
    });
  };

  const tabs: Array<{ id: EmpresaTab; label: string }> = [
    { id: "resumen", label: "Resumen" },
    { id: "reservas", label: `Reservas (${reservations.length})` },
    { id: "saldo", label: "Mi saldo" },
    { id: "equipo", label: `Mi equipo (${authorizedPeople.length})` },
    { id: "convenio", label: "Mi convenio" },
  ];

  return (
    <div className="bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Banner pendiente si aún no se aprueba en /admin */}
        {status === "PENDIENTE_CONVENIO" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8D1A3] bg-[#FBF3E2] px-5 py-4 text-xs text-[#8A5A19]">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                <strong>Convenio en revisión:</strong> Tu solicitud fue recibida. Un administrador
                de Grupo Orgánico puede activarla desde el panel <code className="font-mono">/admin</code>.
              </span>
            </div>
            <StatusBadge label="Pendiente de convenio" tone="warning" />
          </div>
        )}

        {/* Encabezado */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <SectionEyebrow>Portal Corporativo · Empresa</SectionEyebrow>
              <TierBadge tier={tier} />
            </div>
            <h1 className="mt-2 font-editorial text-4xl font-medium text-[#1B3B2B]">
              {legalName}
            </h1>
            <p className="mt-1 text-sm text-[#4C524E]">
              {CORPORATE_TIER_RULES[tier].label} · RFC {rfc} ·{" "}
              {assignedAdvisorName ?? "Atención Corporativa Círculo Orgánico"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        {/* TAB: RESUMEN */}
        {activeTab === "resumen" && (
          <div className="space-y-8">
            {/* 4 tarjetas métricas principales */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card variant="white" className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
                  Compras en últimos 12 meses
                </p>
                <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
                  {formatMxn(rolling12mSpendMxn)}
                </p>
                <p className="mt-1 text-xs text-[#5E645F]">Consumo neto elegible</p>
              </Card>

              <Card variant="white" className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
                  Has ganado (2% acumulado)
                </p>
                <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
                  {formatMxn(totalEarnedMxn)}
                </p>
                <p className="mt-1 text-xs text-[#5E645F]">$2 MXN por cada $100 netos</p>
              </Card>

              <Card variant="sand" className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
                  Ya usaste
                </p>
                <p className="mt-1.5 font-editorial text-3xl font-semibold text-[#1C201E] tabular-nums">
                  {formatMxn(totalUsedMxn)}
                </p>
                <p className="mt-1 text-xs text-[#5E645F]">Aplicado en estancias o catálogo</p>
              </Card>

              <Card variant="forest" className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#C8B289]">
                  Tu saldo disponible
                </p>
                <p className="mt-1.5 font-editorial text-3xl font-semibold text-white tabular-nums">
                  {formatMxn(cashBalanceMxn)}
                </p>
                <p className="mt-1 text-xs text-white/75">Vigencia 24 meses</p>
              </Card>
            </div>

            {/* Progreso corporativo + Tarjeta digital */}
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <Card variant="white" className="p-7 lg:col-span-7">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <SectionEyebrow>Nivel Corporativo</SectionEyebrow>
                    <h2 className="mt-1 font-editorial text-3xl font-medium text-[#1B3B2B]">
                      {progress.nextTierLabel
                        ? `Avance hacia ${progress.nextTierLabel}`
                        : "Nivel máximo Empresas Diamante"}
                    </h2>
                  </div>
                  <span className="font-editorial text-3xl font-semibold text-[#9E6B4B] tabular-nums">
                    {progress.progressToNextTierPct}%
                  </span>
                </div>

                <div className="mt-5">
                  <ProgressBar valuePct={progress.progressToNextTierPct} />
                  <div className="mt-2.5 flex flex-wrap justify-between gap-2 text-xs text-[#5E645F]">
                    <span>
                      Acumulado: <strong className="text-[#1B3B2B]">{formatMxn(rolling12mSpendMxn)}</strong>
                    </span>
                    {progress.nextTierLabel && (
                      <span>
                        Meta:{" "}
                        <strong className="text-[#1B3B2B]">
                          {formatMxn(
                            tier === "ORIGEN"
                              ? CORPORATE_TIER_RULES.ORO.minSpend12mMxn
                              : CORPORATE_TIER_RULES.DIAMANTE.minSpend12mMxn
                          )}
                        </strong>{" "}
                        (faltan {formatMxn(progress.remainingToNextTierMxn)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 border-t border-[#EFE8DC] pt-5 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#FAF8F5] p-3.5 text-xs">
                    <p className="font-semibold text-[#1B3B2B]">Reglas de uso del saldo</p>
                    <p className="mt-1 text-[#5E645F]">
                      Hasta 25% en hospedaje, 10% en eventos OTAM/corporativos o 100% de premios del
                      catálogo.
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FAF8F5] p-3.5 text-xs">
                    <p className="font-semibold text-[#1B3B2B]">Personas con permiso de saldo</p>
                    <p className="mt-1 text-[#5E645F]">
                      {
                        authorizedPeople.filter(
                          (p) => p.isActive && p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
                        ).length
                      }{" "}
                      autorizadores activos en la cuenta.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center lg:col-span-5 lg:justify-end">
                <MemberCard
                  holderName={legalName}
                  membershipNumber={membershipNumber}
                  tier={tier}
                  qrValue={`circulo-organico://qr/${qrToken}`}
                  accountTypeLabel="Cuenta Empresa · 2% saldo"
                  downloadable
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESERVAS */}
        {activeTab === "reservas" && (
          <Card variant="white" className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DDD1] px-6 py-4">
              <div>
                <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Reservas del equipo
                </h2>
                <p className="text-xs text-[#5E645F]">
                  Hospedajes y eventos reservados por colaboradores autorizados.
                </p>
              </div>
              <Link
                href="/hoteles"
                className="rounded-full bg-[#1B3B2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#132A1E]"
              >
                + Nueva reserva en hoteles
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80 text-xs uppercase tracking-[0.12em] text-[#5E645F]">
                    <th className="px-6 py-3.5">Sede</th>
                    <th className="px-6 py-3.5">Fechas</th>
                    <th className="px-6 py-3.5">Responsable</th>
                    <th className="px-6 py-3.5">Monto neto</th>
                    <th className="px-6 py-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DC]">
                  {reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAF8F5]">
                      <td className="px-6 py-4 font-semibold text-[#1B3B2B]">{r.propertyName}</td>
                      <td className="px-6 py-4 text-xs text-[#4C524E]">
                        {formatShortDate(r.checkIn)} — {formatShortDate(r.checkOut)} ({r.nights}{" "}
                        noches · {r.adults} pax)
                      </td>
                      <td className="px-6 py-4 text-xs text-[#4C524E]">
                        {r.requestedByPerson ?? responsibleName}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1C201E] tabular-nums">
                        {formatMxn(r.finalPriceMxn)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          label={
                            r.status === "POR_CONFIRMAR"
                              ? "Por confirmar"
                              : r.status === "CONFIRMADA"
                                ? "Confirmada"
                                : r.status === "TERMINADA"
                                  ? "Terminada"
                                  : r.status
                          }
                          tone={
                            r.status === "CONFIRMADA"
                              ? "success"
                              : r.status === "POR_CONFIRMAR"
                                ? "warning"
                                : "neutral"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB: MI SALDO */}
        {activeTab === "saldo" && (
          <div className="space-y-6">
            <Card variant="sand" className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#C8B289]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9E6B4B]">
                    Saldo disponible en cuenta
                  </p>
                  <p className="font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
                    {formatMxn(cashBalanceMxn)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#4C524E]">
                Aplica hasta 25% en hospedaje, 10% en eventos o 100% en catálogo de experiencias.
              </div>
            </Card>

            <Card variant="white" className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80 text-xs uppercase tracking-[0.12em] text-[#5E645F]">
                      <th className="px-6 py-3.5">Fecha</th>
                      <th className="px-6 py-3.5">Movimiento</th>
                      <th className="px-6 py-3.5">Base neta</th>
                      <th className="px-6 py-3.5">Saldo (+/-)</th>
                      <th className="px-6 py-3.5">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DC]">
                    {ledgers.map((l) => (
                      <tr key={l.id}>
                        <td className="px-6 py-3.5 text-xs text-[#5E645F]">
                          {formatShortDate(l.createdAt)}
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-[#1C201E]">{l.description}</p>
                          {l.propertyName && (
                            <p className="text-xs text-[#9E6B4B]">{l.propertyName}</p>
                          )}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-[#4C524E]">
                          {formatMxn(l.netEligibleAmountMxn)}
                        </td>
                        <td className="px-6 py-3.5 font-semibold tabular-nums">
                          <span
                            className={l.cashDeltaMxn >= 0 ? "text-[#1B3B2B]" : "text-[#9B2C2C]"}
                          >
                            {l.cashDeltaMxn >= 0
                              ? `+${formatMxn(l.cashDeltaMxn)}`
                              : formatMxn(l.cashDeltaMxn)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-[#5E645F]">
                          {formatShortDate(l.expiresAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB: MI EQUIPO */}
        {activeTab === "equipo" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <Card variant="white" className="p-6 lg:col-span-7">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#9E6B4B]" />
                <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Colaboradores autorizados
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#5E645F]">
                Solo las personas activas con facultad de autorización pueden utilizar el saldo a
                favor de la empresa.
              </p>

              <div className="mt-5 space-y-3">
                {authorizedPeople.map((person) => (
                  <div
                    key={person.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E4DDD1] bg-[#FAF8F5] p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1B3B2B]">{person.fullName}</p>
                        <StatusBadge
                          label={person.isActive ? "Activo" : "Inactivo"}
                          tone={person.isActive ? "success" : "neutral"}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-[#5E645F]">
                        {person.email} · {person.phone}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-[#9E6B4B]">
                        {person.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
                          ? "Autoriza premios y uso de saldo"
                          : "Reserva y administra cuenta"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleTogglePerson(person.id, !person.isActive)}
                      className="rounded-full border border-[#1B3B2B]/25 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#F2EFE9]"
                    >
                      {person.isActive ? "Desactivar" : "Reactivar"}
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="white" className="p-6 lg:col-span-5">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#9E6B4B]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Agregar colaborador
                </h3>
              </div>

              <form onSubmit={handleAddPerson} className="mt-5 space-y-4">
                <div>
                  <label className={labelBaseClass}>Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ej. Andrea Morales"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Correo corporativo</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="amorales@empresa.mx"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Teléfono</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+52 55 0000 0000"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Nivel de autorización</label>
                  <select
                    value={newRole}
                    onChange={(e) =>
                      setNewRole(
                        e.target.value as "RESERVA_Y_ADMINISTRA" | "AUTORIZA_PREMIOS_Y_SALDO"
                      )
                    }
                    className={inputBaseClass}
                  >
                    <option value="RESERVA_Y_ADMINISTRA">Reserva y administra</option>
                    <option value="AUTORIZA_PREMIOS_Y_SALDO">
                      Autoriza uso de premios y saldo
                    </option>
                  </select>
                </div>

                {teamFeedback && (
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs ${
                      teamFeedback.ok
                        ? "bg-[#E6F2EB] text-[#1B3B2B]"
                        : "bg-[#FCECEC] text-[#9B2C2C]"
                    }`}
                  >
                    {teamFeedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1B3B2B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#132A1E] disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Autorizar colaborador
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* TAB: MI CONVENIO */}
        {activeTab === "convenio" && (
          <Card variant="white" className="p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EFE8DC] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B3B2B] text-[#C8B289]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                    Expediente del convenio corporativo
                  </h2>
                  <p className="text-xs text-[#5E645F]">
                    Aprobado el {formatShortDate(agreementApprovedAt)}
                  </p>
                </div>
              </div>
              <StatusBadge
                label={status === "ACTIVA" ? "Convenio Activo" : status}
                tone={status === "ACTIVA" ? "success" : "warning"}
              />
            </div>

            <div className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9E6B4B]">
                  Razón social
                </p>
                <p className="mt-1 font-medium text-[#1C201E]">{legalName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9E6B4B]">RFC</p>
                <p className="mt-1 font-mono font-medium text-[#1C201E]">{rfc}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9E6B4B]">
                  Giro / Actividad
                </p>
                <p className="mt-1 text-[#1C201E]">{businessActivity}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9E6B4B]">
                  Responsable
                </p>
                <p className="mt-1 text-[#1C201E]">
                  {responsibleName} ({responsibleRole})
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9E6B4B]">
                  Contacto
                </p>
                <p className="mt-1 text-[#1C201E]">
                  {workEmail} · {contactPhone}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9E6B4B]">
                  Domicilio fiscal
                </p>
                <p className="mt-1 text-[#1C201E]">{fiscalAddress}</p>
              </div>
            </div>

            {agreedTariffNotes && (
              <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-[#F2EFE9] p-4 text-xs text-[#1B3B2B]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9E6B4B]" />
                <span>
                  <strong>Condiciones acordadas:</strong> {agreedTariffNotes}
                </span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

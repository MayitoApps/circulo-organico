"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  calculateAgencyEventBenefits,
  formatMxn,
  previewCorporateCharge,
  previewPersonalStayCharge,
  validateRedemption,
  type ProfileRole,
  type RedemptionPurpose,
  type Tier,
} from "@/lib/loyalty-engine";
import {
  approveOrRejectB2BAction,
  markAgencyCommissionPaidAction,
  processAdminRedemptionAction,
  recordAdminConsumptionAction,
  settleAgencyEventAction,
  updateMassageCertificateStatusAction,
  updateQuoteStatusAction,
} from "@/app/actions/admin-actions";
import {
  Card,
  inputBaseClass,
  labelBaseClass,
  SectionEyebrow,
  StatusBadge,
  TierBadge,
} from "@/components/ui/primitives";
import { usePortalTab } from "@/lib/portal-tab";
import { cn, formatShortDate } from "@/lib/utils";

export interface AdminMemberRecord {
  membershipId: string;
  membershipNumber: string;
  qrToken: string;
  fullName: string;
  email: string;
  phone: string;
  role: ProfileRole;
  tier: Tier;
  status: string;
  pointsBalance: number;
  cashBalanceMxn: number;
  rolling12mSpendMxn: number;
  rolling12mNights: number;
  rolling12mStaysCount: number;
  fifthStayBonusClaimedAt: string | null;
  existingMassagesIn12m: number;
  legalName: string | null;
  rfc: string | null;
  authorizedPeople: Array<{
    id: string;
    fullName: string;
    roleInAccount: string;
    isActive: boolean;
  }>;
  recentLedgers: Array<{
    id: string;
    type: string;
    description: string;
    propertyName: string | null;
    netEligibleAmountMxn: number;
    pointsDelta: number;
    cashDeltaMxn: number;
    createdAt: string;
  }>;
}

export interface AdminPropertyOption {
  id: string;
  slug: string;
  name: string;
}

export interface AdminPendingB2BRow {
  membershipId: string;
  membershipNumber: string;
  legalName: string;
  profileType: string;
  rfc: string;
  responsibleName: string;
  workEmail: string;
  status: string;
}

export interface AdminMassageRow {
  id: string;
  title: string;
  memberName: string;
  membershipNumber: string;
  status: string;
  propertyName: string | null;
  preferredDate: string | null;
  preferredTimeSlot: string | null;
  expiresAt: string;
}

export interface AdminAgencyEventRow {
  id: string;
  code: string;
  agencyName: string;
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
  rewardSummary: string;
}

export interface AdminQuoteRow {
  id: string;
  category: string;
  requesterType: string;
  contactName: string;
  contactEmail: string;
  participantsCount: number;
  propertyName: string | null;
  payWithPointsOrBalance: boolean;
  status: string;
  createdAt: string;
}

const ADMIN_TABS = ["operacion", "canje", "bandejas", "agencias"] as const;

export function AdminDashboardClient({
  initialTab,
  members,
  properties,
  pendingB2B,
  massageRequests,
  agencyEvents,
  quoteRequests,
}: {
  initialTab?: string;
  members: AdminMemberRecord[];
  properties: AdminPropertyOption[];
  pendingB2B: AdminPendingB2BRow[];
  massageRequests: AdminMassageRow[];
  agencyEvents: AdminAgencyEventRow[];
  quoteRequests: AdminQuoteRow[];
}) {
  const router = useRouter();
  const [activeSection, setActiveSection] = usePortalTab(
    ADMIN_TABS,
    "operacion",
    initialTab
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>(
    members.find((m) => m.membershipNumber === "000 248")?.membershipId ??
      members[0]?.membershipId ??
      ""
  );

  // Estado formulario Carga de Consumos
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [operationType, setOperationType] = useState<
    "ESTANCIA_HOSPEDAJE" | "COMPRA_EMPRESA" | "EVENTO_AGENCIA"
  >("ESTANCIA_HOSPEDAJE");
  const [nightsCount, setNightsCount] = useState(2);
  const [grossAmount, setGrossAmount] = useState(6500);
  const [netEligibleAmount, setNetEligibleAmount] = useState(5000);
  const [checkInDate, setCheckInDate] = useState("2026-11-18");
  const [checkOutDate, setCheckOutDate] = useState("2026-11-20");
  const [isConsecutiveStay, setIsConsecutiveStay] = useState(false);
  const [chargeDesc, setChargeDesc] = useState("Estancia pagada en recepción");
  const [agencyClientName, setAgencyClientName] = useState("");

  // Estado formulario Redención / Canje
  const [redeemPurpose, setRedeemPurpose] = useState<RedemptionPurpose>("HOSPEDAJE");
  const [redeemBaseAmount, setRedeemBaseAmount] = useState(4000);
  const [redeemRequestedAmount, setRedeemRequestedAmount] = useState(500);
  const [authorizedPersonId, setAuthorizedPersonId] = useState("");
  const [redeemDesc, setRedeemDesc] = useState("Aplicación de puntos/saldo en recepción");

  // Notas aprobación B2B & Feedback global
  const [tariffNotes, setTariffNotes] = useState("Tarifa preferente corporativa + 2% saldo");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [cronResult, setCronResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.membershipNumber.toLowerCase().includes(q) ||
        m.membershipNumber.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.qrToken.toLowerCase().includes(q) ||
        (m.legalName && m.legalName.toLowerCase().includes(q)) ||
        (m.rfc && m.rfc.toLowerCase().includes(q))
    );
  }, [members, searchQuery]);

  const selectedMember = useMemo(
    () => members.find((m) => m.membershipId === selectedMembershipId) ?? members[0] ?? null,
    [members, selectedMembershipId]
  );

  const selectMember = (m: AdminMemberRecord) => {
    setSelectedMembershipId(m.membershipId);
    setFeedback(null);
    if (m.role === "EMPRESA") {
      setOperationType("COMPRA_EMPRESA");
      setNightsCount(0);
      setNetEligibleAmount(50000);
      setGrossAmount(58000);
      setChargeDesc("Facturación hospedaje / evento corporativo");
      const defaultAuthorizer = m.authorizedPeople.find(
        (p) => p.isActive && p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
      );
      setAuthorizedPersonId(defaultAuthorizer?.id ?? "");
    } else if (m.role === "AGENCIA") {
      setOperationType("EVENTO_AGENCIA");
      setNightsCount(0);
      setNetEligibleAmount(120000);
      setGrossAmount(139200);
      setChargeDesc("Liquidación de evento corporativo");
    } else {
      setOperationType("ESTANCIA_HOSPEDAJE");
      setNightsCount(2);
      setNetEligibleAmount(5000);
      setGrossAmount(5800);
      setChargeDesc("Estancia pagada en recepción");
    }
  };

  const handleQrDecode = () => {
    const cleaned = qrInput.trim().replace("circulo-organico://qr/", "").toLowerCase();
    if (!cleaned) return;
    const match = members.find(
      (m) =>
        m.qrToken.toLowerCase() === cleaned ||
        m.membershipNumber.replace(/\s+/g, "") === cleaned.replace(/\D+/g, "")
    );
    if (match) {
      selectMember(match);
      setSearchQuery(match.membershipNumber);
      setFeedback({
        ok: true,
        text: `QR validado: ${match.fullName} (SOCIO ${match.membershipNumber}).`,
      });
    } else {
      setFeedback({ ok: false, text: "No se encontró ninguna membresía con ese token QR." });
    }
  };

  // Previsualización en vivo del módulo de carga de consumos
  const personalPreview = useMemo(() => {
    if (!selectedMember || operationType !== "ESTANCIA_HOSPEDAJE") return null;
    return previewPersonalStayCharge({
      currentTier: selectedMember.tier,
      currentRolling12mNights: selectedMember.rolling12mNights,
      currentRolling12mSpendMxn: selectedMember.rolling12mSpendMxn,
      currentRolling12mStaysCount: selectedMember.rolling12mStaysCount,
      fifthStayBonusClaimedAt: selectedMember.fifthStayBonusClaimedAt
        ? new Date(selectedMember.fifthStayBonusClaimedAt)
        : null,
      existingMassagesInCurrent12mPeriod: selectedMember.existingMassagesIn12m,
      netEligibleAmountMxn: netEligibleAmount,
      nightsCount,
      isConsecutiveStay,
    });
  }, [selectedMember, operationType, netEligibleAmount, nightsCount, isConsecutiveStay]);

  const corporatePreview = useMemo(() => {
    if (!selectedMember || operationType !== "COMPRA_EMPRESA") return null;
    return previewCorporateCharge({
      currentTier: selectedMember.tier,
      currentRolling12mSpendMxn: selectedMember.rolling12mSpendMxn,
      netEligibleAmountMxn: netEligibleAmount,
    });
  }, [selectedMember, operationType, netEligibleAmount]);

  const agencyPreview = useMemo(() => {
    if (!selectedMember || operationType !== "EVENTO_AGENCIA") return null;
    return calculateAgencyEventBenefits(netEligibleAmount);
  }, [selectedMember, operationType, netEligibleAmount]);

  // Previsualización de validación de canje
  const redemptionCheck = useMemo(() => {
    if (!selectedMember || selectedMember.role === "ADMIN_STAFF") return null;
    let isAuthorized = true;
    if (selectedMember.role === "EMPRESA") {
      const person = selectedMember.authorizedPeople.find((p) => p.id === authorizedPersonId);
      isAuthorized = Boolean(
        person && person.isActive && person.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
      );
    }
    return validateRedemption({
      profileRole: selectedMember.role,
      purpose: redeemPurpose,
      eligibleBaseAmountMxn: redeemBaseAmount,
      requestedAmountMxn: redeemRequestedAmount,
      availableBalance:
        selectedMember.role === "EMPRESA"
          ? selectedMember.cashBalanceMxn
          : selectedMember.pointsBalance,
      isAuthorizedPerson: isAuthorized,
    });
  }, [
    selectedMember,
    redeemPurpose,
    redeemBaseAmount,
    redeemRequestedAmount,
    authorizedPersonId,
  ]);

  const handleRecordConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await recordAdminConsumptionAction({
        membershipId: selectedMember.membershipId,
        propertyId,
        operationType,
        grossAmountMxn: grossAmount,
        netEligibleAmountMxn: netEligibleAmount,
        nightsCount,
        checkInDate: operationType === "ESTANCIA_HOSPEDAJE" ? checkInDate : null,
        checkOutDate: operationType === "ESTANCIA_HOSPEDAJE" ? checkOutDate : null,
        isConsecutiveStay,
        description: chargeDesc,
        agencyClientName,
      });

      if (!res.ok) {
        setFeedback({ ok: false, text: res.error });
        return;
      }

      setFeedback({ ok: true, text: res.summary });
      router.refresh();
    });
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await processAdminRedemptionAction({
        membershipId: selectedMember.membershipId,
        propertyId,
        purpose: redeemPurpose,
        eligibleBaseAmountMxn: redeemBaseAmount,
        requestedAmountMxn: redeemRequestedAmount,
        authorizedPersonId: authorizedPersonId || null,
        description: redeemDesc,
      });

      if (!res.ok) {
        setFeedback({ ok: false, text: res.error });
        return;
      }

      setFeedback({ ok: true, text: "Canje descontado de la billetera correctamente." });
      router.refresh();
    });
  };

  const handleRunCronMaintenance = () => {
    setCronResult(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/cron/loyalty-maintenance", { method: "POST" });
        const json = await res.json();
        if (!res.ok) {
          setCronResult(json.error || "Error ejecutando mantenimiento");
          return;
        }
        setCronResult(
          `Mantenimiento ejecutado: ${json.evaluatedMemberships} cuentas evaluadas (ventana 12m), ${json.tierAdjustments} ajustes de nivel, ${json.expiredCertificatesCount} certificados vencidos, ${json.expiredPointsTotal} pts vencidos.`
        );
        router.refresh();
      } catch {
        setCronResult("No fue posible contactar el endpoint de mantenimiento.");
      }
    });
  };

  return (
    <div className="bg-[#FAF8F5] py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header Admin */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E4DDD1] pb-6 lg:flex-row lg:items-end">
          <div>
            <SectionEyebrow>Administración · Recepción y Ventas</SectionEyebrow>
            <h1 className="mt-1.5 font-editorial text-4xl font-medium text-[#1B3B2B]">
              Panel Administrativo Círculo Orgánico
            </h1>
            <p className="mt-1 text-sm text-[#4C524E]">
              Acreditación automática sin cálculos manuales, validación estricta de canjes y
              gestión B2B.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleRunCronMaintenance}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3B2B]/30 bg-white px-4 py-2 text-xs font-semibold text-[#1B3B2B] hover:bg-[#F2EFE9]"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
              Evaluar ventana 12m y vencimientos
            </button>
          </div>
        </div>

        {/* Resumen ejecutivo rápido con salto directo por pestaña */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveSection("operacion")}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              activeSection === "operacion"
                ? "border-[#1B3B2B] bg-white shadow-xs"
                : "border-[#E4DDD1] bg-white hover:border-[#1B3B2B]/40"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
              Socios Activos
            </span>
            <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
              {members.filter((m) => m.status === "ACTIVA").length}
            </p>
            <span className="text-xs text-[#5E645F]">
              de {members.length} cuentas registradas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("bandejas")}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              activeSection === "bandejas"
                ? "border-[#1B3B2B] bg-white shadow-xs"
                : "border-[#E4DDD1] bg-white hover:border-[#1B3B2B]/40"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
              Citas Spa Solicitadas
            </span>
            <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
              {massageRequests.filter((m) => m.status === "CITA_SOLICITADA").length}
            </p>
            <span className="text-xs text-[#5E645F]">
              {massageRequests.filter((m) => m.status === "CONFIRMADO").length} confirmadas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("bandejas")}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              activeSection === "bandejas"
                ? "border-[#1B3B2B] bg-[#FBF3E2]/45 shadow-xs"
                : "border-[#E4DDD1] bg-white hover:border-[#1B3B2B]/40"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
              Convenios B2B Pendientes
            </span>
            <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
              {pendingB2B.length}
            </p>
            <span className="text-xs text-[#5E645F]">Empresas / agencias por aprobar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("agencias")}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              activeSection === "agencias"
                ? "border-[#1B3B2B] bg-white shadow-xs"
                : "border-[#E4DDD1] bg-white hover:border-[#1B3B2B]/40"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9E6B4B]">
              Eventos / Cotizaciones
            </span>
            <p className="mt-1 font-editorial text-3xl font-semibold text-[#1B3B2B] tabular-nums">
              {agencyEvents.filter((e) => e.status === "PROXIMO_EVENTO").length} /{" "}
              {quoteRequests.filter((q) => q.status === "NUEVA").length}
            </p>
            <span className="text-xs text-[#5E645F]">Próximos eventos / cotizaciones nuevas</span>
          </button>
        </div>

        {cronResult && (
          <div className="rounded-2xl border border-[#BBD8C7] bg-[#E6F2EB] px-4 py-3 text-xs text-[#1B3B2B]">
            {cronResult}
          </div>
        )}

        {feedback && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-xs font-medium",
              feedback.ok
                ? "border-[#BBD8C7] bg-[#E6F2EB] text-[#1B3B2B]"
                : "border-[#F2C3C3] bg-[#FCECEC] text-[#9B2C2C]"
            )}
          >
            {feedback.text}
          </div>
        )}

        {/* Buscador Universal, Lector QR y Ficha (activos en Consumos y Canje) */}
        {(activeSection === "operacion" || activeSection === "canje") && (
          <>
            {members.length === 0 ? (
              <Card variant="sand" className="p-8 text-center">
                <p className="font-editorial text-2xl font-medium text-[#1B3B2B]">
                  Aún no hay socios registrados
                </p>
                <p className="mt-1 text-xs text-[#5E645F]">
                  Cuando se registre el primer socio personal, empresa o agencia, podrás buscarlo aquí
                  por número de socio, correo, RFC o QR para cargar consumos o procesar canjes.
                </p>
              </Card>
            ) : (
              <>
                {/* Buscador Universal y Lector QR */}
                <Card variant="white" className="p-6">
                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                      <label className={labelBaseClass}>
                        <span className="inline-flex items-center gap-1.5">
                          <Search className="h-3.5 w-3.5 text-[#9E6B4B]" /> Buscador Universal (Núm.
                          Socio, Nombre, Correo o RFC)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej. 000 248, Ana López, empresa@ejemplo.com o EDM210418AB9..."
                        className={inputBaseClass}
                      />
                    </div>

                    <div className="lg:col-span-5">
                      <label className={labelBaseClass}>
                        <span className="inline-flex items-center gap-1.5">
                          <QrCode className="h-3.5 w-3.5 text-[#9E6B4B]" /> Lector de Token QR
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          placeholder="Pega UUID QR o circulo-organico://qr/..."
                          className={inputBaseClass}
                        />
                        <button
                          type="button"
                          onClick={handleQrDecode}
                          className="shrink-0 rounded-xl bg-[#1B3B2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#132A1E]"
                        >
                          Leer QR
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista rápida de coincidencias */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filteredMembers.slice(0, 8).map((m) => {
                      const active = selectedMember?.membershipId === m.membershipId;
                      return (
                        <button
                          key={m.membershipId}
                          type="button"
                          onClick={() => selectMember(m)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition",
                            active
                              ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                              : "border-[#E4DDD1] bg-[#FAF8F5] text-[#1C201E] hover:border-[#1B3B2B]"
                          )}
                        >
                          <span className="font-mono font-semibold">{m.membershipNumber}</span>
                          <span>{m.legalName || m.fullName}</span>
                          <span className="opacity-70">({m.role.replace("SOCIO_", "")})</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Ficha de socio seleccionado */}
                {selectedMember && (
                  <Card variant="sand" className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#9E6B4B]">
                            SOCIO {selectedMember.membershipNumber}
                          </span>
                          <TierBadge tier={selectedMember.tier} />
                          <StatusBadge
                            label={selectedMember.status}
                            tone={selectedMember.status === "ACTIVA" ? "success" : "warning"}
                          />
                        </div>
                        <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
                          {selectedMember.legalName || selectedMember.fullName}
                        </h2>
                        <p className="text-xs text-[#5E645F]">
                          {selectedMember.email} · {selectedMember.phone}
                          {selectedMember.rfc ? ` · RFC ${selectedMember.rfc}` : ""}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl bg-white px-4 py-2.5">
                          <span className="block text-[10px] uppercase text-[#9E6B4B]">Puntos</span>
                          <strong className="font-editorial text-xl text-[#1B3B2B] tabular-nums">
                            {selectedMember.pointsBalance.toLocaleString("es-MX")} pts
                          </strong>
                        </div>
                        <div className="rounded-xl bg-white px-4 py-2.5">
                          <span className="block text-[10px] uppercase text-[#9E6B4B]">
                            Saldo Empresa
                          </span>
                          <strong className="font-editorial text-xl text-[#1B3B2B] tabular-nums">
                            {formatMxn(selectedMember.cashBalanceMxn)}
                          </strong>
                        </div>
                        <div className="rounded-xl bg-white px-4 py-2.5">
                          <span className="block text-[10px] uppercase text-[#9E6B4B]">
                            12m Noches / Visitas
                          </span>
                          <strong className="font-editorial text-xl text-[#1B3B2B] tabular-nums">
                            {selectedMember.rolling12mNights}n / {selectedMember.rolling12mStaysCount}v
                          </strong>
                        </div>
                        <div className="rounded-xl bg-white px-4 py-2.5">
                          <span className="block text-[10px] uppercase text-[#9E6B4B]">
                            12m Gasto Neto
                          </span>
                          <strong className="font-editorial text-xl text-[#1B3B2B] tabular-nums">
                            {formatMxn(selectedMember.rolling12mSpendMxn)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Navegación interna sincronizada */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "operacion" as const, label: "1. Carga de Consumos y Acreditación" },
            { id: "canje" as const, label: "2. Redención / Canje" },
            {
              id: "bandejas" as const,
              label: `3. Citas Spa (${massageRequests.filter((m) => m.status === "CITA_SOLICITADA").length}) & Convenios (${pendingB2B.length})`,
            },
            {
              id: "agencias" as const,
              label: `4. Eventos Agencias (${agencyEvents.length}) & Cotizaciones (${quoteRequests.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold transition",
                activeSection === tab.id
                  ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                  : "border-[#DFD6C7] bg-white text-[#4C524E] hover:border-[#1B3B2B]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECCIÓN 1: CARGA DE CONSUMOS Y PREVISUALIZACIÓN EN VIVO */}
        {activeSection === "operacion" && selectedMember && (
          <div className="grid gap-8 lg:grid-cols-12">
            <Card variant="white" className="p-6 lg:col-span-7">
              <SectionEyebrow>Transacción atómica Prisma + Neon</SectionEyebrow>
              <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                Registrar consumo o estancia pagada
              </h3>

              <form onSubmit={handleRecordConsumption} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelBaseClass}>Sede (6 propiedades)</label>
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className={inputBaseClass}
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelBaseClass}>Tipo de Operación</label>
                    <select
                      value={operationType}
                      onChange={(e) =>
                        setOperationType(
                          e.target.value as
                            | "ESTANCIA_HOSPEDAJE"
                            | "COMPRA_EMPRESA"
                            | "EVENTO_AGENCIA"
                        )
                      }
                      className={inputBaseClass}
                    >
                      <option value="ESTANCIA_HOSPEDAJE">Hospedaje Personal</option>
                      <option value="COMPRA_EMPRESA">Consumo / Evento Empresa (2%)</option>
                      <option value="EVENTO_AGENCIA">Liquidación Evento Agencia</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelBaseClass}>Noches pagadas</label>
                    <input
                      type="number"
                      min={0}
                      value={nightsCount}
                      onChange={(e) => setNightsCount(Math.max(0, Number(e.target.value)))}
                      className={inputBaseClass}
                    />
                  </div>
                  <div>
                    <label className={labelBaseClass}>Monto bruto (MXN)</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={grossAmount}
                      onChange={(e) => setGrossAmount(Math.max(0, Number(e.target.value)))}
                      className={inputBaseClass}
                    />
                  </div>
                  <div>
                    <label className={labelBaseClass}>Monto Neto Elegible (MXN)</label>
                    <input
                      type="number"
                      min={1}
                      step={100}
                      required
                      value={netEligibleAmount}
                      onChange={(e) => setNetEligibleAmount(Math.max(0, Number(e.target.value)))}
                      className={cn(inputBaseClass, "border-[#1B3B2B] font-semibold")}
                    />
                  </div>
                </div>

                {operationType === "ESTANCIA_HOSPEDAJE" && (
                  <div className="space-y-3 rounded-2xl bg-[#FAF8F5] p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelBaseClass}>Check-in</label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className={inputBaseClass}
                        />
                      </div>
                      <div>
                        <label className={labelBaseClass}>Check-out</label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className={inputBaseClass}
                        />
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4C524E]">
                      <input
                        type="checkbox"
                        checked={isConsecutiveStay}
                        onChange={(e) => setIsConsecutiveStay(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#1B3B2B]"
                      />
                      <span>
                        Reserva consecutiva en el mismo hotel (suma noches y gasto, pero cuenta como
                        1 sola estancia)
                      </span>
                    </label>
                  </div>
                )}

                {operationType === "EVENTO_AGENCIA" && (
                  <div>
                    <label className={labelBaseClass}>Cliente final del evento</label>
                    <input
                      type="text"
                      value={agencyClientName}
                      onChange={(e) => setAgencyClientName(e.target.value)}
                      placeholder="Nombre de la empresa o cliente del evento"
                      className={inputBaseClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelBaseClass}>Concepto en el Ledger</label>
                  <input
                    type="text"
                    required
                    value={chargeDesc}
                    onChange={(e) => setChargeDesc(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#132A1E] disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4 text-[#C8B289]" />
                  {isPending
                    ? "Ejecutando transacción en Neon..."
                    : "Confirmar y acreditar automáticamente"}
                </button>
              </form>
            </Card>

            {/* Previsualización en vivo antes de guardar */}
            <Card variant="forest" className="flex flex-col justify-between p-6 lg:col-span-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
                  Previsualización en vivo
                </span>
                <h3 className="mt-1 font-editorial text-2xl font-medium text-white">
                  Impacto exacto antes de guardar
                </h3>

                {personalPreview && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Puntos por estancia</span>
                      <strong className="text-[#C8B289] tabular-nums">
                        +{personalPreview.pointsFromStay} pts
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Bono 5ta estancia (+200 pts)</span>
                      <strong className="tabular-nums">
                        {personalPreview.qualifiesForFifthStayBonus
                          ? "¡APLICA! +200 pts"
                          : `No (${personalPreview.newRolling12mStaysCount}/5 estancias)`}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Total puntos a acreditar</span>
                      <strong className="font-editorial text-2xl text-white tabular-nums">
                        +{personalPreview.totalPointsToAdd} pts
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Nivel resultante</span>
                      <span className="font-semibold">
                        {personalPreview.previousTier} → {personalPreview.projectedTier}
                        {personalPreview.tierUpgraded && " (¡ASCENSO!)"}
                      </span>
                    </div>
                    {personalPreview.newMassageCertificates.length > 0 && (
                      <div className="rounded-xl bg-white/10 p-3 text-xs text-[#DFCFAF]">
                        <p className="font-semibold">
                          Certificados de masaje a emitir automáticamente (respetando tope 2/año):
                        </p>
                        <ul className="mt-1 list-disc pl-4">
                          {personalPreview.newMassageCertificates.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {corporatePreview && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Saldo corporativo (2% neto)</span>
                      <strong className="font-editorial text-2xl text-[#C8B289] tabular-nums">
                        +{formatMxn(corporatePreview.cashbackToAddMxn)}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Nuevo acumulado 12 meses</span>
                      <strong className="tabular-nums">
                        {formatMxn(corporatePreview.newRolling12mSpendMxn)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/75">Nivel corporativo</span>
                      <strong>
                        {corporatePreview.previousTier} → {corporatePreview.projectedTier}
                      </strong>
                    </div>
                  </div>
                )}

                {agencyPreview && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Nivel del evento</span>
                      <TierBadge tier={agencyPreview.eventTier} />
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">
                        Comisión ({agencyPreview.commissionPercentage}%)
                      </span>
                      <strong className="text-[#C8B289] tabular-nums">
                        {formatMxn(agencyPreview.commissionAmountMxn)}
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">
                        Puntos ({agencyPreview.pointsPercentage}%)
                      </span>
                      <strong className="tabular-nums">
                        +{agencyPreview.pointsGenerated.toLocaleString("es-MX")} pts
                      </strong>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3 text-xs text-white/90">
                      Regalo a liberar: <strong>{agencyPreview.rewardSummary}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Últimos movimientos del socio */}
              <div className="mt-6 border-t border-white/15 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8B289]">
                  Últimos movimientos del socio
                </p>
                <div className="mt-2 space-y-1.5 text-xs text-white/80">
                  {selectedMember.recentLedgers.slice(0, 4).map((l) => (
                    <div key={l.id} className="flex justify-between gap-2">
                      <span className="truncate">{l.description}</span>
                      <span className="shrink-0 font-mono">
                        {l.pointsDelta !== 0
                          ? `${l.pointsDelta > 0 ? "+" : ""}${l.pointsDelta} pts`
                          : `${l.cashDeltaMxn > 0 ? "+" : ""}${formatMxn(l.cashDeltaMxn)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECCIÓN 2: REDENCIÓN / CANJE */}
        {activeSection === "canje" && selectedMember && (
          <Card variant="white" className="p-6 sm:p-8">
            <SectionEyebrow>Validación en servidor</SectionEyebrow>
            <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
              Módulo de Redención (Puntos y Saldo Empresarial)
            </h3>
            <p className="mt-1 text-xs text-[#5E645F]">
              El motor aplica automáticamente los límites: mínimo 100 pts en personales, hasta 25%
              en hospedaje, hasta 10% en eventos empresariales y 100% en catálogo.
            </p>

            <form onSubmit={handleRedeem} className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelBaseClass}>Propósito del canje</label>
                    <select
                      value={redeemPurpose}
                      onChange={(e) => setRedeemPurpose(e.target.value as RedemptionPurpose)}
                      className={inputBaseClass}
                    >
                      <option value="HOSPEDAJE">Hospedaje (hasta 25%)</option>
                      <option value="EVENTO_EMPRESA">Evento Empresa (hasta 10%)</option>
                      <option value="PREMIO_CATALOGO">Premio de Catálogo (hasta 100%)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelBaseClass}>Sede</label>
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className={inputBaseClass}
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelBaseClass}>
                      Monto base elegible (MXN post-descuento)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={redeemBaseAmount}
                      onChange={(e) => setRedeemBaseAmount(Math.max(0, Number(e.target.value)))}
                      className={inputBaseClass}
                    />
                  </div>
                  <div>
                    <label className={labelBaseClass}>
                      {selectedMember.role === "EMPRESA"
                        ? "Saldo MXN a descontar"
                        : "Puntos a descontar (1 pt = $1 MXN)"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={redeemRequestedAmount}
                      onChange={(e) =>
                        setRedeemRequestedAmount(Math.max(0, Number(e.target.value)))
                      }
                      className={inputBaseClass}
                    />
                  </div>
                </div>

                {selectedMember.role === "EMPRESA" && (
                  <div>
                    <label className={labelBaseClass}>Persona que autoriza el saldo</label>
                    <select
                      value={authorizedPersonId}
                      onChange={(e) => setAuthorizedPersonId(e.target.value)}
                      className={inputBaseClass}
                    >
                      <option value="">Selecciona autorizador...</option>
                      {selectedMember.authorizedPeople.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.roleInAccount}) {!p.isActive ? "[Inactivo]" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={labelBaseClass}>Descripción del canje</label>
                  <input
                    type="text"
                    required
                    value={redeemDesc}
                    onChange={(e) => setRedeemDesc(e.target.value)}
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-[#DFD2BA] bg-[#FAF8F5] p-6 lg:col-span-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
                    Validación en tiempo real
                  </p>
                  {redemptionCheck && (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#5E645F]">Tope máximo permitido</span>
                        <strong className="text-[#1B3B2B] tabular-nums">
                          {formatMxn(redemptionCheck.maxAllowedAmountMxn)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5E645F]">Estado de regla</span>
                        <StatusBadge
                          label={redemptionCheck.valid ? "Permitido" : "Bloqueado"}
                          tone={redemptionCheck.valid ? "success" : "danger"}
                        />
                      </div>
                      {!redemptionCheck.valid && redemptionCheck.error && (
                        <p className="rounded-xl bg-[#FCECEC] p-3 text-xs text-[#9B2C2C]">
                          {redemptionCheck.error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending || !redemptionCheck?.valid}
                  className="mt-6 w-full rounded-full bg-[#1B3B2B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#132A1E] disabled:cursor-not-allowed disabled:bg-[#CFC9BE]"
                >
                  Ejecutar canje atómico
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* SECCIÓN 3: CITAS DE MASAJE & CONVENIOS B2B */}
        {activeSection === "bandejas" && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Bandeja de Citas de Bienestar */}
            <Card variant="white" className="p-6">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-[#9E6B4B]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Solicitudes de citas de masaje
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                {massageRequests.length === 0 ? (
                  <p className="text-xs text-[#5E645F]">Sin solicitudes de masaje registradas.</p>
                ) : (
                  massageRequests.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-[#E4DDD1] bg-[#FAF8F5] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#1B3B2B]">
                            {m.memberName} (SOCIO {m.membershipNumber})
                          </p>
                          <p className="text-xs text-[#4C524E]">{m.title}</p>
                          <p className="mt-1 text-xs text-[#9E6B4B]">
                            {m.propertyName ?? "Sede por definir"} ·{" "}
                            {formatShortDate(m.preferredDate)} · {m.preferredTimeSlot ?? "—"}
                          </p>
                        </div>
                        <StatusBadge
                          label={m.status}
                          tone={
                            m.status === "CITA_SOLICITADA"
                              ? "warning"
                              : m.status === "CONFIRMADO"
                                ? "success"
                                : "neutral"
                          }
                        />
                      </div>

                      <div className="mt-3 flex gap-2">
                        {m.status === "CITA_SOLICITADA" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                await updateMassageCertificateStatusAction({
                                  certificateId: m.id,
                                  status: "CONFIRMADO",
                                });
                                router.refresh();
                              })
                            }
                            className="rounded-full bg-[#1B3B2B] px-3.5 py-1.5 text-xs font-semibold text-white"
                          >
                            Confirmar cita
                          </button>
                        )}
                        {m.status === "CONFIRMADO" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                await updateMassageCertificateStatusAction({
                                  certificateId: m.id,
                                  status: "USADO",
                                });
                                router.refresh();
                              })
                            }
                            className="rounded-full bg-[#C8B289] px-3.5 py-1.5 text-xs font-semibold text-[#1B3B2B]"
                          >
                            Marcar como utilizado
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Bandeja de Convenios B2B */}
            <Card variant="white" className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#9E6B4B]" />
                <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Convenios B2B pendientes ({pendingB2B.length})
                </h3>
              </div>

              <div className="mt-4">
                <label className={labelBaseClass}>Tarifa / notas acordadas al aprobar</label>
                <input
                  type="text"
                  value={tariffNotes}
                  onChange={(e) => setTariffNotes(e.target.value)}
                  className={inputBaseClass}
                />
              </div>

              <div className="mt-4 space-y-3">
                {pendingB2B.length === 0 ? (
                  <p className="text-xs text-[#5E645F]">
                    No hay convenios pendientes de aprobación.
                  </p>
                ) : (
                  pendingB2B.map((b) => (
                    <div
                      key={b.membershipId}
                      className="rounded-2xl border border-[#E8D1A3] bg-[#FBF3E2]/45 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#1B3B2B]">{b.legalName}</p>
                          <p className="text-xs text-[#5E645F]">
                            {b.profileType} · RFC {b.rfc} · SOCIO {b.membershipNumber}
                          </p>
                          <p className="mt-1 text-xs text-[#4C524E]">
                            Resp: {b.responsibleName} ({b.workEmail})
                          </p>
                        </div>
                        <StatusBadge label="Pendiente" tone="warning" />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              await approveOrRejectB2BAction({
                                membershipId: b.membershipId,
                                action: "APPROVE",
                                agreedTariffNotes: tariffNotes,
                              });
                              router.refresh();
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-[#1B3B2B] px-3.5 py-1.5 text-xs font-semibold text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aprobar convenio
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              await approveOrRejectB2BAction({
                                membershipId: b.membershipId,
                                action: "REJECT",
                              });
                              router.refresh();
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-[#F2C3C3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#9B2C2C]"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* SECCIÓN 4: GESTOR DE EVENTOS AGENCIAS & COTIZACIONES */}
        {activeSection === "agencias" && (
          <div className="space-y-8">
            <Card variant="white" className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[#E4DDD1] px-6 py-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#9E6B4B]" />
                  <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                    Gestor de Eventos y Comisiones de Agencias
                  </h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80 text-xs uppercase tracking-[0.12em] text-[#5E645F]">
                      <th className="px-5 py-3.5">Evento / Agencia</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5">Monto / Nivel</th>
                      <th className="px-5 py-3.5">Comisión</th>
                      <th className="px-5 py-3.5">Acciones operativas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DC]">
                    {agencyEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#1B3B2B]">
                            {ev.code} · {ev.propertyName}
                          </p>
                          <p className="text-xs text-[#5E645F]">
                            {ev.agencyName} → Cliente: {ev.clientName}
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
                          <p className="font-semibold tabular-nums">{formatMxn(ev.netAmountMxn)}</p>
                          <TierBadge tier={ev.eventTier} />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold tabular-nums">
                            {formatMxn(ev.commissionAmountMxn)} ({ev.commissionPercentage}%)
                          </p>
                          <p className="text-xs text-[#5E645F]">{ev.commissionStatus}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {ev.status === "PROXIMO_EVENTO" && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  startTransition(async () => {
                                    const res = await settleAgencyEventAction(ev.id);
                                    if (!res.ok) {
                                      setFeedback({ ok: false, text: res.error });
                                    } else {
                                      setFeedback({
                                        ok: true,
                                        text: `Evento ${ev.code} liquidado: puntos y regalos liberados.`,
                                      });
                                    }
                                    router.refresh();
                                  })
                                }
                                className="rounded-full bg-[#1B3B2B] px-3.5 py-1.5 text-xs font-semibold text-white"
                              >
                                Liquidar (Realizado y pagado)
                              </button>
                            )}
                            {ev.commissionStatus === "AUTORIZADA" && (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                  startTransition(async () => {
                                    await markAgencyCommissionPaidAction(ev.id);
                                    router.refresh();
                                  })
                                }
                                className="rounded-full bg-[#C8B289] px-3.5 py-1.5 text-xs font-semibold text-[#1B3B2B]"
                              >
                                Marcar comisión Pagada
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Cotizaciones OTAM & Amanecer */}
            <Card variant="white" className="overflow-hidden p-0">
              <div className="border-b border-[#E4DDD1] px-6 py-4">
                <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Cotizaciones OTAM & Amanecer ({quoteRequests.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[740px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E4DDD1] bg-[#F2EFE9]/80 text-xs uppercase tracking-[0.12em] text-[#5E645F]">
                      <th className="px-5 py-3.5">Categoría</th>
                      <th className="px-5 py-3.5">Solicitante</th>
                      <th className="px-5 py-3.5">Pax / Sede</th>
                      <th className="px-5 py-3.5">Pago con saldo/pts</th>
                      <th className="px-5 py-3.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8DC]">
                    {quoteRequests.map((q) => (
                      <tr key={q.id}>
                        <td className="px-5 py-4 text-xs font-semibold text-[#1B3B2B]">
                          {q.category}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{q.contactName}</p>
                          <p className="text-xs text-[#5E645F]">
                            {q.contactEmail} · {q.requesterType}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#4C524E]">
                          {q.participantsCount} pax · {q.propertyName ?? "Por definir"}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          {q.payWithPointsOrBalance ? "Sí solicitó" : "Pago regular"}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={q.status}
                            onChange={(e) =>
                              startTransition(async () => {
                                await updateQuoteStatusAction(
                                  q.id,
                                  e.target.value as "NUEVA" | "EN_REVISION" | "COTIZADA"
                                );
                                router.refresh();
                              })
                            }
                            className="rounded-xl border border-[#DCD4C6] bg-white px-2.5 py-1 text-xs"
                          >
                            <option value="NUEVA">NUEVA</option>
                            <option value="EN_REVISION">EN_REVISION</option>
                            <option value="COTIZADA">COTIZADA</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

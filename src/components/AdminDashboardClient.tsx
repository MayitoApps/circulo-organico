"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Gift,
  MapPin,
  PlusCircle,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import {
  ADMIN_REDEEMABLE_EXPERIENCES,
  type MomentHotelKey,
} from "@/lib/catalog-data";
import {
  calculateAgencyEventBenefits,
  formatMxn,
  LOYALTY_CONSTANTS,
  PERSONAL_TIER_RULES,
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
  redeemCatalogExperienceByAdminAction,
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

function getRoleBadgeLabel(role: ProfileRole): string {
  switch (role) {
    case "EMPRESA":
      return "Empresa";
    case "AGENCIA":
      return "Agencia";
    case "SOCIO_PERSONAL":
    default:
      return "Personal";
  }
}

function getDefaultOperationForRole(
  role: ProfileRole
): "ESTANCIA_HOSPEDAJE" | "COMPRA_EMPRESA" | "EVENTO_AGENCIA" {
  if (role === "EMPRESA") return "COMPRA_EMPRESA";
  if (role === "AGENCIA") return "EVENTO_AGENCIA";
  return "ESTANCIA_HOSPEDAJE";
}

function calculateNightsBetween(checkIn: string, checkOut: string): number | null {
  if (!checkIn || !checkOut) return null;
  const start = new Date(`${checkIn}T15:00:00.000Z`);
  const end = new Date(`${checkOut}T12:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

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
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>(
    members.find((m) => m.membershipNumber === "000 248")?.membershipId ??
    members[0]?.membershipId ??
    ""
  );

  // Estado formulario Alta de Puntos / Consumos
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [nightsCount, setNightsCount] = useState(2);
  const [netEligibleAmount, setNetEligibleAmount] = useState(5000);
  const [grossAmount, setGrossAmount] = useState(5800);
  const [grossEditedManually, setGrossEditedManually] = useState(false);
  const [showAdvancedGross, setShowAdvancedGross] = useState(false);
  const [checkInDate, setCheckInDate] = useState("2026-11-18");
  const [checkOutDate, setCheckOutDate] = useState("2026-11-20");
  const [isConsecutiveStay, setIsConsecutiveStay] = useState(false);
  const [chargeDesc, setChargeDesc] = useState("Estancia pagada en recepción");
  const [agencyClientName, setAgencyClientName] = useState("");

  // Estado formulario Intercambio / Canje de Puntos (Catálogo visual + modo hospedaje opcional)
  const [redeemMode, setRedeemMode] = useState<"experiencias" | "hospedaje">("experiencias");
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>("");
  const [experienceScope, setExperienceScope] = useState<"disponibles" | "todas">("disponibles");
  const [hotelFilter, setHotelFilter] = useState<"todas" | MomentHotelKey | "varias">("todas");
  const [redeemPurpose, setRedeemPurpose] = useState<RedemptionPurpose>("HOSPEDAJE");
  const [redeemBaseAmount, setRedeemBaseAmount] = useState(4000);
  const [redeemRequestedAmount, setRedeemRequestedAmount] = useState(500);
  const [authorizedPersonId, setAuthorizedPersonId] = useState("");
  const [redeemDesc, setRedeemDesc] = useState("Canje de puntos en recepción");

  // Notas aprobación B2B & Feedback global
  const [tariffNotes, setTariffNotes] = useState("Tarifa preferente corporativa + 2% saldo");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [cronResult, setCronResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedMember = useMemo(
    () => members.find((m) => m.membershipId === selectedMembershipId) ?? members[0] ?? null,
    [members, selectedMembershipId]
  );

  const operationType = useMemo(
    () => getDefaultOperationForRole(selectedMember?.role ?? "SOCIO_PERSONAL"),
    [selectedMember]
  );

  const effectiveRedeemPurpose: RedemptionPurpose =
    selectedMember?.role !== "EMPRESA" && redeemPurpose === "EVENTO_EMPRESA"
      ? "HOSPEDAJE"
      : redeemPurpose;

  const effectiveAuthorizedPersonId = useMemo(() => {
    if (!selectedMember || selectedMember.role !== "EMPRESA") return "";
    const validPeople = selectedMember.authorizedPeople.filter(
      (p) => p.isActive && p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
    );
    if (authorizedPersonId && validPeople.some((p) => p.id === authorizedPersonId)) {
      return authorizedPersonId;
    }
    return validPeople[0]?.id ?? "";
  }, [selectedMember, authorizedPersonId]);

  const filteredMembers = useMemo(() => {
    const raw = searchQuery.trim();
    if (!raw) return members;
    const cleanedQr = raw.replace("circulo-organico://qr/", "").toLowerCase();
    const digitsOnly = cleanedQr.replace(/\D+/g, "");
    const q = raw.toLowerCase();

    return members.filter(
      (m) =>
        m.membershipNumber.toLowerCase().includes(q) ||
        (digitsOnly.length >= 3 && m.membershipNumber.replace(/\s+/g, "").includes(digitsOnly)) ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.qrToken.toLowerCase() === cleanedQr ||
        m.qrToken.toLowerCase().includes(q) ||
        (m.legalName && m.legalName.toLowerCase().includes(q)) ||
        (m.rfc && m.rfc.toLowerCase().includes(q))
    );
  }, [members, searchQuery]);

  const selectMember = (m: AdminMemberRecord) => {
    setSelectedMembershipId(m.membershipId);
    setSelectedExperienceId("");
    setFeedback(null);
    setGrossEditedManually(false);

    if (m.role === "EMPRESA") {
      setNightsCount(0);
      setNetEligibleAmount(50000);
      setGrossAmount(58000);
      setChargeDesc("Consumo corporativo pagado");
      setRedeemDesc("Aplicación de saldo empresarial en recepción");
      const defaultAuthorizer = m.authorizedPeople.find(
        (p) => p.isActive && p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
      );
      setAuthorizedPersonId(defaultAuthorizer?.id ?? "");
      setRedeemRequestedAmount(Math.min(1000, Math.floor(m.cashBalanceMxn) || 500));
    } else if (m.role === "AGENCIA") {
      setNightsCount(0);
      setNetEligibleAmount(120000);
      setGrossAmount(139200);
      setChargeDesc("Liquidación de evento corporativo");
      setRedeemPurpose("HOSPEDAJE");
      setRedeemDesc("Canje de puntos de agencia en recepción");
      setRedeemRequestedAmount(Math.min(1000, m.pointsBalance || 500));
    } else {
      setNightsCount(2);
      setNetEligibleAmount(5000);
      setGrossAmount(5800);
      setChargeDesc("Estancia pagada en recepción");
      setRedeemPurpose("HOSPEDAJE");
      setRedeemDesc("Canje de puntos en recepción");
      setRedeemRequestedAmount(Math.min(500, Math.max(100, m.pointsBalance)));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const trimmed = value.trim();
    if (!trimmed) return;
    const cleanedQr = trimmed.replace("circulo-organico://qr/", "").toLowerCase();
    const exactMatch = members.find(
      (m) =>
        m.qrToken.toLowerCase() === cleanedQr ||
        (trimmed.startsWith("circulo-organico://qr/") &&
          m.membershipNumber.replace(/\s+/g, "") === cleanedQr.replace(/\D+/g, ""))
    );
    if (exactMatch) {
      selectMember(exactMatch);
      setFeedback({
        ok: true,
        text: `QR detectado: ${exactMatch.legalName || exactMatch.fullName} (SOCIO ${exactMatch.membershipNumber}).`,
      });
    }
  };

  const handleNetAmountChange = (nextNet: number) => {
    const safeNet = Math.max(0, nextNet);
    setNetEligibleAmount(safeNet);
    if (!grossEditedManually) {
      setGrossAmount(safeNet);
    }
  };

  const handleDatesChange = (nextIn: string, nextOut: string) => {
    setCheckInDate(nextIn);
    setCheckOutDate(nextOut);
    const computedNights = calculateNightsBetween(nextIn, nextOut);
    if (computedNights !== null) {
      setNightsCount(computedNights);
    }
  };

  // Previsualización en vivo de Alta de Puntos / Saldo
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

  const effectiveRedeemBase =
    effectiveRedeemPurpose === "PREMIO_CATALOGO"
      ? Math.max(redeemRequestedAmount, 1)
      : redeemBaseAmount;

  // Validación en vivo del Intercambio / Canje
  const redemptionCheck = useMemo(() => {
    if (!selectedMember || selectedMember.role === "ADMIN_STAFF") return null;
    let isAuthorized = true;
    if (selectedMember.role === "EMPRESA") {
      const person = selectedMember.authorizedPeople.find(
        (p) => p.id === effectiveAuthorizedPersonId
      );
      isAuthorized = Boolean(
        person && person.isActive && person.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
      );
    }
    return validateRedemption({
      profileRole: selectedMember.role,
      purpose: effectiveRedeemPurpose,
      eligibleBaseAmountMxn: effectiveRedeemBase,
      requestedAmountMxn: redeemRequestedAmount,
      availableBalance:
        selectedMember.role === "EMPRESA"
          ? selectedMember.cashBalanceMxn
          : selectedMember.pointsBalance,
      isAuthorizedPerson: isAuthorized,
    });
  }, [
    selectedMember,
    effectiveRedeemPurpose,
    effectiveRedeemBase,
    redeemRequestedAmount,
    effectiveAuthorizedPersonId,
  ]);

  const maxApplyForCurrentRule = useMemo(() => {
    if (!selectedMember) return 0;
    const available =
      selectedMember.role === "EMPRESA"
        ? selectedMember.cashBalanceMxn
        : selectedMember.pointsBalance;
    if (effectiveRedeemPurpose === "PREMIO_CATALOGO") {
      return selectedMember.role === "EMPRESA" ? available : Math.floor(available);
    }
    const share =
      effectiveRedeemPurpose === "EVENTO_EMPRESA"
        ? LOYALTY_CONSTANTS.MAX_CORPORATE_EVENT_REDEMPTION_SHARE
        : LOYALTY_CONSTANTS.MAX_LODGING_REDEMPTION_SHARE;
    const byRule = Math.floor(redeemBaseAmount * share);
    return Math.max(0, Math.min(Math.floor(available), byRule));
  }, [selectedMember, effectiveRedeemPurpose, redeemBaseAmount]);

  const selectedMemberBalance = selectedMember
    ? selectedMember.role === "EMPRESA"
      ? selectedMember.cashBalanceMxn
      : selectedMember.pointsBalance
    : 0;

  const isCompanyAuthorized =
    selectedMember?.role !== "EMPRESA" || Boolean(effectiveAuthorizedPersonId);

  const affordableExperiencesCount = useMemo(
    () =>
      ADMIN_REDEEMABLE_EXPERIENCES.filter((exp) => {
        const cost = selectedMember?.role === "EMPRESA" ? exp.mxnReference : exp.pointsCost;
        return selectedMemberBalance >= cost;
      }).length,
    [selectedMember, selectedMemberBalance]
  );

  const effectiveScope =
    affordableExperiencesCount === 0 ? "todas" : experienceScope;

  const visibleExperiences = useMemo(() => {
    return ADMIN_REDEEMABLE_EXPERIENCES.filter((exp) => {
      if (hotelFilter !== "todas" && exp.hotelKey !== hotelFilter) return false;
      if (effectiveScope === "disponibles") {
        const cost = selectedMember?.role === "EMPRESA" ? exp.mxnReference : exp.pointsCost;
        return selectedMemberBalance >= cost;
      }
      return true;
    });
  }, [hotelFilter, effectiveScope, selectedMember, selectedMemberBalance]);

  const selectedExperience = useMemo(() => {
    if (!selectedMember) return null;
    const found = ADMIN_REDEEMABLE_EXPERIENCES.find((e) => e.id === selectedExperienceId);
    if (!found) return null;
    const cost = selectedMember.role === "EMPRESA" ? found.mxnReference : found.pointsCost;
    return selectedMemberBalance >= cost ? found : null;
  }, [selectedExperienceId, selectedMember, selectedMemberBalance]);

  const handleRedeemExperience = () => {
    if (!selectedMember || !selectedExperience) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await redeemCatalogExperienceByAdminAction({
        membershipId: selectedMember.membershipId,
        experienceId: selectedExperience.id,
        authorizedPersonId: effectiveAuthorizedPersonId || null,
      });

      if (!res.ok) {
        setFeedback({ ok: false, text: res.error });
        return;
      }

      setSelectedExperienceId("");
      setFeedback({ ok: true, text: res.summary });
      router.refresh();
    });
  };

  const handleRecordConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await recordAdminConsumptionAction({
        membershipId: selectedMember.membershipId,
        propertyId,
        operationType,
        grossAmountMxn: grossEditedManually ? grossAmount : netEligibleAmount,
        netEligibleAmountMxn: netEligibleAmount,
        nightsCount: operationType === "ESTANCIA_HOSPEDAJE" ? nightsCount : 0,
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
        purpose: effectiveRedeemPurpose,
        eligibleBaseAmountMxn: effectiveRedeemBase,
        requestedAmountMxn: redeemRequestedAmount,
        authorizedPersonId: effectiveAuthorizedPersonId || null,
        description: redeemDesc,
      });

      if (!res.ok) {
        setFeedback({ ok: false, text: res.error });
        return;
      }

      setFeedback({
        ok: true,
        text:
          selectedMember.role === "EMPRESA"
            ? `Canje aplicado: se descontaron ${formatMxn(redeemRequestedAmount)} del saldo de ${selectedMember.legalName || selectedMember.fullName}.`
            : `Canje aplicado: se descontaron ${redeemRequestedAmount.toLocaleString("es-MX")} pts de ${selectedMember.legalName || selectedMember.fullName}.`,
      });
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

  const pendingSpaCount = massageRequests.filter((m) => m.status === "CITA_SOLICITADA").length;
  const upcomingEventsCount = agencyEvents.filter((e) => e.status === "PROXIMO_EVENTO").length;
  const newQuotesCount = quoteRequests.filter((q) => q.status === "NUEVA").length;

  return (
    <div className="bg-[#FAF8F5] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header limpio + alertas rápidas */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E4DDD1] pb-5 lg:flex-row lg:items-end">
          <div>
            <SectionEyebrow>Administración · Recepción y Ventas</SectionEyebrow>
            <h1 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B] sm:text-4xl">
              {activeSection === "operacion"
                ? "Dar de alta puntos y consumos"
                : activeSection === "canje"
                  ? "Intercambiar / canjear puntos"
                  : activeSection === "bandejas"
                    ? "Citas Spa y Convenios B2B"
                    : "Eventos de Agencias y Cotizaciones"}
            </h1>
            <p className="mt-1 text-sm text-[#4C524E]">
              {activeSection === "operacion"
                ? "1) Elige al socio · 2) Anota lo que pagó · 3) Confirma cuántos puntos o saldo recibe."
                : activeSection === "canje"
                  ? "1) Elige al socio · 2) Indica para qué usa sus puntos o saldo · 3) Descuéntalos al instante."
                  : activeSection === "bandejas"
                    ? "Confirma citas de masaje de regalo y aprueba cuentas de empresas o agencias."
                    : "Liquida eventos para liberar comisiones y da seguimiento a cotizaciones."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(pendingSpaCount > 0 || pendingB2B.length > 0) && activeSection !== "bandejas" && (
              <button
                type="button"
                onClick={() => setActiveSection("bandejas")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D1A3] bg-[#FBF3E2] px-3.5 py-2 text-xs font-semibold text-[#8A5A19] transition hover:bg-[#F5E6C5]"
              >
                <CalendarCheck className="h-3.5 w-3.5" />
                {pendingSpaCount + pendingB2B.length} pendiente(s) en Spa / Convenios
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={handleRunCronMaintenance}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3B2B]/25 bg-white px-4 py-2 text-xs font-semibold text-[#1B3B2B] transition hover:bg-[#F2EFE9]"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
              Actualizar vigencias 12m
            </button>
          </div>
        </div>

        {/* Barra de acceso rápido entre tareas */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("operacion")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition",
              activeSection === "operacion"
                ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                : "border-[#DFD6C7] bg-white text-[#4C524E] hover:border-[#1B3B2B]"
            )}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Alta de puntos / consumos
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("canje")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition",
              activeSection === "canje"
                ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                : "border-[#DFD6C7] bg-white text-[#4C524E] hover:border-[#1B3B2B]"
            )}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Canje / intercambio
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("bandejas")}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold transition",
              activeSection === "bandejas"
                ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                : "border-[#DFD6C7] bg-white text-[#4C524E] hover:border-[#1B3B2B]"
            )}
          >
            Citas Spa ({pendingSpaCount}) &amp; Convenios ({pendingB2B.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("agencias")}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold transition",
              activeSection === "agencias"
                ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                : "border-[#DFD6C7] bg-white text-[#4C524E] hover:border-[#1B3B2B]"
            )}
          >
            Eventos ({upcomingEventsCount}) &amp; Cotizaciones ({newQuotesCount})
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
              "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
              feedback.ok
                ? "border-[#BBD8C7] bg-[#E6F2EB] text-[#1B3B2B]"
                : "border-[#F2C3C3] bg-[#FCECEC] text-[#9B2C2C]"
            )}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* PASO 1 (SOLO EN ALTA DE PUNTOS Y CANJE): ELEGIR SOCIO */}
        {(activeSection === "operacion" || activeSection === "canje") && (
          <>
            {members.length === 0 ? (
              <Card variant="sand" className="p-8 text-center">
                <p className="font-editorial text-2xl font-medium text-[#1B3B2B]">
                  Aún no hay socios registrados
                </p>
                <p className="mt-1 text-xs text-[#5E645F]">
                  Cuando se registre el primer socio personal, empresa o agencia, aparecerá aquí para
                  abonar o canjear puntos.
                </p>
              </Card>
            ) : (
              <Card variant="white" className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9E6B4B]">
                      Paso 1 · Selecciona al socio
                    </span>
                    <h2 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                      ¿A quién le quieres{" "}
                      {activeSection === "operacion" ? "sumar puntos / saldo?" : "canjear puntos?"}
                    </h2>
                  </div>

                  {/* Buscador único (Nombre, Núm., Correo, RFC o QR) */}
                  <div className="relative w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E6B4B]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Buscar por nombre, núm. socio, correo, RFC o pegar QR..."
                      className={cn(inputBaseClass, "pl-10 pr-10")}
                    />
                    <QrCode
                      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E645F]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Tarjetas seleccionables de socios */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMembers.slice(0, 6).map((m) => {
                    const active = selectedMember?.membershipId === m.membershipId;
                    const balanceDisplay =
                      m.role === "EMPRESA"
                        ? formatMxn(m.cashBalanceMxn)
                        : `${m.pointsBalance.toLocaleString("es-MX")} pts`;

                    return (
                      <button
                        key={m.membershipId}
                        type="button"
                        onClick={() => selectMember(m)}
                        className={cn(
                          "flex flex-col justify-between rounded-2xl border p-4 text-left transition",
                          active
                            ? "border-[#1B3B2B] bg-[#1B3B2B] text-white shadow-sm"
                            : "border-[#E4DDD1] bg-[#FAF8F5] text-[#1C201E] hover:border-[#1B3B2B]/60 hover:bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className={cn(
                                "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                active
                                  ? "bg-[#C8B289] text-[#1B3B2B]"
                                  : "bg-[#EFE8DC] text-[#6B4A31]"
                              )}
                            >
                              {getRoleBadgeLabel(m.role)} · {m.tier}
                            </span>
                            <p className="mt-1.5 truncate font-editorial text-lg font-semibold">
                              {m.legalName || m.fullName}
                            </p>
                            <p
                              className={cn(
                                "truncate text-xs",
                                active ? "text-white/75" : "text-[#5E645F]"
                              )}
                            >
                              SOCIO {m.membershipNumber} · {m.email}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "mt-3 flex items-center justify-between border-t pt-2.5 text-xs",
                            active ? "border-white/15" : "border-[#E4DDD1]"
                          )}
                        >
                          <span className={active ? "text-white/75" : "text-[#5E645F]"}>
                            Disponible:
                          </span>
                          <strong
                            className={cn(
                              "font-editorial text-lg tabular-nums",
                              active ? "text-[#C8B289]" : "text-[#1B3B2B]"
                            )}
                          >
                            {balanceDisplay}
                          </strong>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {filteredMembers.length === 0 && (
                  <p className="mt-4 text-xs text-[#9B2C2C]">
                    No hay coincidencias para &quot;{searchQuery}&quot;. Intenta con otro nombre, correo o
                    número de socio.
                  </p>
                )}

                {/* Resumen compacto del socio elegido + cambio rápido entre Sumar y Canjear */}
                {selectedMember && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DFD2BA] bg-[#F7F3EB] px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-semibold text-[#1B3B2B]">
                        Seleccionado: {selectedMember.legalName || selectedMember.fullName}
                      </span>
                      <TierBadge tier={selectedMember.tier} />
                      <StatusBadge
                        label={selectedMember.status}
                        tone={selectedMember.status === "ACTIVA" ? "success" : "warning"}
                      />
                      <span className="text-[#5E645F] tabular-nums">
                        12m: {selectedMember.rolling12mNights} noches ·{" "}
                        {selectedMember.rolling12mStaysCount} estancias ·{" "}
                        {formatMxn(selectedMember.rolling12mSpendMxn)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSection("operacion")}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                          activeSection === "operacion"
                            ? "bg-[#1B3B2B] text-white"
                            : "bg-white text-[#1B3B2B] hover:bg-[#EFE8DC]"
                        )}
                      >
                        + Dar de alta puntos
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("canje")}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                          activeSection === "canje"
                            ? "bg-[#1B3B2B] text-white"
                            : "bg-white text-[#1B3B2B] hover:bg-[#EFE8DC]"
                        )}
                      >
                        ⇄ Intercambiar / canjear
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {/* SECCIÓN 1: ALTA DE PUNTOS Y CONSUMOS (PASO 2 Y 3) */}
        {activeSection === "operacion" && selectedMember && (
          <div className="grid gap-6 lg:grid-cols-12">
            <Card variant="white" className="p-6 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <SectionEyebrow>Paso 2 · Registra el pago</SectionEyebrow>
                  <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                    {operationType === "ESTANCIA_HOSPEDAJE"
                      ? "Estancia pagada (Socio Personal)"
                      : operationType === "COMPRA_EMPRESA"
                        ? "Consumo pagado (Cuenta Empresa · 2%)"
                        : "Liquidar evento (Cuenta Agencia)"}
                  </h3>
                </div>
                <span className="rounded-full bg-[#FAF8F5] px-3 py-1 text-xs font-semibold text-[#9E6B4B]">
                  {operationType === "ESTANCIA_HOSPEDAJE"
                    ? `${PERSONAL_TIER_RULES[selectedMember.tier].pointsPer100Mxn} pts por cada $100 MXN`
                    : operationType === "COMPRA_EMPRESA"
                      ? "2% directo en saldo MXN"
                      : "Comisión + 1% a 2% pts"}
                </span>
              </div>

              <form onSubmit={handleRecordConsumption} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelBaseClass}>Hotel / Sede</label>
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
                    <label className={labelBaseClass}>
                      Monto elegible pagado (MXN sin impuestos)
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={100}
                      required
                      value={netEligibleAmount}
                      onChange={(e) => handleNetAmountChange(Number(e.target.value))}
                      className={cn(inputBaseClass, "border-[#1B3B2B] font-semibold")}
                    />
                  </div>
                </div>

                {/* Montos rápidos de ayuda */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[#5E645F]">Montos rápidos:</span>
                  {(operationType === "ESTANCIA_HOSPEDAJE"
                    ? [2500, 5000, 8000, 12000]
                    : operationType === "COMPRA_EMPRESA"
                      ? [20000, 50000, 100000, 200000]
                      : [75000, 120000, 180000, 260000]
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleNetAmountChange(preset)}
                      className="rounded-full border border-[#E4DDD1] bg-[#FAF8F5] px-2.5 py-1 font-medium text-[#1B3B2B] hover:border-[#1B3B2B]"
                    >
                      {formatMxn(preset)}
                    </button>
                  ))}
                </div>

                {operationType === "ESTANCIA_HOSPEDAJE" && (
                  <div className="space-y-3 rounded-2xl border border-[#EFE8DC] bg-[#FAF8F5] p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className={labelBaseClass}>Check-in</label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => handleDatesChange(e.target.value, checkOutDate)}
                          className={inputBaseClass}
                        />
                      </div>
                      <div>
                        <label className={labelBaseClass}>Check-out</label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => handleDatesChange(checkInDate, e.target.value)}
                          className={inputBaseClass}
                        />
                      </div>
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
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4C524E]">
                      <input
                        type="checkbox"
                        checked={isConsecutiveStay}
                        onChange={(e) => setIsConsecutiveStay(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#1B3B2B]"
                      />
                      <span>
                        Es extensión de la misma estancia (suma noches y monto, pero cuenta como 1
                        sola visita)
                      </span>
                    </label>
                  </div>
                )}

                {operationType === "EVENTO_AGENCIA" && (
                  <div>
                    <label className={labelBaseClass}>Nombre del cliente final del evento</label>
                    <input
                      type="text"
                      value={agencyClientName}
                      onChange={(e) => setAgencyClientName(e.target.value)}
                      placeholder="Ej. Corporativo Aurora / Boda Martínez"
                      className={inputBaseClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelBaseClass}>Nota o referencia (aparece en su historial)</label>
                  <input
                    type="text"
                    required
                    value={chargeDesc}
                    onChange={(e) => setChargeDesc(e.target.value)}
                    placeholder="Ej. Habitación 4 · 2 noches o Factura #104"
                    className={inputBaseClass}
                  />
                </div>

                {/* Campo opcional colapsado para monto bruto si difiere del neto */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedGross((prev) => !prev)}
                    className="text-xs font-medium text-[#5E645F] underline hover:text-[#1B3B2B]"
                  >
                    {showAdvancedGross
                      ? "Ocultar total con impuestos (bruto)"
                      : "¿Quieres registrar también el ticket total con impuestos?"}
                  </button>
                  {showAdvancedGross && (
                    <div className="mt-2">
                      <label className={labelBaseClass}>Monto bruto con impuestos (MXN)</label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={grossAmount}
                        onChange={(e) => {
                          setGrossEditedManually(true);
                          setGrossAmount(Math.max(0, Number(e.target.value)));
                        }}
                        className={inputBaseClass}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#132A1E] disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4 text-[#C8B289]" />
                  {isPending
                    ? "Guardando puntos..."
                    : operationType === "COMPRA_EMPRESA"
                      ? `Sumar +${formatMxn(corporatePreview?.cashbackToAddMxn ?? 0)} a su saldo`
                      : operationType === "ESTANCIA_HOSPEDAJE"
                        ? `Sumar +${personalPreview?.totalPointsToAdd ?? 0} puntos ahora`
                        : `Liquidar evento (+${agencyPreview?.pointsGenerated ?? 0} pts)`}
                </button>
              </form>
            </Card>

            {/* PASO 3: RESUMEN VISUAL EN VIVO */}
            <Card variant="forest" className="flex flex-col justify-between p-6 lg:col-span-5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
                  Paso 3 · Vista previa
                </span>
                <h3 className="mt-1 font-editorial text-2xl font-medium text-white">
                  Así quedará la cuenta
                </h3>

                {personalPreview && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Puntos actuales</span>
                      <span className="tabular-nums">
                        {selectedMember.pointsBalance.toLocaleString("es-MX")} pts
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Se suman por esta estancia</span>
                      <strong className="text-[#C8B289] tabular-nums">
                        +{personalPreview.pointsFromStay} pts
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Bono 5ta estancia (+200 pts)</span>
                      <strong className="tabular-nums">
                        {personalPreview.qualifiesForFifthStayBonus
                          ? "¡Se suma +200 pts!"
                          : `Falta (${personalPreview.newRolling12mStaysCount}/5 estancias)`}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-white/85">Nuevo saldo total</span>
                      <strong className="font-editorial text-3xl text-white tabular-nums">
                        {(
                          selectedMember.pointsBalance + personalPreview.totalPointsToAdd
                        ).toLocaleString("es-MX")}{" "}
                        pts
                      </strong>
                    </div>
                    <div className="flex justify-between pt-1 text-xs">
                      <span className="text-white/75">Nivel después de guardar</span>
                      <span className="font-semibold text-[#C8B289]">
                        {personalPreview.previousTier} → {personalPreview.projectedTier}
                        {personalPreview.tierUpgraded && " (¡SUBE DE NIVEL!)"}
                      </span>
                    </div>
                    {personalPreview.newMassageCertificates.length > 0 && (
                      <div className="rounded-xl bg-white/10 p-3 text-xs text-[#DFCFAF]">
                        <p className="font-semibold">
                          Regalo desbloqueado automáticamente:
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
                      <span className="text-white/75">Saldo actual</span>
                      <span className="tabular-nums">
                        {formatMxn(selectedMember.cashBalanceMxn)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/15 pb-2">
                      <span className="text-white/75">Se suma (2% sobre consumo neto)</span>
                      <strong className="text-[#C8B289] tabular-nums">
                        +{formatMxn(corporatePreview.cashbackToAddMxn)}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-white/85">Nuevo saldo disponible</span>
                      <strong className="font-editorial text-3xl text-white tabular-nums">
                        {formatMxn(
                          selectedMember.cashBalanceMxn + corporatePreview.cashbackToAddMxn
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/75">Nivel corporativo</span>
                      <strong className="text-[#C8B289]">
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
                        Puntos a sumar ({agencyPreview.pointsPercentage}%)
                      </span>
                      <strong className="tabular-nums">
                        +{agencyPreview.pointsGenerated.toLocaleString("es-MX")} pts
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-3">
                      <span className="text-white/85">Nuevo total de puntos</span>
                      <strong className="font-editorial text-2xl text-white tabular-nums">
                        {(
                          selectedMember.pointsBalance + agencyPreview.pointsGenerated
                        ).toLocaleString("es-MX")}{" "}
                        pts
                      </strong>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3 text-xs text-white/90">
                      Regalo incluido: <strong>{agencyPreview.rewardSummary}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Últimos movimientos del socio */}
              <div className="mt-6 border-t border-white/15 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8B289]">
                  Últimos movimientos de esta cuenta
                </p>
                {selectedMember.recentLedgers.length === 0 ? (
                  <p className="mt-2 text-xs text-white/65">Sin movimientos recientes aún.</p>
                ) : (
                  <div className="mt-2 space-y-1.5 text-xs text-white/80">
                    {selectedMember.recentLedgers.slice(0, 3).map((l) => (
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
                )}
              </div>
            </Card>
          </div>
        )}

        {/* SECCIÓN 2: INTERCAMBIO / CANJE VISUAL POR TARJETAS */}
        {activeSection === "canje" && selectedMember && (
          <div className="space-y-6">
            {/* Barra de modo y saldo */}
            <Card variant="white" className="p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 border-b border-[#EFE8DC] pb-4 lg:flex-row lg:items-center">
                <div>
                  <SectionEyebrow>Paso 2 · Elige la experiencia o premio</SectionEyebrow>
                  <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#1B3B2B]">
                    {redeemMode === "experiencias"
                      ? `Catálogo canjeable para ${selectedMember.legalName || selectedMember.fullName}`
                      : "Descuento con puntos en cuenta de hospedaje o evento"}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="rounded-2xl border border-[#DFD2BA] bg-[#FAF8F5] px-4 py-2 text-xs">
                    <span className="text-[#5E645F]">Saldo disponible: </span>
                    <strong className="font-editorial text-xl text-[#1B3B2B] tabular-nums">
                      {selectedMember.role === "EMPRESA"
                        ? formatMxn(selectedMember.cashBalanceMxn)
                        : `${selectedMember.pointsBalance.toLocaleString("es-MX")} pts`}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setRedeemMode((prev) =>
                        prev === "experiencias" ? "hospedaje" : "experiencias"
                      )
                    }
                    className="rounded-full border border-[#1B3B2B]/25 bg-white px-4 py-2 text-xs font-semibold text-[#1B3B2B] transition hover:bg-[#F2EFE9]"
                  >
                    {redeemMode === "experiencias"
                      ? "Descontar en cuenta de hospedaje (25%)"
                      : "← Volver a tarjetas de experiencias"}
                  </button>
                </div>
              </div>

              {selectedMember.role === "EMPRESA" && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#FAF8F5] px-4 py-3 text-xs">
                  <span className="font-semibold text-[#1B3B2B]">Autoriza uso de saldo:</span>
                  <select
                    value={effectiveAuthorizedPersonId}
                    onChange={(e) => setAuthorizedPersonId(e.target.value)}
                    className="rounded-xl border border-[#DCD4C6] bg-white px-3 py-1.5 text-xs text-[#1C201E]"
                  >
                    <option value="">Selecciona autorizador...</option>
                    {selectedMember.authorizedPeople.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} (
                        {p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
                          ? "Autoriza saldo"
                          : "Solo reserva"}
                        ) {!p.isActive ? "[Inactivo]" : ""}
                      </option>
                    ))}
                  </select>
                  {!isCompanyAuthorized && (
                    <span className="font-medium text-[#9B2C2C]">
                      Esta cuenta necesita una persona activa con permiso de autorización de saldo.
                    </span>
                  )}
                </div>
              )}

              {redeemMode === "experiencias" && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setExperienceScope("disponibles")}
                      disabled={affordableExperiencesCount === 0}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50",
                        effectiveScope === "disponibles"
                          ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                          : "border-[#DFD6C7] bg-white text-[#4C524E]"
                      )}
                    >
                      Le alcanzan ({affordableExperiencesCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setExperienceScope("todas")}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                        effectiveScope === "todas"
                          ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                          : "border-[#DFD6C7] bg-white text-[#4C524E]"
                      )}
                    >
                      Ver todo el catálogo ({ADMIN_REDEEMABLE_EXPERIENCES.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-[#5E645F]">Sede:</label>
                    <select
                      value={hotelFilter}
                      onChange={(e) =>
                        setHotelFilter(e.target.value as "todas" | MomentHotelKey | "varias")
                      }
                      className="rounded-xl border border-[#DCD4C6] bg-white px-3 py-1.5 text-xs text-[#1C201E]"
                    >
                      <option value="todas">Todas las sedes</option>
                      <option value="varias">OTAM · Varias sedes</option>
                      <option value="ajusco">Orgánico Ajusco</option>
                      <option value="tepoztlan">Orgánico Tepoztlán</option>
                      <option value="valle">Orgánico Valle</option>
                      <option value="veracruz">Orgánico Veracruz</option>
                      <option value="quinta-soledad">Quinta Soledad</option>
                      <option value="roma-norte">Roma Norte · Frontera 49</option>
                      <option value="origen">Origen Spa</option>
                    </select>
                  </div>
                </div>
              )}

              {redeemMode === "experiencias" && affordableExperiencesCount === 0 && (
                <div className="mt-4 rounded-2xl border border-[#E8D1A3] bg-[#FBF3E2] px-4 py-3 text-xs text-[#8A5A19]">
                  Este socio tiene{" "}
                  <strong>
                    {selectedMember.role === "EMPRESA"
                      ? formatMxn(selectedMemberBalance)
                      : `${selectedMemberBalance.toLocaleString("es-MX")} pts`}
                  </strong>{" "}
                  y la experiencia más accesible inicia en{" "}
                  <strong>
                    {ADMIN_REDEEMABLE_EXPERIENCES[0]?.pointsCost.toLocaleString("es-MX")} pts
                  </strong>
                  . Abajo ves el catálogo completo y cuántos puntos le faltan para cada una.
                </div>
              )}
            </Card>

            {redeemMode === "experiencias" ? (
              <div className="grid items-start gap-6 lg:grid-cols-12">
                {/* Tarjetas de experiencias */}
                <div className="lg:col-span-8">
                  {visibleExperiences.length === 0 ? (
                    <Card variant="sand" className="p-8 text-center">
                      <p className="text-sm text-[#4C524E]">
                        No hay experiencias en esa sede con el filtro actual. Cambia a{" "}
                        <strong>&quot;Todas las sedes&quot;</strong> o{" "}
                        <strong>&quot;Ver todo el catálogo&quot;</strong>.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {visibleExperiences.map((exp) => {
                        const cost =
                          selectedMember.role === "EMPRESA" ? exp.mxnReference : exp.pointsCost;
                        const canAfford = selectedMemberBalance >= cost;
                        const isSelected = selectedExperience?.id === exp.id;
                        const remainingAfter = selectedMemberBalance - cost;
                        const missingPoints = Math.max(0, cost - selectedMemberBalance);

                        return (
                          <button
                            key={exp.id}
                            type="button"
                            disabled={!canAfford}
                            onClick={() => setSelectedExperienceId(exp.id)}
                            className={cn(
                              "group flex h-full flex-col overflow-hidden rounded-3xl border text-left transition-all",
                              isSelected
                                ? "border-2 border-[#1B3B2B] bg-white ring-2 ring-[#C8B289] shadow-md"
                                : canAfford
                                  ? "border-[#E4DDD1] bg-white hover:-translate-y-0.5 hover:border-[#1B3B2B] hover:shadow-md"
                                  : "cursor-not-allowed border-[#E4DDD1] bg-[#F5F2EB] opacity-65"
                            )}
                          >
                            <div className="relative h-36 w-full overflow-hidden bg-[#EFE8DC]">
                              <img
                                src={exp.imageUrl}
                                alt={exp.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                              <span
                                className={cn(
                                  "absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                  isSelected
                                    ? "bg-[#C8B289] text-[#1B3B2B]"
                                    : "bg-[#FAF8F5]/95 text-[#1B3B2B]"
                                )}
                              >
                                {isSelected ? "✓ Seleccionada" : exp.hotelName}
                              </span>
                              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                                <p className="font-editorial text-xl font-medium leading-tight">
                                  {exp.title}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col justify-between p-4">
                              <div>
                                <p className="text-xs text-[#5E645F]">{exp.subtitle}</p>
                                <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-[#4C524E]">
                                  <span className="inline-flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5 text-[#9E6B4B]" />
                                    {exp.capacity}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-[#9E6B4B]" />
                                    {exp.hotelName}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between border-t border-[#EFE8DC] pt-3">
                                <div>
                                  <p className="font-editorial text-2xl font-semibold text-[#1B3B2B] tabular-nums">
                                    {selectedMember.role === "EMPRESA"
                                      ? formatMxn(cost)
                                      : `${cost.toLocaleString("es-MX")} pts`}
                                  </p>
                                </div>

                                {canAfford ? (
                                  <span
                                    className={cn(
                                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                                      isSelected
                                        ? "bg-[#1B3B2B] text-white"
                                        : "bg-[#E6F2EB] text-[#1B3B2B]"
                                    )}
                                  >
                                    {isSelected
                                      ? "Elegida"
                                      : `Quedan ${
                                          selectedMember.role === "EMPRESA"
                                            ? formatMxn(remainingAfter)
                                            : `${remainingAfter.toLocaleString("es-MX")} pts`
                                        }`}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-[#EFE8DC] px-3 py-1 text-[11px] font-semibold text-[#8A5A19]">
                                    Faltan{" "}
                                    {selectedMember.role === "EMPRESA"
                                      ? formatMxn(missingPoints)
                                      : `${missingPoints.toLocaleString("es-MX")} pts`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Panel fijo Paso 3 · Confirmar canje */}
                <div className="lg:col-span-4 lg:sticky lg:top-6">
                  <Card variant="forest" className="p-6">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
                      Paso 3 · Confirmar canje
                    </span>
                    <h3 className="mt-1 font-editorial text-2xl font-medium text-white">
                      Resumen del intercambio
                    </h3>

                    {!selectedExperience ? (
                      <div className="mt-5 rounded-2xl border border-white/15 bg-white/8 p-5 text-xs text-white/80">
                        <Gift className="mb-2.5 h-6 w-6 text-[#C8B289]" />
                        <p className="font-semibold text-white">
                          Selecciona una experiencia de la lista
                        </p>
                        <p className="mt-1 leading-relaxed">
                          Haz clic en cualquiera de las tarjetas disponibles para ver el saldo final
                          y descontar los puntos con un solo clic.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                          <img
                            src={selectedExperience.imageUrl}
                            alt={selectedExperience.title}
                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-editorial text-lg font-medium text-white">
                              {selectedExperience.title}
                            </p>
                            <p className="truncate text-xs text-[#C8B289]">
                              {selectedExperience.hotelName} · {selectedExperience.capacity}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-sm">
                          <div className="flex justify-between border-b border-white/15 pb-2">
                            <span className="text-white/75">Saldo actual</span>
                            <span className="tabular-nums">
                              {selectedMember.role === "EMPRESA"
                                ? formatMxn(selectedMemberBalance)
                                : `${selectedMemberBalance.toLocaleString("es-MX")} pts`}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-white/15 pb-2">
                            <span className="text-white/75">Costo de la experiencia</span>
                            <strong className="text-[#C8B289] tabular-nums">
                              -
                              {selectedMember.role === "EMPRESA"
                                ? formatMxn(selectedExperience.mxnReference)
                                : `${selectedExperience.pointsCost.toLocaleString("es-MX")} pts`}
                            </strong>
                          </div>
                          <div className="flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-3">
                            <span className="text-white/85">Saldo que le quedará</span>
                            <strong className="font-editorial text-2xl text-white tabular-nums">
                              {selectedMember.role === "EMPRESA"
                                ? formatMxn(
                                    Math.max(
                                      0,
                                      selectedMemberBalance - selectedExperience.mxnReference
                                    )
                                  )
                                : `${Math.max(
                                    0,
                                    selectedMemberBalance - selectedExperience.pointsCost
                                  ).toLocaleString("es-MX")} pts`}
                            </strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isPending || !isCompanyAuthorized}
                          onClick={handleRedeemExperience}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C8B289] px-6 py-3.5 text-sm font-semibold text-[#1B3B2B] transition hover:bg-[#DFCFAF] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          {isPending
                            ? "Canjeando..."
                            : selectedMember.role === "EMPRESA"
                              ? `Canjear saldo (-${formatMxn(selectedExperience.mxnReference)})`
                              : `Canjear puntos (-${selectedExperience.pointsCost.toLocaleString("es-MX")} pts)`}
                        </button>

                        <p className="text-center text-[11px] text-white/70">
                          Descuenta los puntos al instante y emite su certificado vigente por 12
                          meses.
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              /* Modo opcional: descuento en cuenta de hospedaje o evento (25% / 10%) */
              <div className="grid gap-6 lg:grid-cols-12">
                <Card variant="white" className="p-6 lg:col-span-7">
                  <form onSubmit={handleRedeem} className="space-y-5">
                    {selectedMember.role === "EMPRESA" && (
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setRedeemPurpose("HOSPEDAJE")}
                          className={cn(
                            "rounded-2xl border p-3.5 text-left transition",
                            effectiveRedeemPurpose === "HOSPEDAJE"
                              ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                              : "border-[#E4DDD1] bg-[#FAF8F5] text-[#1C201E]"
                          )}
                        >
                          <p className="text-xs font-semibold">Hospedaje (hasta 25%)</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRedeemPurpose("EVENTO_EMPRESA")}
                          className={cn(
                            "rounded-2xl border p-3.5 text-left transition",
                            effectiveRedeemPurpose === "EVENTO_EMPRESA"
                              ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                              : "border-[#E4DDD1] bg-[#FAF8F5] text-[#1C201E]"
                          )}
                        >
                          <p className="text-xs font-semibold">Evento Corporativo (hasta 10%)</p>
                        </button>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelBaseClass}>Hotel / Sede</label>
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
                        <label className={labelBaseClass}>
                          Total de la cuenta del huésped (MXN)
                        </label>
                        <input
                          type="number"
                          min={1}
                          step={100}
                          value={redeemBaseAmount}
                          onChange={(e) =>
                            setRedeemBaseAmount(Math.max(0, Number(e.target.value)))
                          }
                          className={inputBaseClass}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <label className={cn(labelBaseClass, "mb-0")}>
                          {selectedMember.role === "EMPRESA"
                            ? "Saldo MXN a descontar"
                            : "Puntos a descontar (1 pt = $1 MXN)"}
                        </label>
                        {maxApplyForCurrentRule > 0 && (
                          <button
                            type="button"
                            onClick={() => setRedeemRequestedAmount(maxApplyForCurrentRule)}
                            className="text-xs font-semibold text-[#1B3B2B] underline hover:text-[#9E6B4B]"
                          >
                            Usar máximo permitido (
                            {selectedMember.role === "EMPRESA"
                              ? formatMxn(maxApplyForCurrentRule)
                              : `${maxApplyForCurrentRule.toLocaleString("es-MX")} pts`}
                            )
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={redeemRequestedAmount}
                        onChange={(e) =>
                          setRedeemRequestedAmount(Math.max(0, Number(e.target.value)))
                        }
                        className={cn(inputBaseClass, "border-[#1B3B2B] font-semibold")}
                      />
                    </div>

                    <div>
                      <label className={labelBaseClass}>Nota del canje</label>
                      <input
                        type="text"
                        required
                        value={redeemDesc}
                        onChange={(e) => setRedeemDesc(e.target.value)}
                        className={inputBaseClass}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending || !redemptionCheck?.valid}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#132A1E] disabled:cursor-not-allowed disabled:bg-[#CFC9BE]"
                    >
                      <ArrowRightLeft className="h-4 w-4 text-[#C8B289]" />
                      {isPending ? "Aplicando..." : "Canjear puntos en esta cuenta"}
                    </button>
                  </form>
                </Card>

                <Card variant="forest" className="p-6 lg:col-span-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C8B289]">
                    Cuenta final en caja
                  </span>
                  {redemptionCheck && (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between border-b border-white/15 pb-2">
                        <span className="text-white/75">Máximo permitido</span>
                        <strong className="text-[#C8B289] tabular-nums">
                          {formatMxn(redemptionCheck.maxAllowedAmountMxn)}
                        </strong>
                      </div>
                      <div className="flex items-baseline justify-between rounded-xl bg-white/10 px-4 py-3">
                        <span className="text-white/85">Restante a cobrar en recepción</span>
                        <strong className="font-editorial text-3xl text-white tabular-nums">
                          {formatMxn(Math.max(0, redeemBaseAmount - redeemRequestedAmount))}
                        </strong>
                      </div>
                      {!redemptionCheck.valid && redemptionCheck.error && (
                        <div className="rounded-xl bg-[#9B2C2C]/35 p-3 text-xs text-white">
                          {redemptionCheck.error}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
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
                    Gestor de Eventos y Comisiones de Agencias ({agencyEvents.length})
                  </h3>
                </div>
              </div>
              {agencyEvents.length === 0 ? (
                <p className="p-6 text-xs text-[#5E645F]">
                  No hay eventos de agencias registrados todavía.
                </p>
              ) : (
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
                            <p className="font-semibold tabular-nums">
                              {formatMxn(ev.netAmountMxn)}
                            </p>
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
              )}
            </Card>

            {/* Cotizaciones OTAM & Amanecer */}
            <Card variant="white" className="overflow-hidden p-0">
              <div className="border-b border-[#E4DDD1] px-6 py-4">
                <h3 className="font-editorial text-2xl font-semibold text-[#1B3B2B]">
                  Cotizaciones OTAM &amp; Amanecer ({quoteRequests.length})
                </h3>
              </div>
              {quoteRequests.length === 0 ? (
                <p className="p-6 text-xs text-[#5E645F]">
                  No hay cotizaciones registradas todavía.
                </p>
              ) : (
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
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

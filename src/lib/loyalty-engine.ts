/**
 * Motor centralizado de reglas matemáticas y de negocio para Círculo Orgánico.
 * Todas las pantallas públicas (simuladores), paneles privados y transacciones del Dashboard
 * Administrativo (/admin) utilizan estas funciones puras como fuente única de verdad.
 */

export type Tier = "ORIGEN" | "ORO" | "DIAMANTE";
export type ProfileRole = "SOCIO_PERSONAL" | "EMPRESA" | "AGENCIA" | "ADMIN_STAFF";

export interface PersonalTierRule {
  tier: Tier;
  label: string;
  discountPct: number;
  pointsPer100Mxn: number;
  minNights12m: number;
  minSpend12mMxn: number;
  checkInLabel: string;
  checkOutLabel: string;
  upgradeRule: string;
  annualMassagesCap: number;
  courtesiesPer2PlusNights: number;
  hasPersonalAdvisor: boolean;
}

export const PERSONAL_TIER_RULES: Record<Tier, PersonalTierRule> = {
  ORIGEN: {
    tier: "ORIGEN",
    label: "Origen",
    discountPct: 15,
    pointsPer100Mxn: 3,
    minNights12m: 0,
    minSpend12mMxn: 0,
    checkInLabel: "Horario estándar (15:00)",
    checkOutLabel: "Horario estándar (12:00)",
    upgradeRule: "Mejora de habitación con puntos o promoción",
    annualMassagesCap: 0,
    courtesiesPer2PlusNights: 0,
    hasPersonalAdvisor: false,
  },
  ORO: {
    tier: "ORO",
    label: "Oro",
    discountPct: 20,
    pointsPer100Mxn: 4,
    minNights12m: 6,
    minSpend12mMxn: 18000,
    checkInLabel: "Desde las 13:00 (sujeto a confirmación)",
    checkOutLabel: "Hasta las 14:00 (sujeto a confirmación)",
    upgradeRule: "Mejora a la siguiente categoría de habitación",
    annualMassagesCap: 1,
    courtesiesPer2PlusNights: 1,
    hasPersonalAdvisor: false,
  },
  DIAMANTE: {
    tier: "DIAMANTE",
    label: "Diamante",
    discountPct: 30,
    pointsPer100Mxn: 5,
    minNights12m: 12,
    minSpend12mMxn: 40000,
    checkInLabel: "Desde las 12:00 (sujeto a confirmación)",
    checkOutLabel: "Hasta las 16:00 (sujeto a confirmación)",
    upgradeRule: "Mejora de habitación prioritaria",
    annualMassagesCap: 2,
    courtesiesPer2PlusNights: 2,
    hasPersonalAdvisor: true,
  },
};

export interface CourtesyOption {
  id: string;
  title: string;
  description: string;
  note: string;
}

export const STAY_COURTESIES_CATALOG: CourtesyOption[] = [
  {
    id: "BOTELLA_BRINDAR",
    title: "Una botella para brindar",
    description: "Vino de la casa o alternativa botánica sin alcohol servida en tu llegada.",
    note: "Aplica en estancias de 2 noches pagadas o más.",
  },
  {
    id: "MASCOTA_VIENE",
    title: "Tu mascota también viene",
    description: "Sin cargo de hospedaje para 1 mascota en habitaciones pet-friendly.",
    note: "Sujeto a disponibilidad de habitación pet-friendly.",
  },
  {
    id: "PEQUENO_INVITADO",
    title: "Un pequeño invitado",
    description: "1 menor de 12 años sin cargo en camas existentes de la habitación.",
    note: "Incluye amenidades de bienvenida infantil.",
  },
  {
    id: "POSTRE_PARA_DOS",
    title: "Un postre para dos",
    description: "Postre de la casa recién preparado para compartir en restaurante o terraza.",
    note: "Disponible en las 6 sedes participantes.",
  },
];

export const CORPORATE_TIER_RULES: Record<
  Tier,
  {
    tier: Tier;
    label: string;
    minSpend12mMxn: number;
    cashbackRate: number;
    perks: string[];
  }
> = {
  ORIGEN: {
    tier: "ORIGEN",
    label: "Empresas Origen",
    minSpend12mMxn: 0,
    cashbackRate: 0.02,
    perks: ["Tarifa corporativa acordada", "2% en saldo a favor ($2 por cada $100 netos)"],
  },
  ORO: {
    tier: "ORO",
    label: "Empresas Oro",
    minSpend12mMxn: 250000,
    cashbackRate: 0.02,
    perks: [
      "Atención prioritaria en reservas y eventos",
      "Descuentos corporativos acordados",
      "2% en saldo a favor",
    ],
  },
  DIAMANTE: {
    tier: "DIAMANTE",
    label: "Empresas Diamante",
    minSpend12mMxn: 500000,
    cashbackRate: 0.02,
    perks: [
      "Descuentos exclusivos en hospedaje y OTAM",
      "Ejecutivo de contacto asignado",
      "2% en saldo a favor",
    ],
  },
};

export const AGENCY_EVENT_RULES: Record<
  Tier,
  {
    tier: Tier;
    label: string;
    minAmountMxn: number;
    maxAmountMxn: number | null;
    commissionPct: number;
    pointsPct: number;
    giftNights: number;
    giftMassages: number;
    rewardSummary: string;
  }
> = {
  ORIGEN: {
    tier: "ORIGEN",
    label: "Evento Origen",
    minAmountMxn: 0,
    maxAmountMxn: 99999.99,
    commissionPct: 0,
    pointsPct: 1,
    giftNights: 0,
    giftMassages: 0,
    rewardSummary: "Sin noches de regalo",
  },
  ORO: {
    tier: "ORO",
    label: "Evento Oro",
    minAmountMxn: 100000,
    maxAmountMxn: 249999.99,
    commissionPct: 5,
    pointsPct: 2,
    giftNights: 1,
    giftMassages: 0,
    rewardSummary: "1 noche para dos",
  },
  DIAMANTE: {
    tier: "DIAMANTE",
    label: "Evento Diamante",
    minAmountMxn: 250000,
    maxAmountMxn: null,
    commissionPct: 8,
    pointsPct: 2,
    giftNights: 2,
    giftMassages: 1,
    rewardSummary: "2 noches para dos + 1 masaje individual",
  },
};

export const LOYALTY_CONSTANTS = {
  POINT_VALUE_MXN: 1,
  POINTS_EXPIRY_MONTHS: 24,
  CORPORATE_BALANCE_EXPIRY_MONTHS: 24,
  CERTIFICATE_EXPIRY_MONTHS: 12,
  MIN_POINTS_REDEMPTION: 100,
  MAX_LODGING_REDEMPTION_SHARE: 0.25,
  MAX_CORPORATE_EVENT_REDEMPTION_SHARE: 0.1,
  MAX_CATALOG_REDEMPTION_SHARE: 1.0,
  FIFTH_STAY_BONUS_POINTS: 200,
  FIFTH_STAY_THRESHOLD: 5,
  CORPORATE_CASHBACK_RATE: 0.02,
} as const;

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function getTwelveMonthsAgo(referenceDate: Date = new Date()): Date {
  return addMonths(referenceDate, -12);
}

/**
 * Determina el nivel de Socio Personal basado en noches pagadas o gasto neto elegible en los últimos 12 meses.
 */
export function evaluatePersonalTier(rolling12mNights: number, rolling12mSpendMxn: number): Tier {
  if (
    rolling12mNights >= PERSONAL_TIER_RULES.DIAMANTE.minNights12m ||
    rolling12mSpendMxn >= PERSONAL_TIER_RULES.DIAMANTE.minSpend12mMxn
  ) {
    return "DIAMANTE";
  }
  if (
    rolling12mNights >= PERSONAL_TIER_RULES.ORO.minNights12m ||
    rolling12mSpendMxn >= PERSONAL_TIER_RULES.ORO.minSpend12mMxn
  ) {
    return "ORO";
  }
  return "ORIGEN";
}

/**
 * Determina el nivel de Empresa basado en compras netas elegibles en los últimos 12 meses.
 */
export function evaluateCorporateTier(rolling12mSpendMxn: number): Tier {
  if (rolling12mSpendMxn >= CORPORATE_TIER_RULES.DIAMANTE.minSpend12mMxn) {
    return "DIAMANTE";
  }
  if (rolling12mSpendMxn >= CORPORATE_TIER_RULES.ORO.minSpend12mMxn) {
    return "ORO";
  }
  return "ORIGEN";
}

/**
 * Calcula los beneficios de un evento individual de Agencia según su monto neto elegible.
 */
export function calculateAgencyEventBenefits(netAmountMxn: number): {
  eventTier: Tier;
  commissionPercentage: number;
  commissionAmountMxn: number;
  pointsPercentage: number;
  pointsGenerated: number;
  giftNights: number;
  giftMassages: number;
  rewardSummary: string;
} {
  const safeNet = Math.max(0, round2(netAmountMxn));
  let eventTier: Tier = "ORIGEN";
  if (safeNet >= AGENCY_EVENT_RULES.DIAMANTE.minAmountMxn) {
    eventTier = "DIAMANTE";
  } else if (safeNet >= AGENCY_EVENT_RULES.ORO.minAmountMxn) {
    eventTier = "ORO";
  }

  const rule = AGENCY_EVENT_RULES[eventTier];
  const commissionAmountMxn = round2((safeNet * rule.commissionPct) / 100);
  const pointsGenerated = Math.floor((safeNet * rule.pointsPct) / 100);

  return {
    eventTier,
    commissionPercentage: rule.commissionPct,
    commissionAmountMxn,
    pointsPercentage: rule.pointsPct,
    pointsGenerated,
    giftNights: rule.giftNights,
    giftMassages: rule.giftMassages,
    rewardSummary: rule.rewardSummary,
  };
}

/**
 * Calcula puntos personales ganados sobre el monto neto elegible pagado.
 * Origen: 3 pts / $100, Oro: 4 pts / $100, Diamante: 5 pts / $100.
 */
export function calculatePersonalPointsEarned(netEligibleAmountMxn: number, tier: Tier): number {
  const safeNet = Math.max(0, netEligibleAmountMxn);
  const rate = PERSONAL_TIER_RULES[tier].pointsPer100Mxn;
  return Math.floor((safeNet * rate) / 100);
}

/**
 * Calcula el 2% en saldo a favor para cuentas Empresa sobre monto neto elegible.
 */
export function calculateCorporateCashback(netEligibleAmountMxn: number): number {
  const safeNet = Math.max(0, netEligibleAmountMxn);
  return round2(safeNet * LOYALTY_CONSTANTS.CORPORATE_CASHBACK_RATE);
}

export interface StaySimulationInput {
  baseNightPriceMxn: number;
  nights: number;
  tier: Tier;
  availablePoints?: number;
  pointsToUse?: number;
  isDirectBooking?: boolean;
  hasOtherPromotionOrNegotiatedRate?: boolean;
}

export interface StaySimulationResult {
  grossAmountMxn: number;
  discountPercentage: number;
  discountAmountMxn: number;
  priceAfterDiscountMxn: number;
  maxRedeemableMxn: number;
  pointsApplied: number;
  pointsDiscountMxn: number;
  netEligiblePaidMxn: number;
  pointsToEarn: number;
  pointsRatePer100: number;
  eligibleCourtesiesCount: number;
  checkInLabel: string;
  checkOutLabel: string;
  upgradeRule: string;
}

/**
 * Simulador oficial de reserva directa y cálculo de beneficios por estancia.
 */
export function simulateDirectStay(input: StaySimulationInput): StaySimulationResult {
  const nights = Math.max(1, Math.floor(input.nights));
  const grossAmountMxn = round2(Math.max(0, input.baseNightPriceMxn) * nights);
  const rule = PERSONAL_TIER_RULES[input.tier];

  const isDirect = input.isDirectBooking ?? true;
  const hasConflictRate = input.hasOtherPromotionOrNegotiatedRate ?? false;
  const discountPercentage = isDirect && !hasConflictRate ? rule.discountPct : 0;

  const discountAmountMxn = round2((grossAmountMxn * discountPercentage) / 100);
  const priceAfterDiscountMxn = round2(grossAmountMxn - discountAmountMxn);
  const maxRedeemableMxn = Math.floor(
    priceAfterDiscountMxn * LOYALTY_CONSTANTS.MAX_LODGING_REDEMPTION_SHARE
  );

  const requestedPts = Math.max(0, Math.floor(input.pointsToUse ?? 0));
  const availablePts = Math.max(0, Math.floor(input.availablePoints ?? requestedPts));
  let pointsApplied = 0;

  if (requestedPts >= LOYALTY_CONSTANTS.MIN_POINTS_REDEMPTION) {
    pointsApplied = Math.min(requestedPts, availablePts, maxRedeemableMxn);
    if (pointsApplied < LOYALTY_CONSTANTS.MIN_POINTS_REDEMPTION) {
      pointsApplied = 0;
    }
  }

  const pointsDiscountMxn = round2(pointsApplied * LOYALTY_CONSTANTS.POINT_VALUE_MXN);
  const netEligiblePaidMxn = round2(Math.max(0, priceAfterDiscountMxn - pointsDiscountMxn));
  const pointsToEarn = calculatePersonalPointsEarned(netEligiblePaidMxn, input.tier);
  const eligibleCourtesiesCount = nights >= 2 ? rule.courtesiesPer2PlusNights : 0;

  return {
    grossAmountMxn,
    discountPercentage,
    discountAmountMxn,
    priceAfterDiscountMxn,
    maxRedeemableMxn,
    pointsApplied,
    pointsDiscountMxn,
    netEligiblePaidMxn,
    pointsToEarn,
    pointsRatePer100: rule.pointsPer100Mxn,
    eligibleCourtesiesCount,
    checkInLabel: rule.checkInLabel,
    checkOutLabel: rule.checkOutLabel,
    upgradeRule: rule.upgradeRule,
  };
}

export type RedemptionPurpose = "HOSPEDAJE" | "EVENTO_EMPRESA" | "PREMIO_CATALOGO";

export interface RedemptionValidationInput {
  profileRole: "SOCIO_PERSONAL" | "EMPRESA" | "AGENCIA";
  purpose: RedemptionPurpose;
  eligibleBaseAmountMxn: number;
  requestedAmountMxn: number;
  availableBalance: number; // points for SOCIO_PERSONAL/AGENCIA, cashBalanceMxn for EMPRESA
  isAuthorizedPerson?: boolean;
}

export interface RedemptionValidationResult {
  valid: boolean;
  error?: string;
  maxAllowedAmountMxn: number;
  approvedAmountMxn: number;
}

/**
 * Valida en servidor (y previsualiza en UI) los topes estrictos de canje de puntos o saldo empresarial.
 */
export function validateRedemption(input: RedemptionValidationInput): RedemptionValidationResult {
  const base = Math.max(0, round2(input.eligibleBaseAmountMxn));
  const requested = Math.max(0, round2(input.requestedAmountMxn));
  const available = Math.max(0, round2(input.availableBalance));

  if (requested <= 0) {
    return {
      valid: false,
      error: "El monto o puntos a canjear debe ser mayor a cero.",
      maxAllowedAmountMxn: 0,
      approvedAmountMxn: 0,
    };
  }

  if (input.profileRole === "EMPRESA" && input.isAuthorizedPerson === false) {
    return {
      valid: false,
      error: "Solo las personas autorizadas en la cuenta empresarial pueden utilizar el saldo.",
      maxAllowedAmountMxn: 0,
      approvedAmountMxn: 0,
    };
  }

  let shareCap: number = LOYALTY_CONSTANTS.MAX_LODGING_REDEMPTION_SHARE;
  if (input.purpose === "EVENTO_EMPRESA") {
    if (input.profileRole !== "EMPRESA") {
      return {
        valid: false,
        error: "El tope del 10% en eventos aplica únicamente a cuentas Empresa.",
        maxAllowedAmountMxn: 0,
        approvedAmountMxn: 0,
      };
    }
    shareCap = LOYALTY_CONSTANTS.MAX_CORPORATE_EVENT_REDEMPTION_SHARE;
  } else if (input.purpose === "PREMIO_CATALOGO") {
    shareCap = LOYALTY_CONSTANTS.MAX_CATALOG_REDEMPTION_SHARE;
  }

  const maxByRule = round2(base * shareCap);

  if (input.profileRole === "SOCIO_PERSONAL" || input.profileRole === "AGENCIA") {
    if (!Number.isInteger(requested)) {
      return {
        valid: false,
        error: "Los puntos deben canjearse en cantidades enteras.",
        maxAllowedAmountMxn: Math.floor(maxByRule),
        approvedAmountMxn: 0,
      };
    }
    if (
      input.profileRole === "SOCIO_PERSONAL" &&
      requested < LOYALTY_CONSTANTS.MIN_POINTS_REDEMPTION
    ) {
      return {
        valid: false,
        error: `El canje en cuentas personales requiere al menos ${LOYALTY_CONSTANTS.MIN_POINTS_REDEMPTION} puntos.`,
        maxAllowedAmountMxn: Math.floor(maxByRule),
        approvedAmountMxn: 0,
      };
    }
  }

  if (requested > available) {
    return {
      valid: false,
      error:
        input.profileRole === "EMPRESA"
          ? `Saldo insuficiente (disponible: $${available.toFixed(2)} MXN).`
          : `Puntos insuficientes (disponibles: ${Math.floor(available)} pts).`,
      maxAllowedAmountMxn: maxByRule,
      approvedAmountMxn: 0,
    };
  }

  if (requested > maxByRule) {
    const pctLabel = Math.round(shareCap * 100);
    return {
      valid: false,
      error: `El canje excede el límite permitido del ${pctLabel}% ($${maxByRule.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} MXN máximo sobre $${base.toLocaleString("es-MX")} MXN).`,
      maxAllowedAmountMxn: maxByRule,
      approvedAmountMxn: 0,
    };
  }

  return {
    valid: true,
    maxAllowedAmountMxn: maxByRule,
    approvedAmountMxn: requested,
  };
}

/**
 * Determina cuántos certificados de masaje de 60 minutos deben emitirse al alcanzar un nivel,
 * respetando estrictamente la regla de tope de 2 sesiones cada 12 meses en Diamante cuando
 * el socio ya tenía o usó su sesión Oro en el mismo periodo.
 */
export function computeNewMassageCertificatesCount(params: {
  newTier: Tier;
  existingMassagesInCurrent12mPeriod: number;
}): {
  toIssueCount: number;
  titles: string[];
} {
  const cap = PERSONAL_TIER_RULES[params.newTier].annualMassagesCap;
  const existing = Math.max(0, params.existingMassagesInCurrent12mPeriod);
  const toIssueCount = Math.max(0, cap - existing);

  const titles: string[] = [];
  if (toIssueCount === 1 && existing === 0) {
    titles.push("Masaje relajante de 60 min — Titular");
  } else if (toIssueCount === 1 && existing >= 1) {
    titles.push("Masaje relajante de 60 min — Acompañante");
  } else if (toIssueCount >= 2) {
    titles.push("Masaje relajante de 60 min — Titular");
    titles.push("Masaje relajante de 60 min — Acompañante");
  }

  return { toIssueCount, titles };
}

export interface PersonalChargePreviewInput {
  currentTier: Tier;
  currentRolling12mNights: number;
  currentRolling12mSpendMxn: number;
  currentRolling12mStaysCount: number;
  fifthStayBonusClaimedAt: Date | null;
  existingMassagesInCurrent12mPeriod: number;
  netEligibleAmountMxn: number;
  nightsCount: number;
  isConsecutiveStay: boolean;
  transactionDate?: Date;
}

export interface PersonalChargePreviewResult {
  previousTier: Tier;
  projectedTier: Tier;
  tierUpgraded: boolean;
  pointsFromStay: number;
  fifthStayBonusPoints: number;
  totalPointsToAdd: number;
  newRolling12mNights: number;
  newRolling12mSpendMxn: number;
  newRolling12mStaysCount: number;
  qualifiesForFifthStayBonus: boolean;
  newMassageCertificates: string[];
  newDiscountPercentage: number;
}

/**
 * Previsualiza (y sirve de base para la transacción atómica en Prisma) el impacto completo de
 * registrar una estancia personal pagada.
 */
export function previewPersonalStayCharge(
  input: PersonalChargePreviewInput
): PersonalChargePreviewResult {
  const now = input.transactionDate ?? new Date();
  const net = Math.max(0, round2(input.netEligibleAmountMxn));
  const nights = Math.max(0, Math.floor(input.nightsCount));

  const newRolling12mNights = input.currentRolling12mNights + nights;
  const newRolling12mSpendMxn = round2(input.currentRolling12mSpendMxn + net);
  const stayIncrement = input.isConsecutiveStay || net <= 0 ? 0 : 1;
  const newRolling12mStaysCount = input.currentRolling12mStaysCount + stayIncrement;

  const projectedTier = evaluatePersonalTier(newRolling12mNights, newRolling12mSpendMxn);
  // Se calcula con el nivel proyectado si la estancia cierra la meta, o nivel actual?
  // En la operación hotelera se acredita con el nivel vigente al momento de la estancia:
  const pointsFromStay = calculatePersonalPointsEarned(net, input.currentTier);

  const twelveMonthsAgo = getTwelveMonthsAgo(now);
  const alreadyClaimedRecently =
    input.fifthStayBonusClaimedAt !== null && input.fifthStayBonusClaimedAt > twelveMonthsAgo;

  const qualifiesForFifthStayBonus =
    !alreadyClaimedRecently &&
    stayIncrement > 0 &&
    input.currentRolling12mStaysCount < LOYALTY_CONSTANTS.FIFTH_STAY_THRESHOLD &&
    newRolling12mStaysCount >= LOYALTY_CONSTANTS.FIFTH_STAY_THRESHOLD;

  const fifthStayBonusPoints = qualifiesForFifthStayBonus
    ? LOYALTY_CONSTANTS.FIFTH_STAY_BONUS_POINTS
    : 0;

  const massagePlan = computeNewMassageCertificatesCount({
    newTier: projectedTier,
    existingMassagesInCurrent12mPeriod: input.existingMassagesInCurrent12mPeriod,
  });

  return {
    previousTier: input.currentTier,
    projectedTier,
    tierUpgraded: projectedTier !== input.currentTier,
    pointsFromStay,
    fifthStayBonusPoints,
    totalPointsToAdd: pointsFromStay + fifthStayBonusPoints,
    newRolling12mNights,
    newRolling12mSpendMxn,
    newRolling12mStaysCount,
    qualifiesForFifthStayBonus,
    newMassageCertificates: massagePlan.titles,
    newDiscountPercentage: PERSONAL_TIER_RULES[projectedTier].discountPct,
  };
}

export interface CorporateChargePreviewResult {
  previousTier: Tier;
  projectedTier: Tier;
  tierUpgraded: boolean;
  cashbackToAddMxn: number;
  newRolling12mSpendMxn: number;
  progressToNextTierPct: number;
  nextTierLabel: string | null;
  remainingToNextTierMxn: number;
}

export function previewCorporateCharge(params: {
  currentTier: Tier;
  currentRolling12mSpendMxn: number;
  netEligibleAmountMxn: number;
}): CorporateChargePreviewResult {
  const net = Math.max(0, round2(params.netEligibleAmountMxn));
  const cashbackToAddMxn = calculateCorporateCashback(net);
  const newRolling12mSpendMxn = round2(params.currentRolling12mSpendMxn + net);
  const projectedTier = evaluateCorporateTier(newRolling12mSpendMxn);

  let nextTierLabel: string | null = null;
  let progressToNextTierPct = 100;
  let remainingToNextTierMxn = 0;

  if (projectedTier === "ORIGEN") {
    nextTierLabel = "Empresas Oro";
    const target = CORPORATE_TIER_RULES.ORO.minSpend12mMxn;
    progressToNextTierPct = Math.min(100, Math.round((newRolling12mSpendMxn / target) * 100));
    remainingToNextTierMxn = Math.max(0, round2(target - newRolling12mSpendMxn));
  } else if (projectedTier === "ORO") {
    nextTierLabel = "Empresas Diamante";
    const target = CORPORATE_TIER_RULES.DIAMANTE.minSpend12mMxn;
    progressToNextTierPct = Math.min(100, Math.round((newRolling12mSpendMxn / target) * 100));
    remainingToNextTierMxn = Math.max(0, round2(target - newRolling12mSpendMxn));
  }

  return {
    previousTier: params.currentTier,
    projectedTier,
    tierUpgraded: projectedTier !== params.currentTier,
    cashbackToAddMxn,
    newRolling12mSpendMxn,
    progressToNextTierPct,
    nextTierLabel,
    remainingToNextTierMxn,
  };
}

/**
 * Formatea un entero secuencial al estilo oficial "000 248".
 */
export function formatMembershipNumber(sequence: number): string {
  const padded = String(Math.max(1, Math.floor(sequence))).padStart(6, "0");
  return `${padded.slice(0, 3)} ${padded.slice(3)}`;
}

/**
 * Formatea cantidades en pesos mexicanos sin ruido innecesario.
 */
export function formatMxn(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

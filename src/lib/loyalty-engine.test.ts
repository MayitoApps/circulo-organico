import { describe, expect, it } from "vitest";
import {
  calculateAgencyEventBenefits,
  calculateCorporateCashback,
  calculatePersonalPointsEarned,
  computeNewMassageCertificatesCount,
  evaluateCorporateTier,
  evaluatePersonalTier,
  formatMembershipNumber,
  previewCorporateCharge,
  previewPersonalStayCharge,
  simulateDirectStay,
  validateRedemption,
} from "./loyalty-engine";

describe("Motor de Lealtad - Círculo Orgánico", () => {
  it("calcula simulador de estancia directa para Diamante ($5,000 -> -$1,500 -> $3,500 -> 175 pts)", () => {
    const sim = simulateDirectStay({
      baseNightPriceMxn: 2500,
      nights: 2,
      tier: "DIAMANTE",
    });

    expect(sim.grossAmountMxn).toBe(5000);
    expect(sim.discountPercentage).toBe(30);
    expect(sim.discountAmountMxn).toBe(1500);
    expect(sim.priceAfterDiscountMxn).toBe(3500);
    expect(sim.netEligiblePaidMxn).toBe(3500);
    expect(sim.pointsToEarn).toBe(175);
    expect(sim.eligibleCourtesiesCount).toBe(2);
  });

  it("aplica regla de descuento no acumulable con tarifa negociada u otra promoción", () => {
    const sim = simulateDirectStay({
      baseNightPriceMxn: 5000,
      nights: 1,
      tier: "DIAMANTE",
      hasOtherPromotionOrNegotiatedRate: true,
    });

    expect(sim.discountPercentage).toBe(0);
    expect(sim.netEligiblePaidMxn).toBe(5000);
    expect(sim.pointsToEarn).toBe(250);
  });

  it("calcula puntos personales sobre monto neto elegible después de canjear puntos (máx 25%)", () => {
    const sim = simulateDirectStay({
      baseNightPriceMxn: 5000,
      nights: 1,
      tier: "ORO",
      availablePoints: 2000,
      pointsToUse: 1500, // precio post 20% = 4000, 25% máx = 1000
    });

    expect(sim.priceAfterDiscountMxn).toBe(4000);
    expect(sim.maxRedeemableMxn).toBe(1000);
    expect(sim.pointsApplied).toBe(1000);
    expect(sim.netEligiblePaidMxn).toBe(3000);
    expect(sim.pointsToEarn).toBe(120); // 4 pts / $100 sobre 3000
  });

  it("evalúa ascensos personales por noches o gasto en 12 meses", () => {
    expect(evaluatePersonalTier(5, 17999)).toBe("ORIGEN");
    expect(evaluatePersonalTier(6, 5000)).toBe("ORO");
    expect(evaluatePersonalTier(2, 18000)).toBe("ORO");
    expect(evaluatePersonalTier(12, 10000)).toBe("DIAMANTE");
    expect(evaluatePersonalTier(4, 40000)).toBe("DIAMANTE");
  });

  it("otorga bono de +200 puntos exactamente en la 5ta estancia y no cuenta estancias consecutivas", () => {
    const consecutive = previewPersonalStayCharge({
      currentTier: "ORO",
      currentRolling12mNights: 6,
      currentRolling12mSpendMxn: 20000,
      currentRolling12mStaysCount: 4,
      fifthStayBonusClaimedAt: null,
      existingMassagesInCurrent12mPeriod: 1,
      netEligibleAmountMxn: 4000,
      nightsCount: 2,
      isConsecutiveStay: true,
    });

    expect(consecutive.newRolling12mStaysCount).toBe(4);
    expect(consecutive.qualifiesForFifthStayBonus).toBe(false);
    expect(consecutive.fifthStayBonusPoints).toBe(0);

    const fifth = previewPersonalStayCharge({
      currentTier: "ORO",
      currentRolling12mNights: 8,
      currentRolling12mSpendMxn: 24000,
      currentRolling12mStaysCount: 4,
      fifthStayBonusClaimedAt: null,
      existingMassagesInCurrent12mPeriod: 1,
      netEligibleAmountMxn: 5000,
      nightsCount: 2,
      isConsecutiveStay: false,
    });

    expect(fifth.newRolling12mStaysCount).toBe(5);
    expect(fifth.qualifiesForFifthStayBonus).toBe(true);
    expect(fifth.fifthStayBonusPoints).toBe(200);
    expect(fifth.pointsFromStay).toBe(200);
    expect(fifth.totalPointsToAdd).toBe(400);
  });

  it("respeta el tope anual de 2 masajes en Diamante si el socio ya tuvo o usó su masaje Oro", () => {
    // Subió de Origen a Oro -> 1 masaje
    const origenToOro = computeNewMassageCertificatesCount({
      newTier: "ORO",
      existingMassagesInCurrent12mPeriod: 0,
    });
    expect(origenToOro.toIssueCount).toBe(1);

    // Ya tenía o usó 1 masaje en Oro y sube a Diamante -> solo emite 1 adicional (acompañante)
    const oroToDiamante = computeNewMassageCertificatesCount({
      newTier: "DIAMANTE",
      existingMassagesInCurrent12mPeriod: 1,
    });
    expect(oroToDiamante.toIssueCount).toBe(1);
    expect(oroToDiamante.titles[0]).toContain("Acompañante");

    // Sube directo Origen -> Diamante -> emite 2
    const origenToDiamante = computeNewMassageCertificatesCount({
      newTier: "DIAMANTE",
      existingMassagesInCurrent12mPeriod: 0,
    });
    expect(origenToDiamante.toIssueCount).toBe(2);
  });

  it("valida límites de canje: 100 pts mínimo, 25% hospedaje, 10% evento empresa, 100% catálogo", () => {
    expect(
      validateRedemption({
        profileRole: "SOCIO_PERSONAL",
        purpose: "HOSPEDAJE",
        eligibleBaseAmountMxn: 4000,
        requestedAmountMxn: 80,
        availableBalance: 500,
      }).valid
    ).toBe(false);

    expect(
      validateRedemption({
        profileRole: "SOCIO_PERSONAL",
        purpose: "HOSPEDAJE",
        eligibleBaseAmountMxn: 4000,
        requestedAmountMxn: 1001,
        availableBalance: 2000,
      }).valid
    ).toBe(false);

    expect(
      validateRedemption({
        profileRole: "SOCIO_PERSONAL",
        purpose: "PREMIO_CATALOGO",
        eligibleBaseAmountMxn: 1200,
        requestedAmountMxn: 1200,
        availableBalance: 1200,
      }).valid
    ).toBe(true);

    expect(
      validateRedemption({
        profileRole: "EMPRESA",
        purpose: "EVENTO_EMPRESA",
        eligibleBaseAmountMxn: 50000,
        requestedAmountMxn: 5500,
        availableBalance: 8000,
        isAuthorizedPerson: true,
      }).valid
    ).toBe(false);

    expect(
      validateRedemption({
        profileRole: "EMPRESA",
        purpose: "EVENTO_EMPRESA",
        eligibleBaseAmountMxn: 50000,
        requestedAmountMxn: 5000,
        availableBalance: 8000,
        isAuthorizedPerson: true,
      }).valid
    ).toBe(true);
  });

  it("calcula saldo corporativo del 2% y metas Oro ($250k) / Diamante ($500k)", () => {
    expect(calculateCorporateCashback(320000)).toBe(6400);
    expect(evaluateCorporateTier(249999)).toBe("ORIGEN");
    expect(evaluateCorporateTier(250000)).toBe("ORO");
    expect(evaluateCorporateTier(500000)).toBe("DIAMANTE");

    const preview = previewCorporateCharge({
      currentTier: "ORO",
      currentRolling12mSpendMxn: 320000,
      netEligibleAmountMxn: 180000,
    });
    expect(preview.cashbackToAddMxn).toBe(3600);
    expect(preview.projectedTier).toBe("DIAMANTE");
    expect(preview.tierUpgraded).toBe(true);
  });

  it("calcula beneficios independientes por evento de Agencia (Origen / Oro / Diamante)", () => {
    const eOrigen = calculateAgencyEventBenefits(75000);
    expect(eOrigen.eventTier).toBe("ORIGEN");
    expect(eOrigen.commissionPercentage).toBe(0);
    expect(eOrigen.commissionAmountMxn).toBe(0);
    expect(eOrigen.pointsGenerated).toBe(750);
    expect(eOrigen.giftNights).toBe(0);

    const eOro = calculateAgencyEventBenefits(150000);
    expect(eOro.eventTier).toBe("ORO");
    expect(eOro.commissionPercentage).toBe(5);
    expect(eOro.commissionAmountMxn).toBe(7500);
    expect(eOro.pointsGenerated).toBe(3000);
    expect(eOro.giftNights).toBe(1);
    expect(eOro.giftMassages).toBe(0);

    const eDiamante = calculateAgencyEventBenefits(250000);
    expect(eDiamante.eventTier).toBe("DIAMANTE");
    expect(eDiamante.commissionPercentage).toBe(8);
    expect(eDiamante.commissionAmountMxn).toBe(20000);
    expect(eDiamante.pointsGenerated).toBe(5000);
    expect(eDiamante.giftNights).toBe(2);
    expect(eDiamante.giftMassages).toBe(1);
  });

  it("formatea números de socio secuenciales como 000 248", () => {
    expect(formatMembershipNumber(248)).toBe("000 248");
    expect(formatMembershipNumber(1024)).toBe("001 024");
  });

  it("calcula puntos por nivel correctamente", () => {
    expect(calculatePersonalPointsEarned(1000, "ORIGEN")).toBe(30);
    expect(calculatePersonalPointsEarned(1000, "ORO")).toBe(40);
    expect(calculatePersonalPointsEarned(1000, "DIAMANTE")).toBe(50);
  });

  it("respeta fronteras exactas de nivel en eventos de Agencia ($99,999.99 / $100,000 / $249,999.99 / $250,000)", () => {
    expect(calculateAgencyEventBenefits(99999.99).eventTier).toBe("ORIGEN");
    expect(calculateAgencyEventBenefits(100000).eventTier).toBe("ORO");
    expect(calculateAgencyEventBenefits(249999.99).eventTier).toBe("ORO");
    expect(calculateAgencyEventBenefits(250000).eventTier).toBe("DIAMANTE");
  });

  it("no vuelve a otorgar el bono de 5ta estancia dentro del mismo periodo de 12 meses", () => {
    const recentBonusDate = new Date();
    recentBonusDate.setMonth(recentBonusDate.getMonth() - 3);

    const preview = previewPersonalStayCharge({
      currentTier: "ORO",
      currentRolling12mNights: 8,
      currentRolling12mSpendMxn: 26000,
      currentRolling12mStaysCount: 4,
      fifthStayBonusClaimedAt: recentBonusDate,
      existingMassagesInCurrent12mPeriod: 1,
      netEligibleAmountMxn: 5000,
      nightsCount: 2,
      isConsecutiveStay: false,
    });

    expect(preview.qualifiesForFifthStayBonus).toBe(false);
    expect(preview.fifthStayBonusPoints).toBe(0);
    expect(preview.totalPointsToAdd).toBe(200);
  });
});

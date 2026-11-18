import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CANONICAL_PROPERTIES } from "../src/lib/properties-data";

try {
  process.loadEnvFile?.(".env");
} catch {
  // Variables ya provistas por el entorno
}

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando datos oficiales de Círculo Orgánico...");

  // 1. Limpieza ordenada para seed idempotente
  await prisma.quoteRequest.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.rewardCertificate.deleteMany();
  await prisma.agencyEvent.deleteMany();
  await prisma.transactionLedger.deleteMany();
  await prisma.authorizedPerson.deleteMany();
  await prisma.b2BProfile.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hotelProperty.deleteMany();

  // 2. Las 6 Propiedades Oficiales
  const propertyMap: Record<string, string> = {};
  for (const prop of CANONICAL_PROPERTIES) {
    const created = await prisma.hotelProperty.create({
      data: {
        slug: prop.slug,
        name: prop.name,
        tagline: prop.tagline,
        location: prop.location,
        description: prop.description,
        baseNightPriceMxn: prop.baseNightPriceMxn,
        hasSpaCenter: prop.hasSpaCenter,
        imageUrl: prop.imageUrl,
      },
    });
    propertyMap[prop.slug] = created.id;
  }

  const demoPasswordHash = await bcrypt.hash("Organico2026!", 10);
  const adminPasswordHash = await bcrypt.hash("AdminOrganico2026!", 10);

  // 3. Usuario Administrador (ADMIN_STAFF)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@grupoorganico.com",
      passwordHash: adminPasswordHash,
      firstName: "Sofía",
      lastName: "Valverde",
      phone: "+52 55 4100 9000",
      role: "ADMIN_STAFF",
      acceptMarketing: false,
    },
  });

  // 4. Socia Personal Demo: Ana López (SOCIO 000 248, Nivel Oro)
  const anaUser = await prisma.user.create({
    data: {
      email: "ana@ejemplo.com",
      passwordHash: demoPasswordHash,
      firstName: "Ana",
      lastName: "López",
      phone: "+52 55 2480 1122",
      role: "SOCIO_PERSONAL",
      acceptMarketing: true,
    },
  });

  const anaMembership = await prisma.membership.create({
    data: {
      userId: anaUser.id,
      membershipNumber: "000 248",
      qrToken: "11111111-2480-4000-8000-000000000248",
      tier: "ORO",
      status: "ACTIVA",
      pointsBalance: 840,
      cashBalanceMxn: 0,
      rolling12mSpendMxn: 26000,
      rolling12mNights: 8,
      rolling12mStaysCount: 4, // La siguiente estancia registrada en /admin activa el bono de 5ta estancia (+200 pts)
      fifthStayBonusClaimedAt: null,
      discountPercentage: 20,
    },
  });

  const now = new Date();
  const pointsExpiry24m = new Date(now);
  pointsExpiry24m.setMonth(pointsExpiry24m.getMonth() + 24);

  // Movimientos históricos de Ana que cuadran exactamente con 8 noches, $26,000 y 840 puntos disponibles
  await prisma.transactionLedger.createMany({
    data: [
      {
        membershipId: anaMembership.id,
        propertyId: propertyMap["ajusco"],
        type: "ESTANCIA_HOSPEDAJE",
        description: "Estancia 2 noches en Orgánico Ajusco (Nivel Origen)",
        grossAmountMxn: 7058.82,
        netEligibleAmountMxn: 6000,
        nightsCount: 2,
        pointsDelta: 180,
        checkInDate: new Date("2026-03-14T15:00:00.000Z"),
        checkOutDate: new Date("2026-03-16T12:00:00.000Z"),
        expiresAt: new Date("2028-03-16T23:59:59.000Z"),
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-03-16T12:00:00.000Z"),
      },
      {
        membershipId: anaMembership.id,
        propertyId: propertyMap["tepoztlan"],
        type: "ESTANCIA_HOSPEDAJE",
        description: "Estancia 2 noches en Orgánico Tepoztlán (Nivel Origen)",
        grossAmountMxn: 7058.82,
        netEligibleAmountMxn: 6000,
        nightsCount: 2,
        pointsDelta: 180,
        checkInDate: new Date("2026-05-08T15:00:00.000Z"),
        checkOutDate: new Date("2026-05-10T12:00:00.000Z"),
        expiresAt: new Date("2028-05-10T23:59:59.000Z"),
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-05-10T12:00:00.000Z"),
      },
      {
        membershipId: anaMembership.id,
        propertyId: propertyMap["roma-norte"],
        type: "ESTANCIA_HOSPEDAJE",
        description: "Estancia 2 noches en Roma Norte (Ascenso a Nivel Oro)",
        grossAmountMxn: 7500,
        netEligibleAmountMxn: 6000,
        nightsCount: 2,
        pointsDelta: 180,
        checkInDate: new Date("2026-07-18T15:00:00.000Z"),
        checkOutDate: new Date("2026-07-20T12:00:00.000Z"),
        expiresAt: new Date("2028-07-20T23:59:59.000Z"),
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-07-20T12:00:00.000Z"),
      },
      {
        membershipId: anaMembership.id,
        propertyId: propertyMap["valle"],
        type: "ESTANCIA_HOSPEDAJE",
        description: "Estancia 2 noches en Orgánico Valle (Nivel Oro · 4 pts/$100)",
        grossAmountMxn: 10000,
        netEligibleAmountMxn: 8000,
        nightsCount: 2,
        pointsDelta: 300,
        checkInDate: new Date("2026-09-25T13:00:00.000Z"),
        checkOutDate: new Date("2026-09-27T14:00:00.000Z"),
        expiresAt: pointsExpiry24m,
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-09-27T14:00:00.000Z"),
      },
    ],
  });

  // Certificado de masaje de 60 min disponible con vencimiento el 15 de noviembre de 2027
  await prisma.rewardCertificate.create({
    data: {
      membershipId: anaMembership.id,
      type: "MASAJE_60_MIN",
      title: "Masaje relajante de 60 min — Titular (Nivel Oro)",
      beneficiaryName: "Ana López",
      status: "DISPONIBLE",
      periodStart: new Date("2026-07-20T00:00:00.000Z"),
      expiresAt: new Date("2027-11-15T23:59:59.000Z"),
    },
  });

  // Reserva confirmada de Ana en Orgánico Valle (4-6 diciembre, 2 adultos)
  await prisma.reservation.create({
    data: {
      membershipId: anaMembership.id,
      propertyId: propertyMap["valle"],
      checkIn: new Date("2026-12-04T15:00:00.000Z"),
      checkOut: new Date("2026-12-06T12:00:00.000Z"),
      nights: 2,
      adults: 2,
      baseAmountMxn: 10000,
      discountAppliedMxn: 2000,
      pointsOrCashUsedMxn: 0,
      finalPriceMxn: 8000,
      selectedCourtesy1: "Una botella para brindar",
      earlyCheckInRequested: true,
      lateCheckOutRequested: true,
      status: "CONFIRMADA",
    },
  });

  // 5. Empresa Demo: Empresa Demo S.A. de C.V. (Nivel Empresas Oro)
  const empresaUser = await prisma.user.create({
    data: {
      email: "empresa@ejemplo.com",
      passwordHash: demoPasswordHash,
      firstName: "Laura",
      lastName: "Méndez",
      phone: "+52 55 5200 3310",
      role: "EMPRESA",
      acceptMarketing: true,
    },
  });

  const empresaMembership = await prisma.membership.create({
    data: {
      userId: empresaUser.id,
      membershipNumber: "000 310",
      qrToken: "22222222-3100-4000-8000-000000000310",
      tier: "ORO",
      status: "ACTIVA",
      pointsBalance: 0,
      cashBalanceMxn: 4000,
      rolling12mSpendMxn: 320000,
      rolling12mNights: 42,
      rolling12mStaysCount: 11,
      assignedAdvisorName: "Mariana Torres · Atención Corporativa",
      discountPercentage: 20,
    },
  });

  const empresaB2B = await prisma.b2BProfile.create({
    data: {
      membershipId: empresaMembership.id,
      profileType: "EMPRESA",
      legalName: "Empresa Demo S.A. de C.V.",
      rfc: "EDM210418AB9",
      businessActivity: "Consultoría Estratégica y Tecnología",
      responsibleName: "Laura Méndez",
      responsibleRole: "Directora de Talento y Cultura",
      workEmail: "empresa@ejemplo.com",
      contactPhone: "+52 55 5200 3310",
      fiscalAddress: "Av. Paseo de la Reforma 342, Piso 14, Col. Juárez, Cuauhtémoc, 06600 CDMX",
      needsLodging: true,
      needsOtamEvents: true,
      needsAmanecerMerch: true,
      agreementApprovedAt: new Date("2026-01-15T10:00:00.000Z"),
      agreedTariffNotes: "Convenio Empresas Oro vigente · Tarifa preferente 20% y 2% en saldo.",
    },
  });

  await prisma.authorizedPerson.createMany({
    data: [
      {
        b2bProfileId: empresaB2B.id,
        fullName: "Laura Méndez",
        email: "empresa@ejemplo.com",
        phone: "+52 55 5200 3310",
        roleInAccount: "AUTORIZA_PREMIOS_Y_SALDO",
        isActive: true,
      },
      {
        b2bProfileId: empresaB2B.id,
        fullName: "Carlos Ruiz",
        email: "cruiz@empresademo.mx",
        phone: "+52 55 5200 3318",
        roleInAccount: "RESERVA_Y_ADMINISTRA",
        isActive: true,
      },
      {
        b2bProfileId: empresaB2B.id,
        fullName: "Valeria Ortega",
        email: "vortega@empresademo.mx",
        phone: "+52 55 5200 3325",
        roleInAccount: "AUTORIZA_PREMIOS_Y_SALDO",
        isActive: true,
      },
    ],
  });

  await prisma.transactionLedger.createMany({
    data: [
      {
        membershipId: empresaMembership.id,
        propertyId: propertyMap["quinta-soledad"],
        type: "COMPRA_EMPRESA",
        description: "Convención anual directiva en Quinta Soledad (2% saldo)",
        grossAmountMxn: 220000,
        netEligibleAmountMxn: 220000,
        nightsCount: 24,
        cashDeltaMxn: 4400,
        expiresAt: pointsExpiry24m,
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-04-22T18:00:00.000Z"),
      },
      {
        membershipId: empresaMembership.id,
        propertyId: propertyMap["ajusco"],
        type: "COMPRA_EMPRESA",
        description: "Retiro estratégico + taller OTAM en Orgánico Ajusco (2% saldo)",
        grossAmountMxn: 100000,
        netEligibleAmountMxn: 100000,
        nightsCount: 18,
        cashDeltaMxn: 2000,
        expiresAt: pointsExpiry24m,
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-08-15T18:00:00.000Z"),
      },
      {
        membershipId: empresaMembership.id,
        propertyId: propertyMap["roma-norte"],
        type: "CANJE_SALDO",
        description: "Aplicación de saldo corporativo en hospedaje ejecutivo Roma Norte",
        grossAmountMxn: 12000,
        netEligibleAmountMxn: 9600,
        nightsCount: 0,
        cashDeltaMxn: -2400,
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-09-30T11:00:00.000Z"),
      },
    ],
  });

  // 3 reservas de Empresa Demo: Orgánico Valle (Por confirmar), Orgánico Ajusco (Confirmada), Quinta Soledad (Terminada)
  await prisma.reservation.createMany({
    data: [
      {
        membershipId: empresaMembership.id,
        propertyId: propertyMap["valle"],
        checkIn: new Date("2026-12-10T15:00:00.000Z"),
        checkOut: new Date("2026-12-12T12:00:00.000Z"),
        nights: 2,
        adults: 6,
        baseAmountMxn: 30000,
        discountAppliedMxn: 6000,
        pointsOrCashUsedMxn: 0,
        finalPriceMxn: 24000,
        requestedByPerson: "Carlos Ruiz",
        status: "POR_CONFIRMAR",
      },
      {
        membershipId: empresaMembership.id,
        propertyId: propertyMap["ajusco"],
        checkIn: new Date("2026-11-28T15:00:00.000Z"),
        checkOut: new Date("2026-11-30T12:00:00.000Z"),
        nights: 2,
        adults: 4,
        baseAmountMxn: 19200,
        discountAppliedMxn: 3840,
        pointsOrCashUsedMxn: 0,
        finalPriceMxn: 15360,
        requestedByPerson: "Laura Méndez",
        status: "CONFIRMADA",
      },
      {
        membershipId: empresaMembership.id,
        propertyId: propertyMap["quinta-soledad"],
        checkIn: new Date("2026-04-20T15:00:00.000Z"),
        checkOut: new Date("2026-04-22T12:00:00.000Z"),
        nights: 2,
        adults: 24,
        baseAmountMxn: 220000,
        discountAppliedMxn: 0,
        pointsOrCashUsedMxn: 0,
        finalPriceMxn: 220000,
        requestedByPerson: "Valeria Ortega",
        status: "TERMINADA",
      },
    ],
  });

  // 6. Agencia Demo (agencia@ejemplo.com)
  const agenciaUser = await prisma.user.create({
    data: {
      email: "agencia@ejemplo.com",
      passwordHash: demoPasswordHash,
      firstName: "Ricardo",
      lastName: "Solís",
      phone: "+52 55 8840 7700",
      role: "AGENCIA",
      acceptMarketing: true,
    },
  });

  const agenciaMembership = await prisma.membership.create({
    data: {
      userId: agenciaUser.id,
      membershipNumber: "000 415",
      qrToken: "33333333-4150-4000-8000-000000000415",
      tier: "DIAMANTE",
      status: "ACTIVA",
      pointsBalance: 8000,
      cashBalanceMxn: 0,
      rolling12mSpendMxn: 400000,
      rolling12mNights: 0,
      rolling12mStaysCount: 2,
      assignedAdvisorName: "Diego Herrera · Alianzas Agencias",
      discountPercentage: 15,
    },
  });

  const agenciaB2B = await prisma.b2BProfile.create({
    data: {
      membershipId: agenciaMembership.id,
      profileType: "AGENCIA",
      legalName: "Agencia Demo Experiencias & Eventos S.A. de C.V.",
      rfc: "ADE190812K41",
      businessActivity: "Agencia de Eventos Corporativos y Destination Management",
      responsibleName: "Ricardo Solís",
      responsibleRole: "Director de Producción y Alianzas",
      workEmail: "agencia@ejemplo.com",
      contactPhone: "+52 55 8840 7700",
      fiscalAddress: "Calle Colima 161, Col. Roma Norte, Cuauhtémoc, 06700 CDMX",
      needsLodging: true,
      needsOtamEvents: true,
      needsAmanecerMerch: true,
      agreementApprovedAt: new Date("2026-01-10T10:00:00.000Z"),
      agreedTariffNotes: "Convenio Agencia activo · Evaluación independiente por evento.",
    },
  });

  await prisma.authorizedPerson.create({
    data: {
      b2bProfileId: agenciaB2B.id,
      fullName: "Ricardo Solís",
      email: "agencia@ejemplo.com",
      phone: "+52 55 8840 7700",
      roleInAccount: "AUTORIZA_PREMIOS_Y_SALDO",
      isActive: true,
    },
  });

  const eventE204 = await prisma.agencyEvent.create({
    data: {
      code: "E204",
      membershipId: agenciaMembership.id,
      clientName: "Grupo Financiero Solaris",
      propertyId: propertyMap["quinta-soledad"],
      eventDate: new Date("2026-09-18T12:00:00.000Z"),
      netAmountMxn: 250000,
      eventTier: "DIAMANTE",
      status: "REALIZADO_Y_PAGADO",
      commissionPercentage: 8,
      commissionAmountMxn: 20000,
      commissionStatus: "AUTORIZADA",
      pointsGenerated: 5000,
      pointsReleased: true,
      rewardSummary: "2 noches para dos + 1 masaje individual",
    },
  });

  const eventE203 = await prisma.agencyEvent.create({
    data: {
      code: "E203",
      membershipId: agenciaMembership.id,
      clientName: "Laboratorios Veranda México",
      propertyId: propertyMap["ajusco"],
      eventDate: new Date("2026-06-12T12:00:00.000Z"),
      netAmountMxn: 150000,
      eventTier: "ORO",
      status: "REALIZADO_Y_PAGADO",
      commissionPercentage: 5,
      commissionAmountMxn: 7500,
      commissionStatus: "PAGADA",
      pointsGenerated: 3000,
      pointsReleased: true,
      rewardSummary: "1 noche para dos",
    },
  });

  await prisma.agencyEvent.create({
    data: {
      code: "E205",
      membershipId: agenciaMembership.id,
      clientName: "Estudio Nómada Arquitectura",
      propertyId: propertyMap["valle"],
      eventDate: new Date("2027-01-22T12:00:00.000Z"),
      netAmountMxn: 75000,
      eventTier: "ORIGEN",
      status: "PROXIMO_EVENTO",
      commissionPercentage: 0,
      commissionAmountMxn: 0,
      commissionStatus: "SIN_COMISION",
      pointsGenerated: 750,
      pointsReleased: false,
      rewardSummary: "Sin noches de regalo",
    },
  });

  await prisma.transactionLedger.createMany({
    data: [
      {
        membershipId: agenciaMembership.id,
        propertyId: propertyMap["ajusco"],
        type: "EVENTO_AGENCIA",
        description: "Liquidación evento E203 · Orgánico Ajusco (Nivel Oro · 2% pts)",
        grossAmountMxn: 150000,
        netEligibleAmountMxn: 150000,
        pointsDelta: 3000,
        expiresAt: new Date("2028-06-12T23:59:59.000Z"),
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-06-15T12:00:00.000Z"),
      },
      {
        membershipId: agenciaMembership.id,
        propertyId: propertyMap["quinta-soledad"],
        type: "EVENTO_AGENCIA",
        description: "Liquidación evento E204 · Quinta Soledad (Nivel Diamante · 2% pts)",
        grossAmountMxn: 250000,
        netEligibleAmountMxn: 250000,
        pointsDelta: 5000,
        expiresAt: new Date("2028-09-18T23:59:59.000Z"),
        createdByAdminId: adminUser.id,
        createdAt: new Date("2026-09-20T12:00:00.000Z"),
      },
    ],
  });

  // Certificados liberados por eventos de Agencia Demo
  await prisma.rewardCertificate.createMany({
    data: [
      {
        membershipId: agenciaMembership.id,
        agencyEventId: eventE204.id,
        type: "NOCHES_REGALO_2",
        title: "Certificado 2 noches seguidas para 2 adultos (Evento E204)",
        beneficiaryName: "Por designar",
        status: "DISPONIBLE",
        preferredPropertyId: propertyMap["quinta-soledad"],
        periodStart: new Date("2026-09-18T00:00:00.000Z"),
        expiresAt: new Date("2027-09-18T23:59:59.000Z"),
      },
      {
        membershipId: agenciaMembership.id,
        agencyEventId: eventE204.id,
        type: "MASAJE_60_MIN",
        title: "Masaje relajante de 60 min · 1 persona (Evento E204)",
        beneficiaryName: "Ricardo Solís",
        status: "DISPONIBLE",
        preferredPropertyId: propertyMap["quinta-soledad"],
        periodStart: new Date("2026-09-18T00:00:00.000Z"),
        expiresAt: new Date("2027-09-18T23:59:59.000Z"),
      },
      {
        membershipId: agenciaMembership.id,
        agencyEventId: eventE203.id,
        type: "NOCHE_REGALO_1",
        title: "Certificado 1 noche de regalo para 2 adultos (Evento E203)",
        beneficiaryName: "Fernanda Cruz (Cliente VIP)",
        status: "DISPONIBLE",
        preferredPropertyId: propertyMap["ajusco"],
        periodStart: new Date("2026-06-12T00:00:00.000Z"),
        expiresAt: new Date("2027-06-12T23:59:59.000Z"),
      },
    ],
  });

  // 7. Datos operativos adicionales para probar bandejas en /admin (sin alterar los datos exactos de los 3 demos principales)
  const pendingEmpresaUser = await prisma.user.create({
    data: {
      email: "convenio@estudiosierra.mx",
      passwordHash: demoPasswordHash,
      firstName: "Mateo",
      lastName: "Aguilar",
      phone: "+52 55 4421 0808",
      role: "EMPRESA",
      acceptMarketing: true,
    },
  });

  const pendingEmpresaMembership = await prisma.membership.create({
    data: {
      userId: pendingEmpresaUser.id,
      membershipNumber: "000 416",
      qrToken: "44444444-4160-4000-8000-000000000416",
      tier: "ORIGEN",
      status: "PENDIENTE_CONVENIO",
      pointsBalance: 0,
      cashBalanceMxn: 0,
      discountPercentage: 15,
    },
  });

  const pendingB2B = await prisma.b2BProfile.create({
    data: {
      membershipId: pendingEmpresaMembership.id,
      profileType: "EMPRESA",
      legalName: "Estudio Sierra Arquitectura S.C.",
      rfc: "ESA230210L90",
      businessActivity: "Arquitectura y Diseño Sustentable",
      responsibleName: "Mateo Aguilar",
      responsibleRole: "Socio Director",
      workEmail: "convenio@estudiosierra.mx",
      contactPhone: "+52 55 4421 0808",
      fiscalAddress: "Calle Durango 205, Col. Roma Norte, CDMX",
      needsLodging: true,
      needsOtamEvents: true,
      needsAmanecerMerch: false,
    },
  });

  await prisma.authorizedPerson.create({
    data: {
      b2bProfileId: pendingB2B.id,
      fullName: "Mateo Aguilar",
      email: "convenio@estudiosierra.mx",
      phone: "+52 55 4421 0808",
      roleInAccount: "AUTORIZA_PREMIOS_Y_SALDO",
    },
  });

  // Socio personal adicional con cita de masaje solicitada para probar gestor de citas en /admin
  const socioCitaUser = await prisma.user.create({
    data: {
      email: "diego.socio@ejemplo.com",
      passwordHash: demoPasswordHash,
      firstName: "Diego",
      lastName: "Santana",
      phone: "+52 55 3910 2201",
      role: "SOCIO_PERSONAL",
      acceptMarketing: true,
    },
  });

  const socioCitaMembership = await prisma.membership.create({
    data: {
      userId: socioCitaUser.id,
      membershipNumber: "000 417",
      qrToken: "55555555-4170-4000-8000-000000000417",
      tier: "DIAMANTE",
      status: "ACTIVA",
      pointsBalance: 2150,
      rolling12mSpendMxn: 46500,
      rolling12mNights: 14,
      rolling12mStaysCount: 6,
      fifthStayBonusClaimedAt: new Date("2026-08-10T12:00:00.000Z"),
      assignedAdvisorName: "Mariana Torres · Asesora Diamante",
      discountPercentage: 30,
    },
  });

  await prisma.rewardCertificate.create({
    data: {
      membershipId: socioCitaMembership.id,
      type: "MASAJE_60_MIN",
      title: "Masaje relajante de 60 min — Titular (Nivel Diamante)",
      beneficiaryName: "Diego Santana",
      status: "CITA_SOLICITADA",
      preferredPropertyId: propertyMap["tepoztlan"],
      preferredDate: new Date("2026-12-08T16:00:00.000Z"),
      preferredTimeSlot: "16:00 hrs",
      periodStart: new Date("2026-06-01T00:00:00.000Z"),
      expiresAt: new Date("2027-06-01T23:59:59.000Z"),
    },
  });

  await prisma.quoteRequest.create({
    data: {
      membershipId: empresaMembership.id,
      category: "OTAM_CORPORATIVO",
      requesterType: "EMPRESA",
      propertyId: propertyMap["ajusco"],
      experienceOrItems: [
        { name: "Jornada de reforestación", quantity: 40 },
        { name: "Competencia de cocina", quantity: 40 },
      ],
      participantsCount: 40,
      preferredDate: "2027-02-14",
      payWithPointsOrBalance: true,
      contactName: "Laura Méndez",
      contactEmail: "empresa@ejemplo.com",
      contactPhone: "+52 55 5200 3310",
      status: "NUEVA",
      notes: "Deseamos aplicar hasta 10% del saldo corporativo disponible para evento.",
    },
  });

  console.log("Seed completado con éxito:");
  console.log("  - 6 hoteles oficiales creados");
  console.log("  - Ana López (ana@ejemplo.com / Organico2026!) · SOCIO 000 248");
  console.log("  - Empresa Demo (empresa@ejemplo.com / Organico2026!) · SOCIO 000 310");
  console.log("  - Agencia Demo (agencia@ejemplo.com / Organico2026!) · SOCIO 000 415");
  console.log("  - Admin Staff (admin@grupoorganico.com / AdminOrganico2026!)");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

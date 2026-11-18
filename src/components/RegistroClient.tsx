"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Download,
  FileSpreadsheet,
  Plus,
  Printer,
  Trash2,
  UserCheck,
} from "lucide-react";
import { MemberCard } from "@/components/MemberCard";
import { registerB2BAction, registerPersonalAction } from "@/app/actions/auth-actions";
import { inputBaseClass, labelBaseClass, SectionEyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type TabType = "personal" | "empresa" | "agencia";

interface AuthorizedRow {
  fullName: string;
  email: string;
  phone: string;
  roleInAccount: "RESERVA_Y_ADMINISTRA" | "AUTORIZA_PREMIOS_Y_SALDO";
}

export function RegistroClient({ initialTab = "personal" }: { initialTab?: TabType }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>(initialTab);
  const [b2bStep, setB2bStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Tab Para mí
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptRules, setAcceptRules] = useState(true);
  const [acceptMarketing, setAcceptMarketing] = useState(true);

  // Tab Mi empresa / Mi agencia
  const [legalName, setLegalName] = useState("");
  const [rfc, setRfc] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleRole, setResponsibleRole] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [b2bPassword, setB2bPassword] = useState("");
  const [needsLodging, setNeedsLodging] = useState(true);
  const [needsOtamEvents, setNeedsOtamEvents] = useState(true);
  const [needsAmanecerMerch, setNeedsAmanecerMerch] = useState(false);
  const [acceptB2BRules, setAcceptB2BRules] = useState(true);
  const [authorizedPeople, setAuthorizedPeople] = useState<AuthorizedRow[]>([
    {
      fullName: "",
      email: "",
      phone: "",
      roleInAccount: "AUTORIZA_PREMIOS_Y_SALDO",
    },
  ]);

  const previewName = useMemo(() => {
    if (tab === "personal") {
      const full = `${firstName} ${lastName}`.trim();
      return full || "Tu Nombre Aquí";
    }
    return legalName.trim() || responsibleName.trim() || (tab === "empresa" ? "Tu Empresa S.A." : "Tu Agencia");
  }, [tab, firstName, lastName, legalName, responsibleName]);

  const previewAccountLabel =
    tab === "personal"
      ? "Socio Personal · 15% dto."
      : tab === "empresa"
        ? "Cuenta Empresa · 2% saldo"
        : "Cuenta Agencia · Eventos";

  const handleTabChange = (nextTab: TabType) => {
    setTab(nextTab);
    setB2bStep(1);
    setError(null);
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await registerPersonalAction({
        firstName,
        lastName,
        email,
        phone,
        password,
        acceptRules,
        acceptMarketing,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      const loginRes = await signIn("credentials", {
        email: res.email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/entrar");
        return;
      }

      router.push(res.redirectTo);
      router.refresh();
    });
  };

  const handleNextB2BStep = () => {
    setError(null);
    if (!legalName.trim() || !rfc.trim() || !responsibleName.trim() || !workEmail.trim() || !fiscalAddress.trim() || b2bPassword.length < 6) {
      setError("Completa todos los campos obligatorios del negocio y una contraseña de al menos 6 caracteres.");
      return;
    }

    // Pre-llena la primera persona autorizada con el responsable si está vacía
    setAuthorizedPeople((prev) => {
      if (prev.length === 1 && !prev[0].fullName) {
        return [
          {
            fullName: responsibleName,
            email: workEmail,
            phone: contactPhone,
            roleInAccount: "AUTORIZA_PREMIOS_Y_SALDO",
          },
        ];
      }
      return prev;
    });
    setB2bStep(2);
  };

  const addAuthorizedRow = () => {
    setAuthorizedPeople((prev) => [
      ...prev,
      {
        fullName: "",
        email: "",
        phone: "",
        roleInAccount: "RESERVA_Y_ADMINISTRA",
      },
    ]);
  };

  const removeAuthorizedRow = (idx: number) => {
    setAuthorizedPeople((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAuthorizedRow = (idx: number, patch: Partial<AuthorizedRow>) => {
    setAuthorizedPeople((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  };

  const handleDownloadCsvFormat = () => {
    const interests = [
      needsLodging ? "Hospedaje" : "",
      needsOtamEvents ? "Eventos OTAM" : "",
      needsAmanecerMerch ? "Artículos Amanecer" : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const rows = [
      ["CÍRCULO ORGÁNICO - SOLICITUD DE CONVENIO B2B"],
      ["Tipo de Cuenta", tab === "empresa" ? "Empresa" : "Agencia / Organizador"],
      ["Razón Social / Nombre", legalName],
      ["RFC", rfc.toUpperCase()],
      ["Actividad / Tipo", businessActivity],
      ["Persona Responsable", responsibleName],
      ["Cargo", responsibleRole],
      ["Correo de Trabajo", workEmail],
      ["Teléfono", contactPhone],
      ["Domicilio Fiscal", fiscalAddress],
      ["Intereses", interests],
      [],
      ["PERSONAS AUTORIZADAS", "CORREO", "TELÉFONO", "FACULTAD"],
      ...authorizedPeople.map((p) => [
        p.fullName,
        p.email,
        p.phone,
        p.roleInAccount === "AUTORIZA_PREMIOS_Y_SALDO"
          ? "Autoriza premios y saldo"
          : "Reserva y administra",
      ]),
    ];

    const csvContent =
      "\uFEFF" +
      rows
        .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `formato-convenio-${tab}-${rfc.toUpperCase() || "circulo-organico"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPrintablePdf = () => {
    window.print();
  };

  const handleB2BSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await registerB2BAction({
        profileType: tab === "empresa" ? "EMPRESA" : "AGENCIA",
        legalName,
        rfc,
        businessActivity,
        responsibleName,
        responsibleRole,
        workEmail,
        contactPhone,
        fiscalAddress,
        needsLodging,
        needsOtamEvents,
        needsAmanecerMerch,
        password: b2bPassword,
        acceptRules: acceptB2BRules,
        authorizedPeople,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      const loginRes = await signIn("credentials", {
        email: res.email,
        password: b2bPassword,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/entrar");
        return;
      }

      router.push(res.redirectTo);
      router.refresh();
    });
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-[#FAF8F5]">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-12">
        {/* Columna izquierda: Fotografía editorial + Vista previa en tiempo real de Tarjeta Origen */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#1B3B2B] px-6 py-12 text-white lg:col-span-5 lg:min-h-[760px] lg:px-10">
          <img
            src="https://www.gohb.com.mx/assets/images/ajusco1.jpg"
            alt="Grupo Orgánico Hoteles Boutique"
            className="animate-ken-burns pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1B3B2B]/85 via-[#1B3B2B]/75 to-[#11251B]/95" />

          <div className="animate-hero-1 relative z-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8B289]">
              Membresía digital instantánea
            </span>
            <h1 className="mt-3 font-editorial text-3xl font-medium leading-tight text-white sm:text-4xl">
              Tu tarjeta Círculo Orgánico en tiempo real
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Conforme completas tus datos, preparamos tu credencial Nivel Origen lista para
              presentar en nuestras seis propiedades.
            </p>
          </div>

          <div className="animate-hero-2 relative z-10 my-8">
            <div className="animate-float-slow">
              <MemberCard
                holderName={previewName}
                membershipNumber="000 418"
                tier="ORIGEN"
                qrValue={`circulo-organico://preview/${encodeURIComponent(previewName)}`}
                accountTypeLabel={previewAccountLabel}
              />
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/8 p-4 text-xs text-white/85 backdrop-blur-xs">
            <p className="font-semibold text-[#C8B289]">
              {tab === "personal"
                ? "Beneficios inmediatos en Nivel Origen"
                : tab === "empresa"
                  ? "Convenio Empresarial Círculo Orgánico"
                  : "Programa para Agencias y Organizadores"}
            </p>
            <p className="mt-1 leading-relaxed text-white/75">
              {tab === "personal"
                ? "15% de descuento directo en hospedaje, 3 puntos por cada $100 MXN netos y bono automático de +200 puntos en tu 5ta estancia anual."
                : tab === "empresa"
                  ? "Acumula 2% en saldo a favor en todas tus compras netas elegibles y gestiona qué colaboradores pueden reservar o autorizar uso de saldo."
                  : "Cada evento realizado y pagado se evalúa de forma independiente: hasta 8% de comisión en efectivo, 2% en puntos y noches de regalo."}
            </p>
          </div>
        </div>

        {/* Columna derecha: Selector de perfil y formularios */}
        <div className="px-4 py-10 sm:px-8 lg:col-span-7 lg:px-12 lg:py-12">
          <SectionEyebrow>Registro multi-perfil</SectionEyebrow>
          <h2 className="mt-1.5 font-editorial text-3xl font-medium text-[#1B3B2B]">
            Crea tu cuenta en Círculo Orgánico
          </h2>

          {/* 3 Pestañas de Perfil */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-[#DFD6C7] bg-[#F2EFE9] p-1.5">
            <button
              type="button"
              onClick={() => handleTabChange("personal")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
                tab === "personal"
                  ? "bg-[#1B3B2B] text-white shadow-xs"
                  : "text-[#4C524E] hover:text-[#1B3B2B]"
              )}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Para mí
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("empresa")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
                tab === "empresa"
                  ? "bg-[#1B3B2B] text-white shadow-xs"
                  : "text-[#4C524E] hover:text-[#1B3B2B]"
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              Mi empresa
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("agencia")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
                tab === "agencia"
                  ? "bg-[#1B3B2B] text-white shadow-xs"
                  : "text-[#4C524E] hover:text-[#1B3B2B]"
              )}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Mi agencia
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-[#F2C3C3] bg-[#FCECEC] px-4 py-3 text-xs font-medium text-[#9B2C2C]">
              {error}
            </div>
          )}

          {/* TAB 1: PARA MÍ */}
          {tab === "personal" ? (
            <form onSubmit={handlePersonalSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelBaseClass}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Sofía"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Apellidos</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Ramírez Vega"
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelBaseClass}>Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className={labelBaseClass}>Celular</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className={inputBaseClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelBaseClass}>Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={inputBaseClass}
                />
              </div>

              <div className="space-y-2.5 pt-1 text-xs text-[#4C524E]">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={acceptRules}
                    onChange={(e) => setAcceptRules(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#1B3B2B]"
                  />
                  <span>
                    Acepto las reglas del programa Círculo Orgánico (1 punto = $1 MXN, vigencia 24
                    meses, cálculo sobre neto elegible).
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={acceptMarketing}
                    onChange={(e) => setAcceptMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#1B3B2B]"
                  />
                  <span>
                    Quiero recibir invitaciones exclusivas, experiencias OTAM y promociones de las
                    6 sedes.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#132A1E] disabled:opacity-60"
              >
                {isPending ? "Creando tu membresía..." : "Activar mi membresía gratis"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* TAB 2 & 3: MI EMPRESA / MI AGENCIA (Flujo guiado en 2 pasos) */
            <form onSubmit={handleB2BSubmit} className="mt-6">
              {/* Indicador de pasos */}
              <div className="mb-6 flex items-center gap-3 text-xs">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-1.5 font-semibold",
                    b2bStep === 1
                      ? "bg-[#1B3B2B] text-white"
                      : "bg-[#E6F2EB] text-[#1B3B2B]"
                  )}
                >
                  <span>Paso 1</span>
                  <span>Datos del negocio</span>
                </div>
                <div className="h-px flex-1 bg-[#DCD4C6]" />
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-1.5 font-semibold",
                    b2bStep === 2
                      ? "bg-[#1B3B2B] text-white"
                      : "bg-[#F2EFE9] text-[#5E645F]"
                  )}
                >
                  <span>Paso 2</span>
                  <span>Personas autorizadas</span>
                </div>
              </div>

              {b2bStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelBaseClass}>
                        {tab === "empresa"
                          ? "Razón social"
                          : "Nombre de la agencia / organizador"}
                      </label>
                      <input
                        type="text"
                        required
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder={
                          tab === "empresa"
                            ? "Ej. Grupo Consultor Valle S.A. de C.V."
                            : "Ej. Horizonte Eventos & DMC"
                        }
                        className={inputBaseClass}
                      />
                    </div>
                    <div>
                      <label className={labelBaseClass}>RFC</label>
                      <input
                        type="text"
                        required
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value.toUpperCase())}
                        placeholder="GCV210415AB9"
                        className={cn(inputBaseClass, "uppercase")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelBaseClass}>
                        {tab === "empresa" ? "Actividad o giro" : "Tipo de organizador"}
                      </label>
                      <input
                        type="text"
                        required
                        value={businessActivity}
                        onChange={(e) => setBusinessActivity(e.target.value)}
                        placeholder={
                          tab === "empresa"
                            ? "Tecnología / Finanzas / Industria"
                            : "Eventos corporativos / Bodas / DMC"
                        }
                        className={inputBaseClass}
                      />
                    </div>
                    <div>
                      <label className={labelBaseClass}>Nombre de la persona responsable</label>
                      <input
                        type="text"
                        required
                        value={responsibleName}
                        onChange={(e) => setResponsibleName(e.target.value)}
                        placeholder="Nombre completo"
                        className={inputBaseClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={labelBaseClass}>Cargo</label>
                      <input
                        type="text"
                        required
                        value={responsibleRole}
                        onChange={(e) => setResponsibleRole(e.target.value)}
                        placeholder="Dirección / Compras"
                        className={inputBaseClass}
                      />
                    </div>
                    <div>
                      <label className={labelBaseClass}>Correo de trabajo</label>
                      <input
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="responsable@empresa.mx"
                        className={inputBaseClass}
                      />
                    </div>
                    <div>
                      <label className={labelBaseClass}>Teléfono</label>
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
                    <label className={labelBaseClass}>Domicilio fiscal completo</label>
                    <input
                      type="text"
                      required
                      value={fiscalAddress}
                      onChange={(e) => setFiscalAddress(e.target.value)}
                      placeholder="Calle, número, colonia, C.P., alcaldía/municipio y estado"
                      className={inputBaseClass}
                    />
                  </div>

                  <div>
                    <label className={labelBaseClass}>Contraseña de acceso al portal</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={b2bPassword}
                      onChange={(e) => setB2bPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={inputBaseClass}
                    />
                  </div>

                  <div className="rounded-2xl border border-[#E4DDD1] bg-[#F2EFE9]/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E645F]">
                      Servicios de interés
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-4 text-xs text-[#1C201E]">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={needsLodging}
                          onChange={(e) => setNeedsLodging(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#1B3B2B]"
                        />
                        Hospedaje en 6 sedes
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={needsOtamEvents}
                          onChange={(e) => setNeedsOtamEvents(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#1B3B2B]"
                        />
                        Eventos y talleres OTAM
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={needsAmanecerMerch}
                          onChange={(e) => setNeedsAmanecerMerch(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#1B3B2B]"
                        />
                        Artículos Amanecer
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextB2BStep}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#132A1E]"
                  >
                    Continuar al Paso 2: Personas autorizadas
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-editorial text-xl font-semibold text-[#1B3B2B]">
                        Personas autorizadas en la cuenta
                      </h3>
                      <p className="text-xs text-[#5E645F]">
                        Define quiénes pueden reservar y quién autoriza el uso de saldo o premios.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addAuthorizedRow}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3B2B] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#F2EFE9]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar persona
                    </button>
                  </div>

                  <div className="space-y-3">
                    {authorizedPeople.map((person, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#E4DDD1] bg-white p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9E6B4B]">
                            Colaborador #{idx + 1}
                          </span>
                          {authorizedPeople.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAuthorizedRow(idx)}
                              className="inline-flex items-center gap-1 text-xs text-[#9B2C2C] hover:underline"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Quitar
                            </button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            required
                            placeholder="Nombre completo"
                            value={person.fullName}
                            onChange={(e) =>
                              updateAuthorizedRow(idx, { fullName: e.target.value })
                            }
                            className={inputBaseClass}
                          />
                          <input
                            type="email"
                            required
                            placeholder="Correo electrónico"
                            value={person.email}
                            onChange={(e) =>
                              updateAuthorizedRow(idx, { email: e.target.value })
                            }
                            className={inputBaseClass}
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Teléfono"
                            value={person.phone}
                            onChange={(e) =>
                              updateAuthorizedRow(idx, { phone: e.target.value })
                            }
                            className={inputBaseClass}
                          />
                          <select
                            value={person.roleInAccount}
                            onChange={(e) =>
                              updateAuthorizedRow(idx, {
                                roleInAccount: e.target.value as AuthorizedRow["roleInAccount"],
                              })
                            }
                            className={inputBaseClass}
                          >
                            <option value="AUTORIZA_PREMIOS_Y_SALDO">
                              Autoriza uso de premios y saldo
                            </option>
                            <option value="RESERVA_Y_ADMINISTRA">
                              Reserva y administra la cuenta
                            </option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Descarga del formato completo en PDF / Excel */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFD2BA] bg-[#F2EFE9] p-4">
                    <div className="flex items-center gap-2.5 text-xs text-[#1B3B2B]">
                      <Download className="h-4 w-4 text-[#9E6B4B]" />
                      <span>¿Necesitas firma interna antes de enviar? Descarga el formato completo:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadCsvFormat}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3B2B]/25 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#FAF8F5]"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Excel (.csv)
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadPrintablePdf}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#1B3B2B]/25 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#FAF8F5]"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        PDF / Imprimir
                      </button>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#4C524E]">
                    <input
                      type="checkbox"
                      checked={acceptB2BRules}
                      onChange={(e) => setAcceptB2BRules(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-[#1B3B2B]"
                    />
                    <span>
                      Confirmo que los datos fiscales y personas autorizadas son verídicos y acepto
                      las reglas de Círculo Orgánico B2B.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setB2bStep(1)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD4C6] bg-white px-5 py-3 text-xs font-semibold text-[#4C524E] hover:border-[#1B3B2B]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Paso anterior
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#132A1E] disabled:opacity-60"
                    >
                      {isPending ? "Enviando convenio..." : "Enviar solicitud y entrar al portal"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

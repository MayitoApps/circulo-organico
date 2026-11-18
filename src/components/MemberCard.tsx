"use client";

import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Sparkles } from "lucide-react";
import type { Tier } from "@/lib/loyalty-engine";
import { cn } from "@/lib/utils";

export interface MemberCardProps {
  holderName: string;
  membershipNumber: string;
  tier: Tier;
  qrValue: string;
  accountTypeLabel?: string;
  downloadable?: boolean;
  compact?: boolean;
  className?: string;
}

const TIER_CARD_STYLES: Record<
  Tier,
  {
    bg: string;
    text: string;
    subtext: string;
    badgeBg: string;
    badgeText: string;
    ringStroke: string;
    border: string;
    tierName: string;
  }
> = {
  ORIGEN: {
    bg: "bg-gradient-to-br from-[#1B3B2B] via-[#183526] to-[#11251B]",
    text: "text-white",
    subtext: "text-white/75",
    badgeBg: "bg-white/12 border-white/25",
    badgeText: "text-[#FAF8F5]",
    ringStroke: "rgba(250, 248, 245, 0.14)",
    border: "border-[#2B533F]",
    tierName: "ORIGEN",
  },
  ORO: {
    bg: "bg-gradient-to-br from-[#D4BF98] via-[#C8B289] to-[#B49A6D]",
    text: "text-[#1B3B2B]",
    subtext: "text-[#1B3B2B]/80",
    badgeBg: "bg-[#1B3B2B]/10 border-[#1B3B2B]/25",
    badgeText: "text-[#1B3B2B]",
    ringStroke: "rgba(27, 59, 43, 0.16)",
    border: "border-[#B49A6D]",
    tierName: "ORO",
  },
  DIAMANTE: {
    bg: "bg-gradient-to-br from-[#272E2B] via-[#1E2422] to-[#131715]",
    text: "text-white",
    subtext: "text-white/70",
    badgeBg: "bg-[#C8B289]/18 border-[#C8B289]/40",
    badgeText: "text-[#E6D5B5]",
    ringStroke: "rgba(200, 178, 137, 0.18)",
    border: "border-[#343D3A]",
    tierName: "DIAMANTE",
  },
};

export function MemberCard({
  holderName,
  membershipNumber,
  tier,
  qrValue,
  accountTypeLabel,
  downloadable = false,
  compact = false,
  className,
}: MemberCardProps) {
  const styles = TIER_CARD_STYLES[tier];
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const handleDownloadQr = () => {
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `circulo-organico-${membershipNumber.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayName = holderName.trim() || "Tu Nombre Aquí";

  return (
    <div className={cn("w-full max-w-[440px]", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border shadow-[0_24px_48px_-16px_rgba(27,59,43,0.28)] transition-all duration-300",
          compact ? "p-5 min-h-[210px]" : "p-6 sm:p-7 aspect-[1.62/1] min-h-[235px]",
          "flex flex-col justify-between select-none",
          styles.bg,
          styles.text,
          styles.border
        )}
      >
        {/* Anillos concéntricos sutiles grabados al lado derecho */}
        <svg
          aria-hidden="true"
          viewBox="0 0 320 320"
          className="pointer-events-none absolute -right-14 -top-10 h-[128%] w-auto opacity-95"
          fill="none"
        >
          <circle cx="210" cy="160" r="46" stroke={styles.ringStroke} strokeWidth="1.2" />
          <circle cx="210" cy="160" r="76" stroke={styles.ringStroke} strokeWidth="1.1" />
          <circle cx="210" cy="160" r="108" stroke={styles.ringStroke} strokeWidth="1" />
          <circle cx="210" cy="160" r="142" stroke={styles.ringStroke} strokeWidth="0.9" />
          <circle cx="210" cy="160" r="176" stroke={styles.ringStroke} strokeWidth="0.8" />
        </svg>

        {/* Brillo orgánico sutil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.12),transparent_48%)]"
        />

        {/* Fila Superior: Logo izquierda + Nivel derecha */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="leading-none">
            <div className="font-editorial text-xl sm:text-2xl italic tracking-wide">
              Círculo
            </div>
            <div className="mt-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.26em]">
              ORGÁNICO
            </div>
            {accountTypeLabel && (
              <div className={cn("mt-1.5 text-[10px] uppercase tracking-[0.18em]", styles.subtext)}>
                {accountTypeLabel}
              </div>
            )}
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm",
              styles.badgeBg,
              styles.badgeText
            )}
          >
            {tier === "DIAMANTE" && <Sparkles className="h-3 w-3" />}
            <span>{styles.tierName}</span>
          </div>
        </div>

        {/* Fila Inferior: Titular + SOCIO 000 248 izquierda + QR blanco derecha */}
        <div className="relative z-10 mt-6 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className={cn("text-[10px] uppercase tracking-[0.2em]", styles.subtext)}>
              Titular de membresía
            </p>
            <p className="mt-1 truncate font-editorial text-xl sm:text-2xl font-medium tracking-wide">
              {displayName}
            </p>
            <p className="mt-1.5 font-mono text-xs sm:text-[13px] font-medium tracking-[0.18em] tabular-nums opacity-90">
              SOCIO {membershipNumber}
            </p>
          </div>

          <div
            ref={qrWrapperRef}
            className="shrink-0 rounded-xl bg-white p-2 shadow-md ring-1 ring-black/5"
            title={`QR de socio ${membershipNumber}`}
          >
            <QRCodeCanvas
              value={qrValue}
              size={140}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#1B3B2B"
              style={{
                width: compact ? "60px" : "74px",
                height: compact ? "60px" : "74px",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>

      {downloadable && (
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-xs text-[#5E645F]">
            Presenta este QR en recepción o centros de bienestar.
          </span>
          <button
            type="button"
            onClick={handleDownloadQr}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E4DDD1] bg-white px-3.5 py-1.5 text-xs font-medium text-[#1B3B2B] transition hover:border-[#1B3B2B] hover:bg-[#F2EFE9]"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
}

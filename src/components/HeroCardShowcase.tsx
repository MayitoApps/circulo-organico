"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { MemberCard } from "@/components/MemberCard";

export function HeroCardShowcase() {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * 10,
      rotateY: (x - 0.5) * 12,
      glareX: x * 100,
      glareY: y * 100,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, active: false });
  };

  return (
    <div className="animate-hero-3 relative mx-auto flex max-w-md flex-col items-center lg:ml-auto lg:mr-0">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1200px" }}
        className="group relative w-full"
      >
        {/* Silueta trasera Diamante que se despliega ligeramente en hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-5 -top-5 hidden w-full max-w-[420px] rotate-3 opacity-85 transition-all duration-500 ease-out group-hover:-right-7 group-hover:-top-7 group-hover:rotate-6 sm:block"
        >
          <div className="aspect-[1.62/1] rounded-2xl border border-[#3E4945] bg-gradient-to-br from-[#272E2B] via-[#1E2422] to-[#131715] p-6 shadow-2xl">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[#DFCFAF]">
              <span>Círculo Orgánico</span>
              <span className="rounded-full border border-[#C8B289]/40 px-2.5 py-0.5">
                Diamante
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta Oro principal con flotación ambiental + inclinación 3D reactiva */}
        <div
          style={{ transformStyle: "preserve-3d" }}
          className="animate-float-slow relative z-10 w-full"
        >
          <div
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${
                tilt.active ? "translateY(-4px)" : ""
              }`,
              transition: tilt.active
                ? "transform 120ms ease-out"
                : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="relative mx-auto w-full max-w-[440px]"
          >
            <MemberCard
              holderName="Ana López"
              membershipNumber="000 248"
              tier="ORO"
              qrValue="circulo-organico://socio/000-248"
              accountTypeLabel="Socia Personal · 20% dto."
              className="mx-auto"
            />
            {/* Brillo metálico suave que sigue al cursor */}
            <div
              aria-hidden="true"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.22), transparent 55%)`,
                opacity: tilt.active ? 1 : 0,
              }}
              className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex w-full items-center gap-3 rounded-2xl border border-[#C8B289]/35 bg-[#0F2218]/90 px-4 py-3 text-xs text-white/90 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-[#C8B289]/65 hover:bg-[#13291E]">
        <Sparkles className="h-4 w-4 shrink-0 text-[#C8B289]" />
        <span>
          <strong className="text-[#DFCFAF]">Masaje de regalo (60 min):</strong> 1 al año en Oro y
          hasta 2 en Diamante, sin requerir noche de hotel.
        </span>
      </div>
    </div>
  );
}

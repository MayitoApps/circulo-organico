"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { getDashboardPathForRole } from "@/auth.config";
import { getSafeDashboardCallback } from "@/lib/portal-tab";
import { Card, inputBaseClass, labelBaseClass, SectionEyebrow } from "@/components/ui/primitives";

export function EntrarClient({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Correo o contraseña incorrectos, o cuenta suspendida.");
        return;
      }

      const safeCallback = getSafeDashboardCallback(callbackUrl);
      if (safeCallback) {
        router.replace(safeCallback);
        router.refresh();
        return;
      }

      const session = await getSession();
      const destination = session?.user?.role
        ? getDashboardPathForRole(session.user.role)
        : "/entrar";

      if (destination === "/entrar") {
        window.location.assign("/entrar");
        return;
      }

      router.replace(destination);
      router.refresh();
    });
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-[#FAF8F5] py-14 sm:py-20">
      <div className="animate-hero-1 mx-auto max-w-lg px-4 sm:px-6">
        <Card variant="white" className="p-8 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-10">
          <SectionEyebrow>Acceso a tu cuenta</SectionEyebrow>
          <h1 className="mt-2 font-editorial text-4xl font-medium text-[#1B3B2B]">
            Entrar a Círculo Orgánico
          </h1>
          <p className="mt-2 text-sm text-[#5E645F]">
            Ingresa con tu correo y contraseña para consultar tu tarjeta QR, puntos, saldo
            empresarial, eventos o panel operativo.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-[#F2C3C3] bg-[#FCECEC] px-4 py-3 text-xs font-medium text-[#9B2C2C]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className={labelBaseClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#9E6B4B]" /> Correo electrónico
                </span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana@ejemplo.com"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label className={labelBaseClass}>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#9E6B4B]" /> Contraseña
                </span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputBaseClass}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md disabled:opacity-60"
            >
              {isPending ? "Verificando acceso..." : "Entrar ahora"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#5E645F]">
            ¿Aún no eres parte del programa?{" "}
            <Link href="/registro" className="font-semibold text-[#1B3B2B] underline">
              Únete gratis aquí
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

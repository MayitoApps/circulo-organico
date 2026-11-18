"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Menu,
  Shield,
  UserCheck,
  X,
} from "lucide-react";
import type { ProfileRole } from "@/lib/loyalty-engine";
import { cn } from "@/lib/utils";

export interface HeaderUser {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: ProfileRole;
  membershipNumber?: string | null;
}

const CENTER_LINKS = [
  { href: "/hoteles", label: "Hoteles" },
  { href: "/membresias", label: "Membresías" },
  { href: "/experiencias", label: "Experiencias" },
  { href: "/otam", label: "OTAM" },
  { href: "/empresas", label: "Empresas" },
  { href: "/agencias", label: "Agencias" },
  { href: "/amanecer", label: "Amanecer" },
];

function getPortalLink(role?: ProfileRole): { href: string; label: string } {
  switch (role) {
    case "ADMIN_STAFF":
      return { href: "/admin", label: "Dashboard Admin" };
    case "EMPRESA":
      return { href: "/empresa", label: "Dashboard Empresa" };
    case "AGENCIA":
      return { href: "/agencia", label: "Dashboard Agencia" };
    case "SOCIO_PERSONAL":
    default:
      return { href: "/mi-circulo", label: "Mi Dashboard" };
  }
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const updateScroll = () => {
      const top = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setIsScrolled(top > 12);
      setScrollProgress(docHeight > 0 ? Math.min(100, Math.max(0, (top / docHeight) * 100)) : 0);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [pathname]);

  const portal = getPortalLink(user?.role);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({ redirect: false });
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[#E4DDD1]/90 bg-[#FAF8F5]/95 backdrop-blur-md transition-shadow duration-300",
        isScrolled && "shadow-[0_10px_30px_-15px_rgba(27,59,43,0.18)]"
      )}
    >
      {/* Barra Principal Global */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B3B2B] text-white transition-all duration-300 group-hover:scale-105 group-hover:bg-[#132A1E]">
            <span className="font-editorial text-lg italic leading-none">C</span>
          </div>
          <div className="leading-none">
            <span className="font-editorial text-xl italic tracking-wide text-[#1B3B2B] transition-colors group-hover:text-[#132A1E]">
              Círculo
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9E6B4B]">
              ORGÁNICO
            </span>
          </div>
        </Link>

        {/* Menú central */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-6 xl:flex">
          {CENTER_LINKS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative py-1 text-[13px] font-medium transition-colors duration-200",
                  active ? "text-[#1B3B2B]" : "text-[#4A504C] hover:text-[#1B3B2B]"
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded-full bg-[#9E6B4B] transition-transform duration-300 ease-out",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Acciones a la derecha */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {user ? (
            <>
              <Link
                href={portal.href}
                className="inline-flex items-center gap-2 rounded-full bg-[#1B3B2B] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
              >
                {user.role === "ADMIN_STAFF" ? (
                  <Shield className="h-3.5 w-3.5 text-[#C8B289]" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 text-[#C8B289]" />
                )}
                <span>{portal.label}</span>
                {user.membershipNumber && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] tabular-nums">
                    {user.membershipNumber}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#4A504C] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1B3B2B] hover:text-[#1B3B2B]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/entrar"
                className="rounded-full border border-[#1B3B2B]/25 bg-white px-4 py-2 text-xs font-semibold text-[#1B3B2B] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1B3B2B] hover:bg-[#F2EFE9]"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-[#1B3B2B] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#132A1E] hover:shadow-md"
              >
                Únete gratis
              </Link>
            </>
          )}
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-[#DCD4C6] bg-white p-2 text-[#1B3B2B] xl:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="border-t border-[#E4DDD1] bg-[#FAF8F5] px-4 pb-6 pt-4 xl:hidden">
          <nav className="grid grid-cols-2 gap-2">
            {CENTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                  pathname === item.href
                    ? "border-[#1B3B2B] bg-[#1B3B2B] text-white"
                    : "border-[#E4DDD1] bg-white text-[#1C201E]"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/compromiso"
              onClick={() => setMobileOpen(false)}
              className="col-span-2 rounded-xl border border-[#E4DDD1] bg-[#F2EFE9] px-3 py-2.5 text-sm font-medium text-[#1B3B2B]"
            >
              Compromiso Social y Medioambiente
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-[#E4DDD1] pt-4">
            {user ? (
              <>
                <Link
                  href={portal.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#1B3B2B] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <UserCheck className="h-4 w-4 text-[#C8B289]" />
                  <span>Ir a {portal.label}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-[#DCD4C6] bg-white px-4 py-2 text-sm font-medium text-[#4A504C]"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/entrar"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-[#1B3B2B]/30 bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#1B3B2B]"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#1B3B2B] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Únete gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Indicador sutil de progreso de lectura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-transparent"
      >
        <div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-gradient-to-r from-[#9E6B4B] via-[#C8B289] to-[#1B3B2B] transition-[width] duration-150 ease-out"
        />
      </div>
    </header>
  );
}

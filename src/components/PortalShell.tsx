"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ExternalLink,
  Gift,
  Hotel,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Shield,
  Sparkles,
  Trees,
  X,
} from "lucide-react";
import type { ProfileRole } from "@/lib/loyalty-engine";
import { DEMO_ACCOUNT_PRESETS } from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";

export interface PortalUser {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: ProfileRole;
  membershipNumber?: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

function getNavForRole(role: ProfileRole): {
  roleTitle: string;
  items: NavItem[];
  exploreItems: NavItem[];
} {
  switch (role) {
    case "ADMIN_STAFF":
      return {
        roleTitle: "Operación y Recepción",
        items: [
          { href: "/admin", label: "Panel Administrativo", icon: Shield, exact: true },
        ],
        exploreItems: [
          { href: "/hoteles", label: "Nuestros Hoteles", icon: Hotel },
          { href: "/otam", label: "Catálogo OTAM", icon: Trees },
          { href: "/amanecer", label: "Catálogo Amanecer", icon: Package },
        ],
      };
    case "EMPRESA":
      return {
        roleTitle: "Cuenta Corporativa",
        items: [
          { href: "/empresa", label: "Dashboard Empresa", icon: Building2, exact: true },
        ],
        exploreItems: [
          { href: "/hoteles", label: "Nuestros Hoteles", icon: Hotel },
          { href: "/otam", label: "Eventos OTAM", icon: Trees },
          { href: "/amanecer", label: "Artículos Amanecer", icon: Package },
          { href: "/experiencias", label: "Canjear Catálogo", icon: Gift },
        ],
      };
    case "AGENCIA":
      return {
        roleTitle: "Agencia y Organizador",
        items: [
          { href: "/agencia", label: "Dashboard Agencia", icon: Briefcase, exact: true },
        ],
        exploreItems: [
          { href: "/otam", label: "Cotizar Grupos OTAM", icon: Trees },
          { href: "/amanecer", label: "Kits Amanecer", icon: Package },
          { href: "/hoteles", label: "Explorar 6 Sedes", icon: Hotel },
        ],
      };
    case "SOCIO_PERSONAL":
    default:
      return {
        roleTitle: "Socio Personal",
        items: [
          { href: "/mi-circulo", label: "Mi Cuenta y Puntos", icon: LayoutDashboard, exact: true },
          { href: "/mi-circulo/masaje", label: "Tu Masaje de Regalo", icon: Sparkles, exact: true },
        ],
        exploreItems: [
          { href: "/hoteles", label: "Nuestros Hoteles", icon: Hotel },
          { href: "/experiencias", label: "Canjear Experiencias", icon: Gift },
          { href: "/otam", label: "Experiencias OTAM", icon: Trees },
        ],
      };
  }
}

export function PortalShell({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const navConfig = getNavForRole(user.role);
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const handleQuickSwitch = (preset: (typeof DEMO_ACCOUNT_PRESETS)[number]) => {
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: preset.email,
        password: preset.password,
        redirect: false,
      });
      setDemoOpen(false);
      setMobileOpen(false);
      if (res && !res.error) {
        router.push(preset.destination);
        router.refresh();
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    });
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-[#1B3B2B] px-4 py-6 text-white">
      <div>
        {/* Marca */}
        <Link
          href={navConfig.items[0]?.href ?? "/"}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C8B289] text-[#1B3B2B]">
            <span className="font-editorial text-lg font-semibold italic leading-none">C</span>
          </div>
          <div className="leading-none">
            <span className="font-editorial text-xl italic tracking-wide text-white">
              Círculo
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#C8B289]">
              ORGÁNICO
            </span>
          </div>
        </Link>

        {/* Tarjeta compacta de perfil activo */}
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/8 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C8B289]">
            {navConfig.roleTitle}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{fullName}</p>
          {user.membershipNumber ? (
            <p className="mt-0.5 font-mono text-[11px] text-white/75 tabular-nums">
              SOCIO {user.membershipNumber}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-[11px] text-white/70">{user.email}</p>
          )}
        </div>

        {/* Navegación principal del Dashboard */}
        <div className="mt-6">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Mi Panel
          </p>
          <nav className="mt-2 space-y-1">
            {navConfig.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
                    active
                      ? "bg-[#C8B289] text-[#1B3B2B]"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Acciones rápidas relacionadas */}
        <div className="mt-6">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Operaciones y Catálogos
          </p>
          <nav className="mt-2 space-y-1">
            {navConfig.exploreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <item.icon className="h-3.5 w-3.5 shrink-0 text-[#C8B289]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Pie del sidebar: volver a la landing + Selector Demo + Salir */}
      <div className="space-y-2 border-t border-white/15 pt-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDemoOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-medium text-[#C8B289] hover:bg-white/15"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Cambiar perfil demo
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {demoOpen && (
            <div className="mt-1.5 space-y-1 rounded-xl border border-white/15 bg-[#132A1E] p-1.5">
              {DEMO_ACCOUNT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleQuickSwitch(preset)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] text-white/90 hover:bg-white/10"
                >
                  <span className="truncate">{preset.label}</span>
                  <span className="ml-1 shrink-0 text-[10px] font-semibold text-[#C8B289]">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <span>Sitio informativo</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#F5B7B1] transition hover:bg-white/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAF8F5]">
      {/* Sidebar fijo en escritorio */}
      <aside className="hidden w-68 shrink-0 border-r border-[#274B39] lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Contenedor derecho */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar móvil / tablet */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E4DDD1] bg-[#FAF8F5]/95 px-4 backdrop-blur-md lg:hidden">
          <Link href={navConfig.items[0]?.href ?? "/"} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B3B2B] text-[#C8B289]">
              <span className="font-editorial text-base italic">C</span>
            </div>
            <div className="leading-none">
              <span className="font-editorial text-lg italic text-[#1B3B2B]">
                Círculo Orgánico
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9E6B4B]">
                {navConfig.roleTitle}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCD4C6] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B3B2B]"
          >
            <Menu className="h-4 w-4" />
            Menú
          </button>
        </header>

        {/* Drawer móvil */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-full bg-white/10 p-1.5 text-white"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
              {renderSidebarContent()}
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

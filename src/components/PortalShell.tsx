"use client";

import React, { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CalendarCheck,
  ChevronDown,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { ProfileRole } from "@/lib/loyalty-engine";
import { DEMO_ACCOUNT_PRESETS } from "@/lib/demo-accounts";
import { PORTAL_TAB_EVENT, pushPortalTabInUrl } from "@/lib/portal-tab";
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
  basePath: string;
  tab?: string;
  isDefaultTab?: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getNavForRole(role: ProfileRole): {
  roleTitle: string;
  homeHref: string;
  items: NavItem[];
} {
  switch (role) {
    case "ADMIN_STAFF":
      return {
        roleTitle: "Administración",
        homeHref: "/admin",
        items: [
          {
            href: "/admin",
            basePath: "/admin",
            tab: "operacion",
            isDefaultTab: true,
            label: "Alta de Puntos y Consumos",
            icon: Sparkles,
          },
          {
            href: "/admin?tab=canje",
            basePath: "/admin",
            tab: "canje",
            label: "Canje / Intercambio",
            icon: Gift,
          },
          {
            href: "/admin?tab=bandejas",
            basePath: "/admin",
            tab: "bandejas",
            label: "Citas Spa y Convenios",
            icon: CalendarCheck,
          },
          {
            href: "/admin?tab=agencias",
            basePath: "/admin",
            tab: "agencias",
            label: "Eventos y Cotizaciones",
            icon: Briefcase,
          },
        ],
      };
    case "EMPRESA":
      return {
        roleTitle: "Cuenta Corporativa",
        homeHref: "/empresa",
        items: [
          {
            href: "/empresa",
            basePath: "/empresa",
            tab: "resumen",
            isDefaultTab: true,
            label: "Resumen y Nivel",
            icon: LayoutDashboard,
          },
          {
            href: "/empresa?tab=reservas",
            basePath: "/empresa",
            tab: "reservas",
            label: "Reservas del Equipo",
            icon: Calendar,
          },
          {
            href: "/empresa?tab=saldo",
            basePath: "/empresa",
            tab: "saldo",
            label: "Mi Saldo (2%)",
            icon: Wallet,
          },
          {
            href: "/empresa?tab=equipo",
            basePath: "/empresa",
            tab: "equipo",
            label: "Mi Equipo",
            icon: Users,
          },
          {
            href: "/empresa?tab=convenio",
            basePath: "/empresa",
            tab: "convenio",
            label: "Mi Convenio",
            icon: Building2,
          },
        ],
      };
    case "AGENCIA":
      return {
        roleTitle: "Agencia y Organizador",
        homeHref: "/agencia",
        items: [
          {
            href: "/agencia",
            basePath: "/agencia",
            tab: "resumen",
            isDefaultTab: true,
            label: "Resumen y Eventos",
            icon: LayoutDashboard,
          },
          {
            href: "/agencia?tab=comisiones",
            basePath: "/agencia",
            tab: "comisiones",
            label: "Comisiones y Puntos",
            icon: Wallet,
          },
          {
            href: "/agencia?tab=certificados",
            basePath: "/agencia",
            tab: "certificados",
            label: "Certificados de Regalo",
            icon: Gift,
          },
          {
            href: "/agencia?tab=tarjeta",
            basePath: "/agencia",
            tab: "tarjeta",
            label: "Tarjeta y Convenio",
            icon: CreditCard,
          },
        ],
      };
    case "SOCIO_PERSONAL":
    default:
      return {
        roleTitle: "Socio Personal",
        homeHref: "/mi-circulo",
        items: [
          {
            href: "/mi-circulo",
            basePath: "/mi-circulo",
            tab: "resumen",
            isDefaultTab: true,
            label: "Resumen y Tarjeta",
            icon: LayoutDashboard,
          },
          {
            href: "/mi-circulo?tab=reservas",
            basePath: "/mi-circulo",
            tab: "reservas",
            label: "Mis Reservas",
            icon: Calendar,
          },
          {
            href: "/mi-circulo?tab=historial",
            basePath: "/mi-circulo",
            tab: "historial",
            label: "Historial de Puntos",
            icon: Award,
          },
          {
            href: "/mi-circulo/masaje",
            basePath: "/mi-circulo/masaje",
            label: "Mi Masaje de Regalo",
            icon: Sparkles,
          },
        ],
      };
  }
}

function SidebarNavItems({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [clientTab, setClientTab] = useState<string | null>(() => searchParams.get("tab"));

  useEffect(() => {
    setClientTab(searchParams.get("tab"));
  }, [searchParams]);

  useEffect(() => {
    const syncTab = () => {
      setClientTab(new URLSearchParams(window.location.search).get("tab"));
    };
    window.addEventListener("popstate", syncTab);
    window.addEventListener(PORTAL_TAB_EVENT, syncTab);
    return () => {
      window.removeEventListener("popstate", syncTab);
      window.removeEventListener(PORTAL_TAB_EVENT, syncTab);
    };
  }, []);

  const isItemActive = (item: NavItem): boolean => {
    if (!item.tab) {
      return pathname === item.basePath;
    }
    if (pathname !== item.basePath) return false;
    if (!clientTab) return Boolean(item.isDefaultTab);
    return clientTab === item.tab;
  };

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    onNavigate();
    if (item.tab && pathname === item.basePath) {
      e.preventDefault();
      pushPortalTabInUrl(item.href);
    }
  };

  return (
    <nav className="mt-2.5 space-y-1.5" aria-label="Navegación del dashboard">
      {items.map((item) => {
        const active = isItemActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleItemClick(e, item)}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200",
              active
                ? "bg-[#C8B289] text-[#1B3B2B] shadow-xs"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                active ? "text-[#1B3B2B]" : "text-[#C8B289]"
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarNavFallback({ items }: { items: NavItem[] }) {
  return (
    <nav className="mt-2.5 space-y-1.5" aria-label="Navegación del dashboard">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/85"
        >
          <item.icon className="h-4 w-4 shrink-0 text-[#C8B289]" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
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
        router.replace(preset.destination);
        router.refresh();
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({ redirect: false });
      router.replace("/entrar");
      router.refresh();
    });
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileOpen(false);
    if (pathname === navConfig.homeHref) {
      e.preventDefault();
      pushPortalTabInUrl(navConfig.homeHref);
    }
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-[#1B3B2B] px-4 py-6 text-white">
      <div>
        {/* Marca del Dashboard */}
        <Link
          href={navConfig.homeHref}
          onClick={handleLogoClick}
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

        {/* Navegación principal por pestañas del Dashboard */}
        <div className="mt-6">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Menú del Dashboard
          </p>
          <Suspense fallback={<SidebarNavFallback items={navConfig.items} />}>
            <SidebarNavItems items={navConfig.items} onNavigate={() => setMobileOpen(false)} />
          </Suspense>
        </div>
      </div>

      {/* Pie del sidebar: selector de vista previa + cerrar sesión */}
      <div className="space-y-2 border-t border-white/15 pt-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDemoOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-medium text-[#C8B289] transition hover:bg-white/15"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Cambiar cuenta demo
            </span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", demoOpen && "rotate-180")}
            />
          </button>

          {demoOpen && (
            <div className="mt-1.5 space-y-1 rounded-xl border border-white/15 bg-[#132A1E] p-1.5">
              {DEMO_ACCOUNT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleQuickSwitch(preset)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] text-white/90 transition hover:bg-white/10"
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

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
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
        <div className="sticky top-0 h-screen overflow-y-auto">{renderSidebarContent()}</div>
      </aside>

      {/* Contenedor derecho */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar móvil / tablet */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E4DDD1] bg-[#FAF8F5]/95 px-4 backdrop-blur-md lg:hidden">
          <Link
            href={navConfig.homeHref}
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
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

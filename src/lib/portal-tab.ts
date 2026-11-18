"use client";

import { useCallback, useEffect, useState } from "react";

export const PORTAL_TAB_EVENT = "circulo-portal-tab-change";

/**
 * Normaliza un nombre de pestaña contra una lista válida para evitar estados inválidos desde la URL.
 */
export function resolvePortalTab<T extends string>(
  candidate: string | null | undefined,
  validTabs: readonly T[],
  defaultTab: T
): T {
  if (candidate && (validTabs as readonly string[]).includes(candidate)) {
    return candidate as T;
  }
  return defaultTab;
}

/**
 * Actualiza ?tab= en la URL sin recargar la página y notifica de inmediato al menú lateral
 * y al dashboard activo.
 */
export function pushPortalTabInUrl(href: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", href);
  window.dispatchEvent(new CustomEvent(PORTAL_TAB_EVENT));
}

/**
 * Valida que una callbackUrl sea una ruta interna distinta de la landing page "/".
 */
export function getSafeDashboardCallback(callbackUrl?: string | null): string | null {
  if (!callbackUrl) return null;
  const trimmed = callbackUrl.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed === "/") {
    return null;
  }
  return trimmed;
}

/**
 * Sincroniza la pestaña activa de un dashboard con ?tab=... y con la navegación del menú izquierdo.
 */
export function usePortalTab<T extends string>(
  validTabs: readonly T[],
  defaultTab: T,
  initialTab?: string | null
): [T, (nextTab: T) => void] {
  const [activeTab, setActiveTab] = useState<T>(() =>
    resolvePortalTab(initialTab, validTabs, defaultTab)
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const paramTab = new URLSearchParams(window.location.search).get("tab");
      setActiveTab(resolvePortalTab(paramTab, validTabs, defaultTab));
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(PORTAL_TAB_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(PORTAL_TAB_EVENT, syncFromLocation);
    };
  }, [validTabs, defaultTab]);

  const selectTab = useCallback(
    (nextTab: T) => {
      setActiveTab(nextTab);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (nextTab === defaultTab) {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", nextTab);
      }
      pushPortalTabInUrl(`${url.pathname}${url.search}`);
    },
    [defaultTab]
  );

  return [activeTab, selectTab];
}

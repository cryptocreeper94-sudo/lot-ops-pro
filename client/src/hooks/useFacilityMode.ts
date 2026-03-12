import { useMemo, useState, useCallback } from "react";

export type FacilityMode = "manheim_beta" | "public_demo";

const DEV_MODE_OVERRIDE_KEY = "lotops_dev_mode_override";

function checkIsDeveloper(): boolean {
  try {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role === "developer" || user.pin === "0424";
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return false;
}

function checkDomainMode(): FacilityMode | null {
  const hostname = window.location.hostname.toLowerCase();

  // lotopspro.com = Manheim beta (clean login, no sales content)
  if (hostname === "lotopspro.com" || hostname === "www.lotopspro.com") {
    return "manheim_beta";
  }

  // lotopspro.io = Sales/marketing version (show all pricing/investor content)
  if (hostname === "lotopspro.io" || hostname === "www.lotopspro.io") {
    return "public_demo";
  }

  // For development/localhost, fall through to other checks
  return null;
}

function getEffectiveMode(): FacilityMode {
  // FIRST: Check domain-based mode (highest priority for production)
  const domainMode = checkDomainMode();
  if (domainMode) {
    return domainMode;
  }

  const isDeveloper = checkIsDeveloper();

  if (isDeveloper) {
    const override = localStorage.getItem(DEV_MODE_OVERRIDE_KEY);
    if (override === "manheim_beta" || override === "public_demo") {
      return override;
    }
  }

  const stored = localStorage.getItem("VITE_FACILITY_MODE");
  if (stored === "manheim_beta") return "manheim_beta";

  try {
    const userStr = localStorage.getItem("vanops_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.isBetaTester) {
        return "manheim_beta";
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return (import.meta.env.VITE_FACILITY_MODE as FacilityMode) || "public_demo";
}

interface FacilityModeConfig {
  mode: FacilityMode;
  isBeta: boolean;
  isPublic: boolean;
  isDeveloper: boolean;
  showPricing: boolean;
  showSalesContent: boolean;
  showFranchiseContent: boolean;
  showInvestorContent: boolean;
  showFranchiseOfferPricing: boolean;
  showStripeCheckout: boolean;
  showSalesRoutes: boolean;
  nftBadgePrice: number;
  nftBadgeLabel: string;
  modeBadgeText: string;
  modeBadgeColor: string;
  setDevModeOverride: (mode: FacilityMode) => void;
  clearDevModeOverride: () => void;
}

export function useFacilityMode(): FacilityModeConfig {
  const [refreshKey, setRefreshKey] = useState(0);

  const setDevModeOverride = useCallback((mode: FacilityMode) => {
    if (checkIsDeveloper()) {
      localStorage.setItem(DEV_MODE_OVERRIDE_KEY, mode);
      setRefreshKey(k => k + 1);
      window.location.reload();
    }
  }, []);

  const clearDevModeOverride = useCallback(() => {
    localStorage.removeItem(DEV_MODE_OVERRIDE_KEY);
    setRefreshKey(k => k + 1);
    window.location.reload();
  }, []);

  return useMemo(() => {
    const mode = getEffectiveMode();
    const isBeta = mode === "manheim_beta";
    const isPublic = mode === "public_demo";
    const isDeveloper = checkIsDeveloper();

    return {
      mode,
      isBeta,
      isPublic,
      isDeveloper,
      showPricing: isPublic,
      showSalesContent: isPublic,
      showFranchiseContent: isPublic,
      showInvestorContent: isPublic,
      showFranchiseOfferPricing: isPublic,
      showStripeCheckout: isPublic,
      showSalesRoutes: isPublic,
      nftBadgePrice: isBeta ? 0 : 1.99,
      nftBadgeLabel: isBeta ? "FREE Collector's Edition" : "$1.99",
      modeBadgeText: isBeta ? "BETA" : "DEMO",
      modeBadgeColor: isBeta ? "bg-violet-600" : "bg-emerald-600",
      setDevModeOverride,
      clearDevModeOverride,
    };
  }, [refreshKey, setDevModeOverride, clearDevModeOverride]);
}

export function getFacilityMode(): FacilityMode {
  return getEffectiveMode();
}

export function isBetaMode(): boolean {
  return getFacilityMode() === "manheim_beta";
}

export function isPublicMode(): boolean {
  return getFacilityMode() === "public_demo";
}

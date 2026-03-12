import { useMemo } from "react";

/**
 * useSandboxData - Clean data switching hook for sandbox mode
 * 
 * Usage:
 *   const drivers = useSandboxData(realDrivers, demoDrivers);
 *   const messages = useSandboxData(realMessages, demoMessages);
 * 
 * In sandbox mode → returns demoData
 * In live mode → returns realData
 */
export function useSandboxData<T>(realData: T, demoData: T): T {
  const isSandbox = typeof window !== "undefined" 
    ? localStorage.getItem("vanops_demo_mode") === "true"
    : false;
  
  return useMemo(() => {
    return isSandbox ? demoData : realData;
  }, [isSandbox, realData, demoData]);
}

/**
 * useSandboxDataWithFallback - Returns demo data when real data is empty/loading
 * Great for showing populated UI during loading states in sandbox
 */
export function useSandboxDataWithFallback<T>(
  realData: T | undefined | null, 
  demoData: T,
  isLoading: boolean = false
): T {
  const isSandbox = typeof window !== "undefined" 
    ? localStorage.getItem("vanops_demo_mode") === "true"
    : false;
  
  return useMemo(() => {
    if (isSandbox) return demoData;
    if (isLoading || realData === undefined || realData === null) {
      return isSandbox ? demoData : (realData as T);
    }
    return realData;
  }, [isSandbox, realData, demoData, isLoading]);
}

/**
 * isSandboxMode - Quick check function
 */
export function isSandboxMode(): boolean {
  return typeof window !== "undefined" 
    ? localStorage.getItem("vanops_demo_mode") === "true"
    : false;
}

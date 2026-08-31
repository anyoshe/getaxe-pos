"use client";

import React, { createContext, useContext, useMemo } from "react";

interface CapabilitiesContextValue {
  capabilities: Set<string>;
  hasCapability: (id: string) => boolean;
  hasAnyCapability: (ids: string[]) => boolean;
}

const CapabilitiesContext = createContext<CapabilitiesContextValue | null>(
  null,
);

export function CapabilitiesProvider({
  capabilities = [],
  children,
}: {
  capabilities: string[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const set = new Set(capabilities);
    return {
      capabilities: set,
      hasCapability: (id: string) => set.has(id),
      hasAnyCapability: (ids: string[]) => ids.some((id) => set.has(id)),
    };
  }, [capabilities]);

  return (
    <CapabilitiesContext.Provider value={value}>
      {children}
    </CapabilitiesContext.Provider>
  );
}

export function useCapability() {
  const ctx = useContext(CapabilitiesContext);
  if (!ctx) {
    return {
      capabilities: new Set<string>(),
      hasCapability: () => true, // fail-open if provider missing
      hasAnyCapability: () => true,
    };
  }
  return ctx;
}

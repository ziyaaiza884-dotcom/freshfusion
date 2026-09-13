"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { PublicCustomer } from "@/lib/customers";

interface AuthContextValue {
  customer: PublicCustomer | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<PublicCustomer | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { customer: PublicCustomer | null };
      setCustomer(data.customer);
    } catch {
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from the session cookie
    refresh().finally(() => setHydrated(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time hydration
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await parseError(res, "Could not sign in"));
    const data = (await res.json()) as { customer: PublicCustomer };
    setCustomer(data.customer);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      if (!res.ok) {
        throw new Error(await parseError(res, "Could not create account"));
      }
      const data = (await res.json()) as { customer: PublicCustomer };
      setCustomer(data.customer);
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ customer, hydrated, login, signup, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock, Sprout, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Sign in failed");
      }
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-7 shadow-sm"
    >
      <div className="flex items-center gap-2 font-serif text-lg font-bold text-primary-strong">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sprout className="h-5 w-5" />
        </span>
        Fresh Fusion
      </div>
      <h1 className="mt-5 font-serif text-xl font-bold">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in with your admin account.
      </p>

      <label className="mt-5 block text-sm font-medium" htmlFor="username">
        User ID
      </label>
      <div className="relative mt-1.5">
        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="username"
          autoFocus
          autoComplete="username"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="pl-9"
        />
      </div>

      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <div className="relative mt-1.5">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && <p className="mt-2 text-xs text-accent">{error}</p>}

      <Button type="submit" className="mt-5 w-full" disabled={busy || !password}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Leave User ID blank to sign in as the main admin.
      </p>
    </form>
  );
}

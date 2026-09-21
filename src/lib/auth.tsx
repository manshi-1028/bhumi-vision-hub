import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Role } from "./api";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

interface AuthValue {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function fetchProfile(userId: string): Promise<{ full_name: string | null; role: Role } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return { full_name: data.full_name, role: data.role as Role };
}

function sessionToUser(session: Session, profile: { full_name: string | null; role: Role }): User {
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    fullName: profile.full_name,
    role: profile.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data.session;
      if (session) {
        const profile = await fetchProfile(session.user.id);
        if (mounted && profile) {
          setUser(sessionToUser(session, profile));
        }
      }
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!session) {
          setUser(null);
          return;
        }
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(sessionToUser(session, profile));
        }
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw error;
    const session = data.session;
    if (!session) throw new Error("Sign-in failed. No session returned.");
    const profile = await fetchProfile(session.user.id);
    if (!profile) throw new Error("No profile found for this account. Contact an administrator.");
    const u = sessionToUser(session, profile);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

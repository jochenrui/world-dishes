import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createAuthProvider } from '../auth';
import type { AuthProvider, User } from '../auth';

interface SessionValue {
  user: User | null;
  mode: AuthProvider['mode'];
  signIn: () => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const providerRef = useRef<AuthProvider>();
  if (!providerRef.current) providerRef.current = createAuthProvider();
  const provider = providerRef.current;

  const [user, setUser] = useState<User | null>(provider.currentUser);

  useEffect(() => provider.onChange(setUser), [provider]);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      mode: provider.mode,
      signIn: () => provider.signIn(),
      signOut: () => provider.signOut(),
    }),
    [user, provider],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

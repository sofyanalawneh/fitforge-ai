import { onIdTokenChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { auth } from "../services/firebase";

interface AuthContextValue {
  user: User | null;
  idToken: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  idToken: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setIdToken(nextUser ? await nextUser.getIdToken() : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, idToken, loading }), [user, idToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

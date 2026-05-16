import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import type { AuthUser, GoogleJwtPayload } from "../types/auth";

const STORAGE_KEY = "medicareai_auth_user";

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  signInWithGoogleCredential: (credential: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signInWithGoogleCredential = useCallback((credential: string) => {
    const payload = jwtDecode<GoogleJwtPayload>(credential);
    const nextUser: AuthUser = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    setIsSigningOut(true);
    navigate({ pathname: "/", hash: "" }, { replace: true });
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [navigate]);

  useEffect(() => {
    if (isSigningOut && location.pathname === "/") {
      setIsSigningOut(false);
      window.scrollTo(0, 0);
    }
  }, [isSigningOut, location.pathname]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isSigningOut,
      signInWithGoogleCredential,
      signOut,
    }),
    [user, isSigningOut, signInWithGoogleCredential, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

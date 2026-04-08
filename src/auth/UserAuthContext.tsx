import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { apiClient } from "../api/client";
import type { UserLoginRequest, UserProfile, UserSignupRequest } from "../types";

type UserAuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  signup: (payload: UserSignupRequest) => Promise<UserProfile>;
  login: (payload: UserLoginRequest) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export const UserAuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    void refresh().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<UserAuthContextValue>(
    () => ({
      user,
      isLoading,
      signup: async (payload) => {
        const created = await apiClient.signupUser(payload);
        setUser(created);
        return created;
      },
      login: async (payload) => {
        const signedIn = await apiClient.loginUser(payload);
        setUser(signedIn);
        return signedIn;
      },
      logout: async () => {
        await apiClient.logoutUser();
        setUser(null);
      },
      refresh: async () => {
        await refresh();
      }
    }),
    [user, isLoading]
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = (): UserAuthContextValue => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return context;
};

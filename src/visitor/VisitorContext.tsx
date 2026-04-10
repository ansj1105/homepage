import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../api/client";
import { getOrCreateDeviceId } from "../utils/deviceId";

type VisitorContextValue = {
  todayVisitors: number;
  refreshVisitors: () => Promise<void>;
};

const VisitorContext = createContext<VisitorContextValue | null>(null);

export const VisitorProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [todayVisitors, setTodayVisitors] = useState(0);

  const trackVisitor = async () => {
    try {
      const result = await apiClient.trackTodayVisitor({
        deviceId: getOrCreateDeviceId(),
        path: `${location.pathname}${location.search}`
      });
      setTodayVisitors(result.todayVisitors);
    } catch {
      void refreshVisitors();
    }
  };

  const refreshVisitors = async () => {
    try {
      const result = await apiClient.getTodayVisitors();
      setTodayVisitors(result.todayVisitors);
    } catch {
      // Keep previous number when API is unavailable.
    }
  };

  useEffect(() => {
    void trackVisitor();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void trackVisitor();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void trackVisitor();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, location.search]);

  const value = useMemo<VisitorContextValue>(
    () => ({
      todayVisitors,
      refreshVisitors
    }),
    [todayVisitors]
  );

  return <VisitorContext.Provider value={value}>{children}</VisitorContext.Provider>;
};

export const useTodayVisitors = (): VisitorContextValue => {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error("useTodayVisitors must be used within VisitorProvider");
  }
  return context;
};

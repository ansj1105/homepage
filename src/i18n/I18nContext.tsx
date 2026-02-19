import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { messages, type Locale, type MessageKey } from "./messages";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const localeStorageKey = "sh_locale";

const getInitialLocale = (): Locale => {
  const saved = window.localStorage.getItem(localeStorageKey);
  if (saved === "ko" || saved === "en") {
    return saved;
  }
  return "ko";
};

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (template: string, vars?: Record<string, string | number>): string => {
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match: string, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
    document.documentElement.lang = nextLocale;
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => {
        const template = messages[locale][key] ?? messages.en[key] ?? key;
        return interpolate(template, vars);
      }
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};

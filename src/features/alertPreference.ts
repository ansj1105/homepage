const alertPreferenceStorageKey = "dongyeon:disable-browser-alerts";

export const getBrowserAlertDisabled = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(alertPreferenceStorageKey) === "1";
};

export const setBrowserAlertDisabled = (disabled: boolean): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(alertPreferenceStorageKey, disabled ? "1" : "0");
};

export const showBrowserAlert = (message: string): void => {
  if (getBrowserAlertDisabled()) {
    return;
  }
  window.alert(message);
};

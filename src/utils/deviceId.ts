const DEVICE_ID_STORAGE_KEY = "sh_device_id";

export const getOrCreateDeviceId = (): string => {
  if (typeof window === "undefined") {
    return "server-render-device";
  }

  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
  return created;
};

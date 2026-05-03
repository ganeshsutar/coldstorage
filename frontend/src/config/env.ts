// Environment variables configuration
// Access via import.meta.env in Vite

export const env = {
  API_URL:
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV ? "http://localhost:8000" : ""),
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "ColdVault",
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

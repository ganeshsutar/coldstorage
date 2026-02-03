// Application constants

export const APP_NAME = "ColdVault";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DATE_FORMATS = {
  DISPLAY: "dd MMM yyyy",
  INPUT: "yyyy-MM-dd",
  TIMESTAMP: "dd MMM yyyy HH:mm",
} as const;

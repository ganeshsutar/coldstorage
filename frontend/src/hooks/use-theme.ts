import { useCallback, useEffect, useState } from "react"

export type ThemeMode = "light" | "dark" | "system"
export type NeutralColor = "gray" | "zinc" | "neutral" | "stone" | "slate"
export type RadiusSize = "none" | "sm" | "md" | "lg" | "full"
export type StylePreset = "vega" | "nova" | "maia" | "lyra" | "mira"
export type AccentColor =
  | "zinc"
  | "amber"
  | "blue"
  | "cyan"
  | "emerald"
  | "fuchsia"
  | "green"
  | "indigo"
  | "lime"
  | "orange"
  | "pink"
  | "red"
  | "rose"
  | "sky"
  | "teal"
  | "violet"
  | "yellow"

export interface ThemeConfig {
  mode: ThemeMode
  neutral: NeutralColor
  radius: RadiusSize
  style: StylePreset
  accent: AccentColor
}

const STORAGE_KEY = "coldvault-theme"

const defaultConfig: ThemeConfig = {
  mode: "system",
  neutral: "zinc",
  radius: "md",
  style: "vega",
  accent: "zinc",
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyThemeToDOM(config: ThemeConfig): void {
  const root = document.documentElement

  // Apply mode
  const effectiveMode = config.mode === "system" ? getSystemTheme() : config.mode
  root.classList.remove("light", "dark")
  root.classList.add(effectiveMode)

  // Apply data attributes for CSS selectors (html only - body inherits CSS variables)
  root.dataset.neutral = config.neutral
  root.dataset.radius = config.radius
  root.dataset.style = config.style
  root.dataset.accent = config.accent
}

function loadConfig(): ThemeConfig {
  if (typeof window === "undefined") return defaultConfig

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ThemeConfig>
      return { ...defaultConfig, ...parsed }
    }
  } catch {
    // Ignore parse errors
  }

  return defaultConfig
}

function saveConfig(config: ThemeConfig): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Initialize theme before React mounts
 * Call this in main.tsx before createRoot
 */
export function initializeTheme(): void {
  const config = loadConfig()
  applyThemeToDOM(config)
}

export function useTheme() {
  const [config, setConfigState] = useState<ThemeConfig>(loadConfig)

  // Listen for system theme changes
  useEffect(() => {
    if (config.mode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      applyThemeToDOM(config)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [config])

  // Apply theme whenever config changes
  useEffect(() => {
    applyThemeToDOM(config)
    saveConfig(config)
  }, [config])

  const setConfig = useCallback((updates: Partial<ThemeConfig>) => {
    setConfigState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setMode = useCallback((mode: ThemeMode) => {
    setConfig({ mode })
  }, [setConfig])

  const setNeutral = useCallback((neutral: NeutralColor) => {
    setConfig({ neutral })
  }, [setConfig])

  const setRadius = useCallback((radius: RadiusSize) => {
    setConfig({ radius })
  }, [setConfig])

  const setStyle = useCallback((style: StylePreset) => {
    setConfig({ style })
  }, [setConfig])

  const setAccent = useCallback((accent: AccentColor) => {
    setConfig({ accent })
  }, [setConfig])

  const reset = useCallback(() => {
    setConfigState(defaultConfig)
  }, [])

  const effectiveMode =
    config.mode === "system" ? getSystemTheme() : config.mode

  return {
    config,
    effectiveMode,
    setConfig,
    setMode,
    setNeutral,
    setRadius,
    setStyle,
    setAccent,
    reset,
  }
}

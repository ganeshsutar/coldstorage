import { useContext } from "react"
import { UIContext, type UIContextValue } from "@/contexts/ui-context"

export function useUI(): UIContextValue {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error("useUI must be used within a UIProvider")
  }
  return context
}

import * as React from "react"
import { auditLogService, dashboardSettingsService } from "../api/audit-log"
import type { ActivityLog, ActivityLogFilters, DashboardSettings } from "../types"

export function useAuditLog(filters?: ActivityLogFilters) {
  const [logs, setLogs] = React.useState<ActivityLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await auditLogService.getActivityLogs(filters)
      setLogs(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch activity logs"
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, loading, error, refetch: fetchLogs }
}

export function useActivityLogDetail(id: string | null) {
  const [log, setLog] = React.useState<ActivityLog | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchLog = React.useCallback(async () => {
    if (!id) {
      setLog(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await auditLogService.getActivityLog(id)
      setLog(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch activity log"
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchLog()
  }, [fetchLog])

  return { log, loading, error, refetch: fetchLog }
}

export function useDashboardSettings() {
  const [settings, setSettings] = React.useState<DashboardSettings | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardSettingsService.getDashboardSettings()
      setSettings(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch dashboard settings"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = React.useCallback(
    async (data: Partial<DashboardSettings>) => {
      try {
        setError(null)
        const updated = await dashboardSettingsService.updateDashboardSettings(
          data
        )
        setSettings(updated)
        return updated
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update dashboard settings"
        setError(message)
        throw err
      }
    },
    []
  )

  return { settings, loading, error, refetch: fetchSettings, updateSettings }
}

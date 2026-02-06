import { useState, useCallback, useEffect } from "react"
import { sequencesService } from "../api/sequences"
import type { SequenceConfig, UpdateSequenceConfigRequest } from "../types"

export function useSequences() {
  const [sequences, setSequences] = useState<SequenceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSequences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sequencesService.getSequences()
      setSequences(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sequences")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSequence = useCallback(
    async (id: string, data: UpdateSequenceConfigRequest) => {
      const updated = await sequencesService.updateSequence(id, data)
      setSequences((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      )
      return updated
    },
    []
  )

  useEffect(() => {
    fetchSequences()
  }, [fetchSequences])

  return { sequences, loading, error, refetch: fetchSequences, updateSequence }
}

export function useNextNumber(key: string) {
  const [nextNumber, setNextNumber] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchNextNumber = useCallback(async () => {
    if (!key) return
    try {
      setLoading(true)
      const data = await sequencesService.previewByKey(key)
      setNextNumber(data.next_number)
    } catch {
      setNextNumber("")
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    fetchNextNumber()
  }, [fetchNextNumber])

  return { nextNumber, loading, refetch: fetchNextNumber }
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attendanceService } from "../api/attendance"
import type { AttendanceCreateRequest, AttendanceFilters } from "../types"

export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (filters?: AttendanceFilters) => [...attendanceKeys.lists(), filters] as const,
  details: () => [...attendanceKeys.all, "detail"] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
}

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: () => attendanceService.getAll(filters),
  })
}

export function useAttendanceDetail(id: string | null) {
  return useQuery({
    queryKey: attendanceKeys.detail(id!),
    queryFn: () => attendanceService.get(id!),
    enabled: !!id,
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AttendanceCreateRequest) => attendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

export function useConfirmAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => attendanceService.confirm(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

export function useCancelAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      attendanceService.cancel(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

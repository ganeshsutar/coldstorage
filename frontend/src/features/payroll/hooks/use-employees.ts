import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { employeeService } from "../api/employees"
import type { EmployeeCreateRequest, EmployeeFilters } from "../types"

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters?: EmployeeFilters) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeService.getAll(filters),
  })
}

export function useEmployeeDetail(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ""),
    queryFn: () => employeeService.get(id ?? ""),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EmployeeCreateRequest) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeCreateRequest> }) =>
      employeeService.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
    },
  })
}

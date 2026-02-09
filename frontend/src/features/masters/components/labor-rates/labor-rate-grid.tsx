import * as React from "react"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClientPagination } from "@/hooks/use-client-pagination"
import { TablePagination } from "@/components/ui/table-pagination"
import { useLaborRates } from "../../hooks/use-labor-rates"
import { laborRateService } from "../../api/labor-rates"
import { LaborRateDialog } from "./labor-rate-dialog"
import type { LaborRate, RateType } from "../../types"

const rateTypes: { value: RateType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "LOADING", label: "Loading" },
  { value: "UNLOADING", label: "Unloading" },
  { value: "KATAI", label: "Katai" },
  { value: "RELOAD", label: "Reload" },
  { value: "DUMP", label: "Dump" },
  { value: "DALA", label: "Dala" },
]

export function LaborRateGrid() {
  const [selectedType, setSelectedType] = React.useState<RateType | "ALL">("ALL")
  const { laborRates, loading, error, refetch } = useLaborRates(
    undefined,
    selectedType === "ALL" ? undefined : selectedType
  )
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setCurrentPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  } = useClientPagination(laborRates)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editRate, setEditRate] = React.useState<LaborRate | undefined>()
  const [deleteRate, setDeleteRate] = React.useState<LaborRate | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const handleEdit = (rate: LaborRate) => {
    setEditRate(rate)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditRate(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteRate) return

    setDeleting(true)
    try {
      await laborRateService.deleteLaborRate(deleteRate.id)
      refetch()
    } catch (err) {
      console.error("Failed to delete labor rate:", err)
    } finally {
      setDeleting(false)
      setDeleteRate(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (loading && laborRates.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading labor rates...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select
          value={selectedType}
          onValueChange={(v) => setSelectedType(v as RateType | "ALL")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {rateTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rate
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rate Type</TableHead>
              <TableHead>Packet Type</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Effective From
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No labor rates found. Add your first rate to get started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">
                    {rate.rate_type_display}
                  </TableCell>
                  <TableCell>
                    {rate.packet_type_display || (
                      <span className="text-muted-foreground">Flat Rate</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ₹{Number(rate.rate).toFixed(2)}
                  </TableCell>
                  <TableCell>{formatDate(rate.effective_from)}</TableCell>
                  <TableCell>
                    <Badge variant={rate.is_active ? "default" : "secondary"}>
                      {rate.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(rate)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteRate(rate)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        onFirstPage={goToFirstPage}
        onLastPage={goToLastPage}
      />

      <LaborRateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
        editRate={editRate}
      />

      <AlertDialog open={!!deleteRate} onOpenChange={() => setDeleteRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Labor Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteRate?.rate_type_display} rate?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

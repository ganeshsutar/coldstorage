import * as React from "react"
import { Plus, Pencil, Trash2, Star } from "lucide-react"

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
import { useClientPagination } from "@/hooks/use-client-pagination"
import { TablePagination } from "@/components/ui/table-pagination"
import { useGstRates } from "../../hooks/use-gst-rates"
import { gstRateService } from "../../api/gst-rates"
import { GstRateDialog } from "./gst-rate-dialog"
import type { GstRate } from "../../types"

export function GstRateList() {
  const { gstRates, loading, error, refetch } = useGstRates()
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
  } = useClientPagination(gstRates)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editRate, setEditRate] = React.useState<GstRate | undefined>()
  const [deleteRate, setDeleteRate] = React.useState<GstRate | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const handleEdit = (rate: GstRate) => {
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
      await gstRateService.deleteGstRate(deleteRate.id)
      refetch()
    } catch (err) {
      console.error("Failed to delete GST rate:", err)
    } finally {
      setDeleting(false)
      setDeleteRate(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading GST rates...</div>
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
      <div className="flex items-center justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add GST Rate
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">CGST %</TableHead>
              <TableHead className="text-right">SGST %</TableHead>
              <TableHead className="text-right">IGST %</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No GST rates found. Add your first rate to get started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {rate.code}
                      {rate.is_default && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{rate.description}</TableCell>
                  <TableCell className="text-right">{rate.cgst_rate}%</TableCell>
                  <TableCell className="text-right">{rate.sgst_rate}%</TableCell>
                  <TableCell className="text-right">{rate.igst_rate}%</TableCell>
                  <TableCell>{rate.hsn_code || "-"}</TableCell>
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

      <GstRateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
        editRate={editRate}
      />

      <AlertDialog open={!!deleteRate} onOpenChange={() => setDeleteRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete GST Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRate?.code}"? This action cannot be undone.
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

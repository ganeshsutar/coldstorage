import * as React from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { CommodityDialog } from "@/features/inventory/components/masters"
import { useCommodities } from "@/features/inventory/hooks/use-masters"
import { commodityService } from "@/features/inventory/api/masters"
import type { Commodity } from "@/features/inventory/types/masters"

export function CommodityList() {
  const [search, setSearch] = React.useState("")
  const { commodities, loading, error, refetch } = useCommodities()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editCommodity, setEditCommodity] = React.useState<Commodity | undefined>()
  const [deleteCommodity, setDeleteCommodity] = React.useState<Commodity | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const filteredCommodities = React.useMemo(() => {
    if (!search) return commodities
    const searchLower = search.toLowerCase()
    return commodities.filter(
      (c) =>
        c.code.toLowerCase().includes(searchLower) ||
        c.name.toLowerCase().includes(searchLower) ||
        (c.variety && c.variety.toLowerCase().includes(searchLower))
    )
  }, [commodities, search])

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
  } = useClientPagination(filteredCommodities)

  const handleEdit = (commodity: Commodity) => {
    setEditCommodity(commodity)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditCommodity(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteCommodity) return

    setDeleting(true)
    try {
      await commodityService.deleteCommodity(deleteCommodity.id)
      refetch()
    } catch {
      toast.error("Failed to delete commodity")
    } finally {
      setDeleting(false)
      setDeleteCommodity(null)
    }
  }

  if (loading && commodities.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading commodities...</div>
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search commodities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Commodity
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead className="text-right">Grace Days</TableHead>
              <TableHead className="text-right">Default Rent Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {search ? "No commodities match your search." : "No commodities found."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((commodity) => (
                <TableRow key={commodity.id}>
                  <TableCell className="font-medium">{commodity.code}</TableCell>
                  <TableCell>{commodity.name}</TableCell>
                  <TableCell>{commodity.variety || "-"}</TableCell>
                  <TableCell className="text-right">{commodity.grace_days}</TableCell>
                  <TableCell className="text-right">{Number(commodity.default_rent_rate).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={commodity.is_active ? "default" : "secondary"}>
                      {commodity.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit commodity"
                        onClick={() => handleEdit(commodity)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete commodity"
                        onClick={() => setDeleteCommodity(commodity)}
                      >
                        <Trash2 className="size-4" />
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

      <CommodityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
        editCommodity={editCommodity}
      />

      <AlertDialog open={!!deleteCommodity} onOpenChange={() => setDeleteCommodity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Commodity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCommodity?.name}"? This action cannot be undone.
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

import * as React from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

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
import { VillageDialog } from "@/features/inventory/components/masters"
import { useVillages } from "@/features/inventory/hooks/use-masters"
import { villageService } from "@/features/inventory/api/masters"
import type { Village } from "@/features/inventory/types/masters"

export function VillageList() {
  const [search, setSearch] = React.useState("")
  const { villages, loading, error, refetch } = useVillages()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editVillage, setEditVillage] = React.useState<Village | undefined>()
  const [deleteVillage, setDeleteVillage] = React.useState<Village | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const filteredVillages = React.useMemo(() => {
    if (!search) return villages
    const searchLower = search.toLowerCase()
    return villages.filter(
      (v) =>
        v.code.toLowerCase().includes(searchLower) ||
        v.name.toLowerCase().includes(searchLower) ||
        (v.district && v.district.toLowerCase().includes(searchLower)) ||
        (v.state && v.state.toLowerCase().includes(searchLower))
    )
  }, [villages, search])

  const handleEdit = (village: Village) => {
    setEditVillage(village)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditVillage(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteVillage) return

    setDeleting(true)
    try {
      await villageService.deleteVillage(deleteVillage.id)
      refetch()
    } catch (err) {
      console.error("Failed to delete village:", err)
    } finally {
      setDeleting(false)
      setDeleteVillage(null)
    }
  }

  if (loading && villages.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading villages...</div>
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Villages</h3>
          <p className="text-sm text-muted-foreground">
            Manage village/location master for party addresses
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Village
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search villages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>District</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVillages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {search ? "No villages match your search." : "No villages found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredVillages.map((village) => (
                <TableRow key={village.id}>
                  <TableCell className="font-medium">{village.code}</TableCell>
                  <TableCell>{village.name}</TableCell>
                  <TableCell>{village.post || "-"}</TableCell>
                  <TableCell>{village.district || "-"}</TableCell>
                  <TableCell>{village.state || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={village.is_active ? "default" : "secondary"}>
                      {village.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(village)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteVillage(village)}
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

      <VillageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
        editVillage={editVillage}
      />

      <AlertDialog open={!!deleteVillage} onOpenChange={() => setDeleteVillage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Village</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteVillage?.name}"? This action cannot be undone.
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

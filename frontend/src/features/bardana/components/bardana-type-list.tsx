import * as React from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

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
import { useBardanaTypes, useDeleteBardanaType } from "../hooks"
import type { BardanaType } from "../types"
import { BardanaTypeDialog } from "./bardana-type-dialog"

export function BardanaTypeList() {
  const { data: types = [], isLoading } = useBardanaTypes()
  const deleteMutation = useDeleteBardanaType()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editType, setEditType] = React.useState<BardanaType | null>(null)
  const [deleteType, setDeleteType] = React.useState<BardanaType | null>(null)

  const handleEdit = (type: BardanaType) => {
    setEditType(type)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteType) return
    try {
      await deleteMutation.mutateAsync(deleteType.id)
    } catch {
      // Error handled by mutation
    } finally {
      setDeleteType(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bardana Types</h2>
          <p className="text-muted-foreground">Manage packaging material types</p>
        </div>
        <Button
          onClick={() => {
            setEditType(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Type
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Rate/Unit</TableHead>
              <TableHead className="text-right">Opening Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : types.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No bardana types found. Add your first type to get started.
                </TableCell>
              </TableRow>
            ) : (
              types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.code}</TableCell>
                  <TableCell>{type.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(type.rate_per_unit).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{type.opening_stock}</TableCell>
                  <TableCell>
                    <Badge variant={type.is_active ? "default" : "secondary"}>
                      {type.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteType(type)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BardanaTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editType={editType}
      />

      <AlertDialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bardana Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteType?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

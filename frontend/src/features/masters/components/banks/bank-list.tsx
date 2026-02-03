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
import { useBanks } from "../../hooks/use-banks"
import { bankService } from "../../api/banks"
import { BankDialog } from "./bank-dialog"
import type { Bank } from "../../types"

export function BankList() {
  const [search, setSearch] = React.useState("")
  const { banks, loading, error, refetch } = useBanks(undefined, search)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editBank, setEditBank] = React.useState<Bank | undefined>()
  const [deleteBank, setDeleteBank] = React.useState<Bank | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const handleEdit = (bank: Bank) => {
    setEditBank(bank)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditBank(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteBank) return

    setDeleting(true)
    try {
      await bankService.deleteBank(deleteBank.id)
      refetch()
    } catch (err) {
      console.error("Failed to delete bank:", err)
    } finally {
      setDeleting(false)
      setDeleteBank(null)
    }
  }

  if (loading && banks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading banks...</div>
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
          <h3 className="text-lg font-medium">Banks</h3>
          <p className="text-sm text-muted-foreground">
            Manage bank master for receipt tracking
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bank
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search banks..."
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
              <TableHead>Bank Name</TableHead>
              <TableHead>IFSC Pattern</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {search ? "No banks match your search." : "No banks found."}
                </TableCell>
              </TableRow>
            ) : (
              banks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell className="font-medium">{bank.code}</TableCell>
                  <TableCell>{bank.name}</TableCell>
                  <TableCell>{bank.ifsc_pattern || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={bank.is_active ? "default" : "secondary"}>
                      {bank.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(bank)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteBank(bank)}
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

      <BankDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetch}
        editBank={editBank}
      />

      <AlertDialog open={!!deleteBank} onOpenChange={() => setDeleteBank(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteBank?.name}"? This action cannot be undone.
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

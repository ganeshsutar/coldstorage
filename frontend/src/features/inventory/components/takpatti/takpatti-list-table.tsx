import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { Takpatti } from "../../types/takpatti"

interface TakpattiListTableProps {
  takpattis: Takpatti[]
  loading?: boolean
  onDelete?: (takpatti: Takpatti) => void
}

function formatWeight(kg: number): string {
  return `${kg.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function TakpattiListTable({
  takpattis,
  loading,
  onDelete,
}: TakpattiListTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (takpattis.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="takpatti-list-empty">
        No takpatti entries found
      </div>
    )
  }

  return (
    <Table data-testid="takpatti-list-table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-32">Takpatti No</TableHead>
          <TableHead className="w-24">Date</TableHead>
          <TableHead className="w-32">Amad No</TableHead>
          <TableHead>Party</TableHead>
          <TableHead className="text-right">Packets</TableHead>
          <TableHead className="text-right">Net Weight</TableHead>
          <TableHead className="w-24">Room/Floor</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {takpattis.map((takpatti, index) => (
          <TableRow key={takpatti.id} className="group" data-testid={`takpatti-row-${index}`}>
            <TableCell className="font-mono">{takpatti.takpatti_no}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(takpatti.date)}
            </TableCell>
            <TableCell className="font-mono">{takpatti.amad_no}</TableCell>
            <TableCell>{takpatti.party_name || "-"}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {takpatti.packets.toLocaleString("en-IN")}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatWeight(takpatti.net_weight)}
            </TableCell>
            <TableCell>
              {takpatti.room_number
                ? `${takpatti.room_number} / F${takpatti.floor_no}`
                : "-"}
            </TableCell>
            <TableCell>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Delete"
                      data-testid={`takpatti-row-delete-${index}`}
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Takpatti</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete takpatti{" "}
                        <strong>{takpatti.takpatti_no}</strong>? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete?.(takpatti)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="takpatti-delete-confirm"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

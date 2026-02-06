import * as React from "react"
import { PencilIcon, CheckIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSequences } from "../../hooks"
import type { SequenceConfig } from "../../types"

export function NumberSeriesSettings() {
  const { sequences, loading, error, refetch, updateSequence } = useSequences()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValues, setEditValues] = React.useState<{
    prefix: string
    separator: string
    include_year: boolean
    padding: number
  }>({ prefix: "", separator: "/", include_year: true, padding: 5 })
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  const startEdit = (seq: SequenceConfig) => {
    setEditingId(seq.id)
    setEditValues({
      prefix: seq.prefix,
      separator: seq.separator,
      include_year: seq.include_year,
      padding: seq.padding,
    })
    setSaveError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setSaveError(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      setSaving(true)
      setSaveError(null)
      await updateSequence(editingId, editValues)
      setEditingId(null)
      refetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Number Series</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Number Series</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive" data-testid="sequences-error-message">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number Series</CardTitle>
        <CardDescription>
          Configure auto-number formats for all document types. Changes apply to new records only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {saveError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4" data-testid="sequences-save-error">
            {saveError}
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Label</TableHead>
                <TableHead className="w-[100px]">Prefix</TableHead>
                <TableHead className="w-[80px]">Sep</TableHead>
                <TableHead className="w-[80px]">Year</TableHead>
                <TableHead className="w-[80px]">Padding</TableHead>
                <TableHead className="w-[180px]">Preview</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sequences.map((seq) => (
                <TableRow key={seq.id}>
                  <TableCell className="font-medium">{seq.label}</TableCell>

                  {editingId === seq.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={editValues.prefix}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, prefix: e.target.value }))
                          }
                          className="h-8 w-20 font-mono"
                          data-testid={`seq-${seq.key}-prefix-input`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editValues.separator}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, separator: e.target.value }))
                          }
                          className="h-8 w-14 font-mono text-center"
                          data-testid={`seq-${seq.key}-separator-input`}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={editValues.include_year}
                          onCheckedChange={(checked) =>
                            setEditValues((v) => ({ ...v, include_year: checked }))
                          }
                          data-testid={`seq-${seq.key}-year-switch`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={editValues.padding}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              padding: parseInt(e.target.value) || 5,
                            }))
                          }
                          className="h-8 w-16 font-mono text-center"
                          data-testid={`seq-${seq.key}-padding-input`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {seq.next_preview}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={saveEdit}
                            disabled={saving}
                            data-testid={`seq-${seq.key}-save-button`}
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={cancelEdit}
                            disabled={saving}
                            data-testid={`seq-${seq.key}-cancel-button`}
                          >
                            <XIcon className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <code className="text-sm">{seq.prefix || "—"}</code>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{seq.separator}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={seq.include_year ? "default" : "secondary"}>
                          {seq.include_year ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{seq.padding}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {seq.next_preview}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(seq)}
                          data-testid={`seq-${seq.key}-edit-button`}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

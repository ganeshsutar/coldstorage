import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChargesConfig } from "../../hooks"

const schema = z.object({
  katai1: z.coerce.number().min(0),
  katai2: z.coerce.number().min(0),
  katai3: z.coerce.number().min(0),
  load1: z.coerce.number().min(0),
  load2: z.coerce.number().min(0),
  load3: z.coerce.number().min(0),
  unload1: z.coerce.number().min(0),
  unload2: z.coerce.number().min(0),
  unload3: z.coerce.number().min(0),
  reload1: z.coerce.number().min(0),
  reload2: z.coerce.number().min(0),
  reload3: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

export function ChargesConfig() {
  const { config, loading, error, updateConfig } = useChargesConfig()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      katai1: 5,
      katai2: 4,
      katai3: 3,
      load1: 4,
      load2: 3.5,
      load3: 3,
      unload1: 4,
      unload2: 3.5,
      unload3: 3,
      reload1: 3,
      reload2: 2.5,
      reload3: 2,
    },
  })

  React.useEffect(() => {
    if (config) {
      form.reset(config)
    }
  }, [config, form])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateConfig(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading configuration...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labor Charges Configuration</CardTitle>
        <CardDescription>
          Configure default labor charges per bag by packet type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {saveError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Settings saved successfully
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Charge Type</TableHead>
                  <TableHead className="text-center">PKT1 (Rs)</TableHead>
                  <TableHead className="text-center">PKT2 (Rs)</TableHead>
                  <TableHead className="text-center">PKT3 (Rs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Grading (Katai)</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="katai1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="katai2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="katai3"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Loading</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="load1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="load2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="load3"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Unloading</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="unload1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="unload2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="unload3"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Reloading</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="reload1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="reload2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="reload3"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
                              className="text-center"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

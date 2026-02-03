import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { usePacketsConfig } from "../../hooks"

const schema = z.object({
  pkt1_name: z.string().min(1, "Required"),
  pkt1_weight: z.coerce.number().min(0),
  pkt2_name: z.string().min(1, "Required"),
  pkt2_weight: z.coerce.number().min(0),
  pkt3_name: z.string().min(1, "Required"),
  pkt3_weight: z.coerce.number().min(0),
  mix_packets: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function PacketsConfig() {
  const { config, loading, error, updateConfig } = usePacketsConfig()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pkt1_name: "80KG",
      pkt1_weight: 80,
      pkt2_name: "70KG",
      pkt2_weight: 70,
      pkt3_name: "50KG",
      pkt3_weight: 50,
      mix_packets: true,
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
        <CardTitle>Packet Configuration</CardTitle>
        <CardDescription>
          Configure packet types and their default weights
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
                  <TableHead className="w-[100px]">Packet Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Default Weight (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">PKT1</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="pkt1_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="e.g., 80KG"
                              disabled={saving}
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
                      name="pkt1_weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
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
                  <TableCell className="font-medium">PKT2</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="pkt2_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="e.g., 70KG"
                              disabled={saving}
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
                      name="pkt2_weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
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
                  <TableCell className="font-medium">PKT3</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="pkt3_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="e.g., 50KG"
                              disabled={saving}
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
                      name="pkt3_weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={saving}
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

            <FormField
              control={form.control}
              name="mix_packets"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Mixed Packets</FormLabel>
                    <FormDescription>
                      Allow different packet sizes in a single Amad entry
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={saving}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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

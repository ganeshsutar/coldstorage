import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCompanySettings } from "../../hooks"
import type { CompanySettings } from "../../types"

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  name_hindi: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gst_no: z.string().optional(),
  pan: z.string().optional(),
  tan: z.string().optional(),
  cin: z.string().optional(),
  owner_name: z.string().optional(),
  owner_aadhar: z.string().optional(),
  upi_id: z.string().optional(),
  fax: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

export function CompanySettingsForm() {
  const { settings, loading, error, updateSettings } = useCompanySettings()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      name_hindi: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      gst_no: "",
      pan: "",
      tan: "",
      cin: "",
      owner_name: "",
      owner_aadhar: "",
      upi_id: "",
      fax: "",
    },
  })

  React.useEffect(() => {
    if (settings) {
      form.reset({
        name: settings.name || "",
        name_hindi: settings.name_hindi || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        phone: settings.phone || "",
        email: settings.email || "",
        gst_no: settings.gst_no || "",
        pan: settings.pan || "",
        tan: settings.tan || "",
        cin: settings.cin || "",
        owner_name: settings.owner_name || "",
        owner_aadhar: settings.owner_aadhar || "",
        upi_id: settings.upi_id || "",
        fax: settings.fax || "",
      })
    }
  }, [settings, form])

  const onSubmit = async (data: CompanyFormData) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateSettings(data as Partial<CompanySettings>)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading company settings...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
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

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_hindi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Hindi)</FormLabel>
                    <FormControl>
                      <Input placeholder="कंपनी का नाम" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full address" disabled={saving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fax</FormLabel>
                    <FormControl>
                      <Input placeholder="Fax number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="company@example.com" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
            <CardDescription>Tax registration numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gst_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="GST Number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PAN Number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TAN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="TAN Number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CIN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="CIN Number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Proprietor details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Owner/Proprietor name" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner_aadhar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Aadhar</FormLabel>
                    <FormControl>
                      <Input placeholder="Aadhar number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="upi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="payment@upi" disabled={saving} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

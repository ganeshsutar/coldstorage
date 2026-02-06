import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useNextNumber } from "@/features/system"
import { useCreateEmployee } from "../../hooks"
import { usePayPosts } from "../../hooks"

export function EmployeeForm() {
  const navigate = useNavigate()
  const { nextNumber: nextEmpCode, loading: numberLoading } = useNextNumber("EMPLOYEE")
  const createEmployee = useCreateEmployee()
  const { data: payPosts } = usePayPosts()

  const [formData, setFormData] = React.useState({
    name: "",
    designation: "",
    department: "",
    phone: "",
    address: "",
    aadhaar: "",
    pan_number: "",
    bank_name: "",
    bank_account_no: "",
    bank_ifsc: "",
    bank_branch: "",
    uan: "",
    pf_applicable: false,
    esi_applicable: false,
    pay_post_id: "" as string,
    joining_date: new Date().toISOString().split("T")[0],
    basic_salary: 0,
    status: "ACTIVE",
  })

  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Employee name is required")
      return
    }

    setError(null)

    try {
      await createEmployee.mutateAsync({
        ...formData,
        pay_post_id: formData.pay_post_id || undefined,
        joining_date: formData.joining_date || undefined,
      })
      navigate({ to: "/app/payroll" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee")
    }
  }

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app/payroll" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Employee</h2>
          <p className="text-muted-foreground">Add a new employee to payroll</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Code:</span>
          <Input value={numberLoading ? "..." : nextEmpCode} readOnly className="bg-muted font-mono w-40 h-9" />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Employee name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Employee address"
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  value={formData.aadhaar}
                  onChange={(e) => updateField("aadhaar", e.target.value)}
                  placeholder="12-digit Aadhaar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  value={formData.pan_number}
                  onChange={(e) => updateField("pan_number", e.target.value)}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  placeholder="e.g., Manager, Supervisor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => updateField("department", e.target.value)}
                  placeholder="e.g., Operations, Admin"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pay_post">Pay Post</Label>
                <Select
                  value={formData.pay_post_id || "NONE"}
                  onValueChange={(v) => updateField("pay_post_id", v === "NONE" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay post" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {payPosts?.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.post_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => updateField("joining_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basic_salary">Basic Salary</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  min="0"
                  value={formData.basic_salary || ""}
                  onChange={(e) => updateField("basic_salary", parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="PROBATION">Probation</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => updateField("bank_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_no">Account Number</Label>
                <Input
                  id="bank_account_no"
                  value={formData.bank_account_no}
                  onChange={(e) => updateField("bank_account_no", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_ifsc">IFSC Code</Label>
                <Input
                  id="bank_ifsc"
                  value={formData.bank_ifsc}
                  onChange={(e) => updateField("bank_ifsc", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_branch">Branch</Label>
                <Input
                  id="bank_branch"
                  value={formData.bank_branch}
                  onChange={(e) => updateField("bank_branch", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statutory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="uan">UAN (PF Account)</Label>
                <Input
                  id="uan"
                  value={formData.uan}
                  onChange={(e) => updateField("uan", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.pf_applicable}
                  onCheckedChange={(v) => updateField("pf_applicable", v)}
                />
                <Label>PF Applicable</Label>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.esi_applicable}
                  onCheckedChange={(v) => updateField("esi_applicable", v)}
                />
                <Label>ESI Applicable</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/app/payroll" })}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={createEmployee.isPending}>
          {createEmployee.isPending ? "Saving..." : "Save Employee"}
        </Button>
      </div>
    </div>
  )
}

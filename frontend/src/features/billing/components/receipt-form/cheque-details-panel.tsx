import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export interface ChequeDetails {
  cheque_no: string
  cheque_date: string
  bank_name: string
  branch_name: string
  is_pdc: boolean
  is_cleared: boolean
}

interface ChequeDetailsPanelProps {
  details: ChequeDetails
  onChange: (details: ChequeDetails) => void
  disabled?: boolean
}

export function ChequeDetailsPanel({
  details,
  onChange,
  disabled,
}: ChequeDetailsPanelProps) {
  const handleChange = (field: keyof ChequeDetails, value: string | boolean) => {
    onChange({ ...details, [field]: value })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cheque Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cheque_no">Cheque Number *</Label>
            <Input
              id="cheque_no"
              value={details.cheque_no}
              onChange={(e) => handleChange("cheque_no", e.target.value)}
              placeholder="Enter cheque number"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cheque_date">Cheque Date</Label>
            <Input
              id="cheque_date"
              type="date"
              value={details.cheque_date}
              onChange={(e) => handleChange("cheque_date", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank *</Label>
            <Input
              id="bank_name"
              value={details.bank_name}
              onChange={(e) => handleChange("bank_name", e.target.value)}
              placeholder="Bank name"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch_name">Branch</Label>
            <Input
              id="branch_name"
              value={details.branch_name}
              onChange={(e) => handleChange("branch_name", e.target.value)}
              placeholder="Branch name"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_pdc"
              checked={details.is_pdc}
              onCheckedChange={(checked) =>
                handleChange("is_pdc", checked as boolean)
              }
              disabled={disabled}
            />
            <Label htmlFor="is_pdc" className="text-sm font-normal cursor-pointer">
              Post-dated cheque (PDC)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_cleared"
              checked={details.is_cleared}
              onCheckedChange={(checked) =>
                handleChange("is_cleared", checked as boolean)
              }
              disabled={disabled}
            />
            <Label htmlFor="is_cleared" className="text-sm font-normal cursor-pointer">
              Mark as cleared
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

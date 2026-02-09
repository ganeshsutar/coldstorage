import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { accountsService } from "../../api/accounts"
import {
  PARTY_TYPE_LABELS,
  GUARDIAN_RELATION_LABELS,
  INTEREST_ON_BARDANA_LABELS,
} from "../../types/account"
import type {
  PartyType,
  GuardianRelation,
  CalculateInterestOnBardana,
} from "../../types/account"

const partySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  village: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  party_type: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_relation: z.string().optional(),
  village_hindi: z.string().optional(),
  tin_number: z.string().optional(),
  guarantor_name: z.string().optional(),
  remark: z.string().optional(),
  charge_interest_from: z.string().optional(),
  depreciation_rate: z.number().min(0).optional(),
  dr_limit: z.number().min(0).optional(),
  sauda_limit: z.number().min(0).optional(),
  due_days: z.number().min(0).optional(),
  calculate_interest_on_bardana: z.string().optional(),
})

type PartyFormData = z.infer<typeof partySchema>

interface AddPartyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddPartyDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPartyDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const form = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      code: "",
      name: "",
      phone: "",
      address: "",
      village: "",
      credit_limit: 0,
      party_type: "",
      guardian_name: "",
      guardian_relation: "",
      village_hindi: "",
      tin_number: "",
      guarantor_name: "",
      remark: "",
      charge_interest_from: "",
      depreciation_rate: 0,
      dr_limit: 0,
      sauda_limit: 0,
      due_days: 0,
      calculate_interest_on_bardana: "",
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form

  const onSubmit = async (data: PartyFormData) => {
    try {
      setLoading(true)
      await accountsService.createParty({
        code: data.code,
        name: data.name,
        type: "liability",
        category: "balance_sheet",
        parent_id: null,
        is_party: true,
        phone: data.phone,
        address: data.address,
        village: data.village,
        credit_limit: data.credit_limit,
        party_type: (data.party_type || undefined) as PartyType | undefined,
        guardian_name: data.guardian_name || undefined,
        guardian_relation: (data.guardian_relation || undefined) as GuardianRelation | undefined,
        village_hindi: data.village_hindi || undefined,
        tin_number: data.tin_number || undefined,
        guarantor_name: data.guarantor_name || undefined,
        remark: data.remark || undefined,
        charge_interest_from: data.charge_interest_from || undefined,
        depreciation_rate: data.depreciation_rate || undefined,
        dr_limit: data.dr_limit || undefined,
        sauda_limit: data.sauda_limit || undefined,
        due_days: data.due_days || undefined,
        calculate_interest_on_bardana: (data.calculate_interest_on_bardana || undefined) as CalculateInterestOnBardana | undefined,
      })
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create party:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="add-party-dialog" className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Party</DialogTitle>
          <DialogDescription>
            Create a new party account. Party accounts are automatically
            classified under Party Accounts group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full gap-4">
            <TabsList className="grid h-auto w-full grid-cols-3 p-1">
              <TabsTrigger data-testid="add-party-tab-basic" value="basic">Basic Info</TabsTrigger>
              <TabsTrigger data-testid="add-party-tab-details" value="details">Identity & Details</TabsTrigger>
              <TabsTrigger data-testid="add-party-tab-financial" value="financial">Financial Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Party Code</Label>
                  <Input
                    id="code"
                    data-testid="add-party-code-input"
                    {...register("code")}
                    placeholder="e.g., 5001"
                  />
                  {errors.code && (
                    <p data-testid="add-party-code-error" className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Party Type</Label>
                  <Select
                    value={watch("party_type") || ""}
                    onValueChange={(value) => setValue("party_type", value)}
                  >
                    <SelectTrigger data-testid="add-party-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PARTY_TYPE_LABELS) as [PartyType, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Party Name</Label>
                <Input
                  id="name"
                  data-testid="add-party-name-input"
                  {...register("name")}
                  placeholder="e.g., Ram Singh"
                />
                {errors.name && (
                  <p data-testid="add-party-name-error" className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    data-testid="add-party-phone-input"
                    {...register("phone")}
                    placeholder="e.g., 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    data-testid="add-party-village-input"
                    {...register("village")}
                    placeholder="e.g., Jhajjar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    data-testid="add-party-guardian-name-input"
                    {...register("guardian_name")}
                    placeholder="e.g., Shyam Singh"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Guardian Relation</Label>
                  <Select
                    value={watch("guardian_relation") || ""}
                    onValueChange={(value) => setValue("guardian_relation", value)}
                  >
                    <SelectTrigger data-testid="add-party-guardian-relation-select">
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(GUARDIAN_RELATION_LABELS) as [GuardianRelation, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  data-testid="add-party-address-input"
                  {...register("address")}
                  placeholder="Full address"
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tin_number">TIN Number</Label>
                  <Input
                    id="tin_number"
                    data-testid="add-party-tin-input"
                    {...register("tin_number")}
                    placeholder="TIN number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guarantor_name">Guarantor Name</Label>
                  <Input
                    id="guarantor_name"
                    data-testid="add-party-guarantor-input"
                    {...register("guarantor_name")}
                    placeholder="Guarantor name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village_hindi">Village (Hindi)</Label>
                <Input
                  id="village_hindi"
                  data-testid="add-party-village-hindi-input"
                  {...register("village_hindi")}
                  placeholder="Village name in Hindi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark">Remark</Label>
                <Textarea
                  id="remark"
                  data-testid="add-party-remark-input"
                  {...register("remark")}
                  placeholder="Any additional notes"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    data-testid="add-party-credit-limit-input"
                    type="number"
                    {...register("credit_limit", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dr_limit">DR Limit</Label>
                  <Input
                    id="dr_limit"
                    data-testid="add-party-dr-limit-input"
                    type="number"
                    {...register("dr_limit", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depreciation_rate">Depreciation Rate (%)</Label>
                  <Input
                    id="depreciation_rate"
                    data-testid="add-party-depreciation-rate-input"
                    type="number"
                    step="0.01"
                    {...register("depreciation_rate", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interest on Bardana</Label>
                  <Select
                    value={watch("calculate_interest_on_bardana") || ""}
                    onValueChange={(value) => setValue("calculate_interest_on_bardana", value)}
                  >
                    <SelectTrigger data-testid="add-party-interest-bardana-select">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(INTEREST_ON_BARDANA_LABELS) as [CalculateInterestOnBardana, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="charge_interest_from">Charge Interest From</Label>
                  <Input
                    id="charge_interest_from"
                    data-testid="add-party-charge-interest-from-input"
                    type="date"
                    {...register("charge_interest_from")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_days">Due Days</Label>
                  <Input
                    id="due_days"
                    data-testid="add-party-due-days-input"
                    type="number"
                    {...register("due_days", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sauda_limit">Sauda Limit</Label>
                <Input
                  id="sauda_limit"
                  data-testid="add-party-sauda-limit-input"
                  type="number"
                  {...register("sauda_limit", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-testid="add-party-cancel-button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="add-party-submit-button" disabled={loading}>
              {loading ? "Creating..." : "Create Party"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

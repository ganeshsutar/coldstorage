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
import { accountsService } from "../../api/accounts"

const partySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  village: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
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
    },
  })

  const {
    register,
    handleSubmit,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Party</DialogTitle>
          <DialogDescription>
            Create a new party account. Party accounts are automatically
            classified under Party Accounts group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Party Code</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g., 5001"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="e.g., 9876543210"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Party Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Ram Singh"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="village">Village</Label>
            <Input
              id="village"
              {...register("village")}
              placeholder="e.g., Jhajjar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Credit Limit</Label>
            <Input
              id="credit_limit"
              type="number"
              {...register("credit_limit", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Party"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

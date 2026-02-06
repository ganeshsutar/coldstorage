import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TakpattiForm } from "./takpatti-form"
import {
  useAmads,
  useRooms,
  takpattiService,
  type CreateTakpattiRequest,
} from "../../index"

interface TakpattiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TakpattiDialog({ open, onOpenChange, onSuccess }: TakpattiDialogProps) {
  const { amads } = useAmads()
  const { rooms } = useRooms(true)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (data: CreateTakpattiRequest) => {
    setLoading(true)
    setError(null)

    try {
      await takpattiService.createTakpatti(data)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create takpatti"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Takpatti</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
            {error}
          </div>
        )}

        <TakpattiForm
          amads={amads}
          rooms={rooms}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}

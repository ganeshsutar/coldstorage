import * as React from "react"
import { ScaleIcon, PlusIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function TakpattiPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <DashboardLayout activeNavItemId="takpatti">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Takpatti</h1>
            <p className="text-sm text-muted-foreground">
              Weighment slips for inventory items
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Takpatti
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Takpatti</DialogTitle>
                <DialogDescription>
                  Create a new weighment slip for inventory items.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center text-muted-foreground">
                Takpatti form coming soon...
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Weighment Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ScaleIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                The Takpatti module for managing weighment slips is under development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

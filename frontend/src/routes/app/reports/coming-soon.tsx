import { Link, useRouter } from "@tanstack/react-router"
import { ArrowLeft, Construction } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ComingSoonPage() {
  const router = useRouter()
  const pathname = router.state.location.pathname
  const pageName = pathname
    .split("/")
    .pop()
    ?.replace(/-/g, " ")
    ?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Report"

  return (
    <DashboardLayout
      activeNavItemId="reports"
      breadcrumbs={[
        { label: "Reports", to: "/app/reports" },
        { label: pageName },
      ]}
    >
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <div className="rounded-full bg-muted p-4">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{pageName}</h2>
              <p className="text-muted-foreground">
                This report is coming soon. Check back later for updates.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/app/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

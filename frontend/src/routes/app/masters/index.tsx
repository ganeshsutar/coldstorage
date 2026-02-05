import { Database, Package, MapPin, Building2, Receipt, Hammer } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CommodityList,
  VillageList,
  BankList,
  GstRateList,
  LaborRateGrid,
} from "@/features/masters"

export function MastersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Masters</h1>
          </div>
          <p className="text-muted-foreground">
            Manage reference data for commodities, locations, banks, and rates
          </p>
        </div>

        {/* Tabs with left sidebar - matches Settings layout */}
        <Tabs defaultValue="commodities" className="flex flex-row items-start gap-8">
          <TabsList className="flex flex-col h-auto w-52 shrink-0 bg-transparent border rounded-lg p-2 gap-1">
            <TabsTrigger value="commodities" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Package className="h-4 w-4" />
              Commodities
            </TabsTrigger>
            <TabsTrigger value="villages" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <MapPin className="h-4 w-4" />
              Villages
            </TabsTrigger>
            <TabsTrigger value="banks" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Building2 className="h-4 w-4" />
              Banks
            </TabsTrigger>
            <TabsTrigger value="gst-rates" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Receipt className="h-4 w-4" />
              GST Rates
            </TabsTrigger>
            <TabsTrigger value="labor-rates" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Hammer className="h-4 w-4" />
              Labor Rates
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent value="commodities" className="mt-0">
              <CommodityList />
            </TabsContent>
            <TabsContent value="villages" className="mt-0">
              <VillageList />
            </TabsContent>
            <TabsContent value="banks" className="mt-0">
              <BankList />
            </TabsContent>
            <TabsContent value="gst-rates" className="mt-0">
              <GstRateList />
            </TabsContent>
            <TabsContent value="labor-rates" className="mt-0">
              <LaborRateGrid />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

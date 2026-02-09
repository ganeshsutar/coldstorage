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
    <DashboardLayout activeNavItemId="masters" breadcrumbs={[{ label: "Masters" }]}>
      <Tabs defaultValue="commodities" className="gap-4">
        <TabsList>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="villages">Villages</TabsTrigger>
          <TabsTrigger value="banks">Banks</TabsTrigger>
          <TabsTrigger value="gst-rates">GST Rates</TabsTrigger>
          <TabsTrigger value="labor-rates">Labor Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="commodities">
          <CommodityList />
        </TabsContent>
        <TabsContent value="villages">
          <VillageList />
        </TabsContent>
        <TabsContent value="banks">
          <BankList />
        </TabsContent>
        <TabsContent value="gst-rates">
          <GstRateList />
        </TabsContent>
        <TabsContent value="labor-rates">
          <LaborRateGrid />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

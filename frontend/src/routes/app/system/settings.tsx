import { Settings } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CompanySettingsForm,
  TaxSettingsForm,
  BankSettingsForm,
  FinancialYearForm,
  UserList,
  PermissionEditor,
  GeneralConfig,
  RentConfig,
  InterestConfig,
  PacketsConfig,
  ChargesConfig,
  AuditLogTable,
  DashboardSettingsForm,
  SeedDataCard,
  NumberSeriesSettings,
} from "@/features/system"

export function SystemSettingsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Settings" }]} activeNavItemId="settings">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Settings className="size-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your organization settings, users, and system configuration
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="company" className="gap-4">
          <TabsList>
            <TabsTrigger value="company" data-testid="system-tab-company">Company Info</TabsTrigger>
            <TabsTrigger value="users" data-testid="system-tab-users">Users</TabsTrigger>
            <TabsTrigger value="permissions" data-testid="system-tab-permissions">Permissions</TabsTrigger>
            <TabsTrigger value="configuration" data-testid="system-tab-configuration">Configuration</TabsTrigger>
            <TabsTrigger value="sequences" data-testid="system-tab-sequences">Number Series</TabsTrigger>
            <TabsTrigger value="audit" data-testid="system-tab-audit">Audit Log</TabsTrigger>
            <TabsTrigger value="dashboard" data-testid="system-tab-dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <CompanySettingsForm />
            <TaxSettingsForm />
            <BankSettingsForm />
            <FinancialYearForm />
          </TabsContent>

          <TabsContent value="users">
            <UserList />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionEditor />
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            <Tabs defaultValue="general" className="gap-4">
              <TabsList>
                <TabsTrigger value="general" data-testid="config-tab-general">General</TabsTrigger>
                <TabsTrigger value="rent" data-testid="config-tab-rent">Rent</TabsTrigger>
                <TabsTrigger value="interest" data-testid="config-tab-interest">Interest</TabsTrigger>
                <TabsTrigger value="packets" data-testid="config-tab-packets">Packets</TabsTrigger>
                <TabsTrigger value="charges" data-testid="config-tab-charges">Charges</TabsTrigger>
                <TabsTrigger value="seed-data" data-testid="config-tab-seed-data">Seed Data</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralConfig />
              </TabsContent>
              <TabsContent value="rent">
                <RentConfig />
              </TabsContent>
              <TabsContent value="interest">
                <InterestConfig />
              </TabsContent>
              <TabsContent value="packets">
                <PacketsConfig />
              </TabsContent>
              <TabsContent value="charges">
                <ChargesConfig />
              </TabsContent>
              <TabsContent value="seed-data">
                <SeedDataCard />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="sequences">
            <NumberSeriesSettings />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogTable />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardSettingsForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

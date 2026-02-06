import {
  Settings,
  Building2,
  Users,
  Shield,
  Wrench,
  ScrollText,
  LayoutDashboard,
} from "lucide-react"

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
} from "@/features/system"

export function SystemSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your organization settings, users, and system configuration
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="company" className="flex flex-row items-start gap-8">
          <TabsList className="flex flex-col h-auto w-52 shrink-0 bg-transparent border rounded-lg p-2 gap-1">
            <TabsTrigger value="company" data-testid="system-tab-company" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Building2 className="h-4 w-4" />
              Company Info
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="system-tab-users" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" data-testid="system-tab-permissions" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="configuration" data-testid="system-tab-configuration" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <Wrench className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="system-tab-audit" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <ScrollText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="dashboard" data-testid="system-tab-dashboard" className="w-full justify-start gap-2 px-3 data-[state=active]:bg-muted">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            {/* Company Info Tab */}
            <TabsContent value="company" className="mt-0 space-y-6">
              <CompanySettingsForm />
              <TaxSettingsForm />
              <BankSettingsForm />
              <FinancialYearForm />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-0">
              <UserList />
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="mt-0">
              <PermissionEditor />
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="configuration" className="mt-0 space-y-4">
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general" data-testid="config-tab-general">General</TabsTrigger>
                  <TabsTrigger value="rent" data-testid="config-tab-rent">Rent</TabsTrigger>
                  <TabsTrigger value="interest" data-testid="config-tab-interest">Interest</TabsTrigger>
                  <TabsTrigger value="packets" data-testid="config-tab-packets">Packets</TabsTrigger>
                  <TabsTrigger value="charges" data-testid="config-tab-charges">Charges</TabsTrigger>
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
              </Tabs>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="mt-0">
              <AuditLogTable />
            </TabsContent>

            {/* Dashboard Settings Tab */}
            <TabsContent value="dashboard" className="mt-0">
              <DashboardSettingsForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

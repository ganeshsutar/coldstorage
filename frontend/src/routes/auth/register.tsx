import { AuthLayout } from "@/components/layout/auth-layout"
import { RegisterForm } from "@/features/auth"

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}

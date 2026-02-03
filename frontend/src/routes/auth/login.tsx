import { AuthLayout } from "@/components/layout/auth-layout"
import { LoginForm } from "@/features/auth"

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

import { AuthLayout } from "@/components/layout/auth-layout"
import { ForgotPasswordForm } from "@/features/auth"

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

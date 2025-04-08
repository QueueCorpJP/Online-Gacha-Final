import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="container flex w-screen flex-col items-center justify-center py-12 mx-auto">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
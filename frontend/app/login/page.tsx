import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "ログイン | SHIJON",
  description: "アカウントにログインしてガチャを楽しもう！",
}

export default function LoginPage() {
  return (
    <div className="container relative flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0 py-12 px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
        <LoginForm />
      </div>
    </div>
  )
}

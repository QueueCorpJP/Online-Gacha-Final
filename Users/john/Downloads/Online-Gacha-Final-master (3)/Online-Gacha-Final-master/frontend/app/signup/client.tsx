"use client"

import { SignUpForm } from "@/components/signup-form"
import { useTranslations } from "@/hooks/use-translations"
import Link from "next/link"

export default function SignUpClient() {
  const { t } = useTranslations()

  return (
    <div className="container relative flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0 py-4 px-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="rounded-2xl border bg-white md:p-8 p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">{t("signup.title")}</h1>
            <p className="text-gray-500">{t("signup.description")}</p>
          </div>
          <SignUpForm />
          <div className="mt-4 text-center text-sm text-gray-500">
            {t("signup.haveAccount")}
            <Link href="/login" className="text-[#7C3AED] hover:text-[#6D28D9] ml-1">
              {t("signup.loginLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
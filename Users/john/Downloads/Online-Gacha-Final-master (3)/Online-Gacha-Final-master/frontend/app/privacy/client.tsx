"use client"

import { PrivacyPolicy } from "@/components/privacy/privacy-policy"
import { useTranslations } from "@/hooks/use-translations"

export default function PrivacyClient() {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-[#111827]">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          {t("privacy.title")}
        </h1>
        <PrivacyPolicy />
      </div>
    </div>
  )
}
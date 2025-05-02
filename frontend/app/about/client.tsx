"use client"

import { CompanyInfo } from "@/components/about/company-info"
import { useTranslations } from "@/hooks/use-translations"

export default function AboutClient() {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-[#111827]">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          会社概要
        </h1>
        <CompanyInfo />
      </div>
    </div>
  )
}
"use client"

import { TransactionDetails } from "@/components/legal/transaction-details"
import { useTranslations } from "@/hooks/use-translations"

export default function LegalClient() {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-[#111827]">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          {t("legal.title")}
        </h1>
        <TransactionDetails />
      </div>
    </div>
  )
} 
"use client"

import { TermsOfService } from "@/components/terms/terms-of-service"
import { useTranslations } from "@/hooks/use-translations"

export default function TermsClient() {
    const { t } = useTranslations()
    
    return (
        <div className="min-h-screen bg-white px-4 py-12 text-[#111827]">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-8 text-center text-3xl font-bold">
                    {t("terms.title")}
                </h1>
                <TermsOfService />
            </div>
        </div>
    )
}
"use client"

import { useTranslations } from "@/hooks/use-translations"

export function TermsOfService() {
    const { t } = useTranslations()

    return (
        <div className="space-y-8 rounded-lg borde bg-white p-8">
            {Object.entries(t("terms.sections")).map(([key, section]) => (
                <section key={key} className="space-y-4">
                    <h2 className="text-xl font-bold text-[#111827]">{section.title}</h2>
                    <div className="whitespace-pre-line text-[#4B5563]">{section.content}</div>
                </section>
            ))}
            <div className="mt-8 text-center text-sm text-[#4B5563]">
                <p>{t("terms.footer.conclusion")}</p>
                <p className="mt-4">
                    {t("terms.established", { date: "2024年1月10日" })}
                </p>
                <p>{t("terms.lastUpdated", { date: "2025年1月10日" })}</p>
            </div>
        </div>
    )
}


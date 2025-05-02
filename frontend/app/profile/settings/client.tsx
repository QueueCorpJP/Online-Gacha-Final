"use client"

import { ProfileTabs } from "@/components/profile/profile-tabs"
import { LineSettings } from "@/components/profile/settings/line-settings"
import { OtherSettings } from "@/components/profile/settings/other-settings"
import { LanguageSelector } from "@/components/profile/settings/language-selector"
import { useTranslations } from "@/hooks/use-translations"

export default function SettingsClient() {
    const { t } = useTranslations()

    return (
        <div className="bg-[#F8FAFC] xl:px-20 xl:py-8">
            <h1 className="px-4 py-4 text-xl font-bold">{t("profile.pageTitle")}</h1>
            <ProfileTabs />
            <div className="container-fluid py-6 px-4 lg:px-0">
                <div className="rounded-lg border bg-white p-6 mb-6">
                    <LanguageSelector />
                </div>
                <div className="rounded-lg border bg-white p-6 mb-6">
                    <LineSettings />
                </div>
                <div className="rounded-lg border bg-white p-6">
                    <OtherSettings />
                </div>
            </div>
        </div>
    )
}
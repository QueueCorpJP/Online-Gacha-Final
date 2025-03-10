"use client"

import { useTranslations } from "@/hooks/use-translations"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { ProfileForm } from "@/components/profile/profile-form"

export default function ProfileClient() {
  const { t } = useTranslations()

  return (
    <div className="bg-[#F8FAFC] xl:px-20 xl:py-8">
      <h1 className="px-4 py-4 text-xl font-bold">{t("profile.pageTitle")}</h1>
      <ProfileTabs />
      <div className="container-fluid py-6 px-4 lg:px-0">
        <ProfileForm />
      </div>
    </div>
  )
}
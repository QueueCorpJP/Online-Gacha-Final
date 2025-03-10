"use client"

import { useTranslations } from "@/hooks/use-translations"
import { PointsBalance } from "@/components/profile/points/points-balance"
import { PointsHistory } from "@/components/profile/points/points-history"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default function PointsClient() {
  const { t } = useTranslations()

  return (
    <div className="bg-[#F8FAFC] xl:px-20 xl:py-8">
      <h1 className="px-4 py-4 text-xl font-bold">{t("profile.pageTitle")}</h1>
      <ProfileTabs />
      <div className="container-fluid py-6 px-4 lg:px-0">
        <div className="rounded-lg border bg-white p-6 mb-6">
          <PointsBalance points={1234} />
        </div>
        <div className="rounded-lg border bg-white p-6">
          <PointsHistory />
        </div>
      </div>
    </div>
  )
}
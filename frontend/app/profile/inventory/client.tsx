"use client"

import { useTranslations } from "@/hooks/use-translations"
import { InventoryGrid } from "@/components/profile/inventory/inventory-grid"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default function InventoryClient() {
  const { t } = useTranslations()

  return (
    <div className="bg-[#F8FAFC] xl:px-20 xl:py-8">
      <h1 className="px-4 py-4 text-xl font-bold">{t("profile.pageTitle")}</h1>
      <ProfileTabs />
      <div className="container-fluid py-6 px-4 lg:px-0">
        <InventoryGrid />
      </div>
    </div>
  )
}
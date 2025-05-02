"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { useTranslations } from "@/hooks/use-translations"
import { PointsBalance } from "@/components/profile/points/points-balance"
import { PointsHistory } from "@/components/profile/points/points-history"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { fetchProfile } from "@/redux/features/profileSlice"

export default function PointsClient() {
  const { t } = useTranslations()
  const dispatch = useDispatch<AppDispatch>()
  
  useEffect(() => {
    // ポイントページマウント時にプロフィール情報を取得
    dispatch(fetchProfile())
  }, [dispatch])

  return (
    <div className="bg-[#F8FAFC] xl:px-20 xl:py-8">
      <h1 className="px-4 py-4 text-xl font-bold">{t("profile.pageTitle")}</h1>
      <ProfileTabs />
      <div className="container-fluid py-6 px-4 lg:px-0">
        <div className="rounded-lg border bg-white p-6 mb-6">
          <PointsBalance />
        </div>
        <div className="rounded-lg border bg-white p-6">
          <PointsHistory />
        </div>
      </div>
    </div>
  )
}
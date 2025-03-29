"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { InviteCode } from "@/components/profile/invite/invite-code"
import { InviteForm } from "@/components/profile/invite/invite-form"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { generateInviteCode } from "@/redux/features/inviteSlice"
import type { AppDispatch, RootState } from "@/redux/store"
import { useTranslations } from "@/hooks/use-translations"

export default function InviteClient() {
  const { t } = useTranslations()
  const dispatch = useDispatch<AppDispatch>()
  const { inviteCode } = useSelector((state: RootState) => state.invite)

  useEffect(() => {
    if (!inviteCode) {
      const response = dispatch(generateInviteCode()).unwrap()
      console.log('Generated invite code:', response)
    }
  }, [dispatch, inviteCode])

  return (
    <div className="bg-[#F8FAFC] xl:px-20 xl:py-8">
      <h1 className="px-4 py-4 text-xl font-bold">{t("profile.pageTitle")}</h1>
      <ProfileTabs />
      <div className="container-fluid py-6 px-4 lg:px-0">
        <InviteCode />
        <InviteForm />
      </div>
    </div>
  )
}
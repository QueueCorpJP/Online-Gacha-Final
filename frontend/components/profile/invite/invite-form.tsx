"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { submitInviteCode } from "@/redux/features/inviteSlice"
import type { AppDispatch, RootState } from "@/redux/store"

export function InviteForm() {
  const [inviteCode, setInviteCode] = useState("")
  const { t } = useTranslations()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.invite)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteCode) {
      toast.error(t("profile.inviteForm.messages.required"))
      return
    }

    try {
      await dispatch(submitInviteCode(inviteCode)).unwrap()
      toast.success(t("profile.inviteForm.messages.success"))
      setInviteCode("")
    } catch (error) {
      toast.error(t("profile.inviteForm.messages.error"))
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-xl font-bold">{t("profile.inviteForm.title")}</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inviteCode">{t("profile.inviteForm.label")}</Label>
          <Input
            id="inviteCode"
            placeholder={t("profile.inviteForm.placeholder")}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button 
          type="submit" 
          className="bg-black hover:bg-gray-800 w-full"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <span>{t("common.loading")}</span>
            </div>
          ) : (
            t("profile.inviteForm.submit")
          )}
        </Button>
      </form>
    </div>
  )
}

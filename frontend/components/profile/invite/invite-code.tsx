"use client"

import { useEffect, useState } from "react"
import { Copy, Facebook, Twitter } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { generateInviteCode, fetchInviteStats } from "@/redux/features/inviteSlice"
import type { AppDispatch, RootState } from "@/redux/store"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function InviteCode() {
  const { t } = useTranslations()
  const dispatch = useDispatch<AppDispatch>()
  const [isCopied, setIsCopied] = useState(false)
  
  const { inviteCode, loading, error, inviteStats } = useSelector(
    (state: RootState) => state.invite
  )

  useEffect(() => {
    if (!inviteCode) {
      dispatch(generateInviteCode())
    }
    dispatch(fetchInviteStats())
  }, [dispatch, inviteCode])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode || '')
      setIsCopied(true)
      toast.success(t("profile.invite.copy.success"))
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error(t("profile.invite.copy.error"))
    }
  }

  const shareOnX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(t("profile.invite.share.message", { code: inviteCode || '' }))}`,
      "_blank",
    )
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="rounded-lg border bg-white p-6 mb-6">
      <h2 className="text-xl font-bold">{t("profile.invite.title")}</h2>
      {inviteStats && (
        <div className="mt-2 text-sm text-gray-600">
          <p>{t("profile.invite.stats.total")}: {inviteStats.totalInvites}</p>
        </div>
      )}
      <div className="mt-4 space-y-4">
        <div className="flex gap-2">
          <Input value={inviteCode || ''} readOnly className="font-mono" />
          <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" className="w-full" onClick={shareOnX}>
            <Twitter className="mr-2 h-4 w-4" />
            {t("profile.invite.share.x")}
          </Button>
          <Button variant="outline" className="w-full" onClick={shareOnFacebook}>
            <Facebook className="mr-2 h-4 w-4" />
            {t("profile.invite.share.facebook")}
          </Button>
        </div>
      </div>
    </div>
  )
}

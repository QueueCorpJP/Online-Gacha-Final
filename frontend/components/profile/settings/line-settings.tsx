"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTranslations } from "@/hooks/use-translations"
import { toast } from "sonner"
import { AppDispatch, RootState } from "@/redux/store"
import { api } from "@/lib/axios"
import {
  connectLine,
  disconnectLine,
  updateLineNotifications,
  fetchLineSettings
} from "@/redux/features/lineSettingsSlice"
import Link from "next/link"
import axios from 'axios'
import { Copy } from "lucide-react"

export function LineSettings() {
  const [mounted, setMounted] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");
  const { data: user } = useSelector((state: RootState) => state.profile)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    api.get('/user/line/login')
      .then((response) => setLoginUrl(response.data.url.url))
      .catch((error) => {
        console.error('Failed to fetch LINE login URL:', error);
        toast.error(t("line.messages.loginUrlError"));
      });
  }, []);

  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslations()

  const {
    isConnected,
    notifications,
    loading: isLoading,
    error
  } = useSelector((state: RootState) => state.lineSettings)

  useEffect(() => {
    setMounted(true)
    dispatch(fetchLineSettings())
  }, [dispatch])

  useEffect(() => {
    if (error && typeof error === 'string') {
      toast.error(error)
    }
  }, [error])

  const handleConnect = async () => {
    try {
      // const result = await dispatch(connectLine()).unwrap()
      // if (result.lineAuthUrl) {
      //   // Redirect to LINE login
      //   window.location.href = result.login
      // }
      window.open("https://line.me/R/ti/p/@577vaiyc", '_blank');
    } catch (err) {
      toast.error(t("line.messages.connectError"))
    }
  }

  const handleDisconnect = async () => {
    try {
      const result = await dispatch(disconnectLine()).unwrap()
      if (result.success) {
        toast.success(t("line.messages.disconnectSuccess"))
      }
    } catch (err) {
      toast.error(t("line.messages.disconnectError"))
    }
  }

  const handleNotificationChange = async (checked: boolean) => {
    try {
      console.log(checked)
      const result = await dispatch(updateLineNotifications(checked)).unwrap()
      if (result.success) {
        toast.success(t("line.messages.notificationSuccess"))
      }
    } catch (err) {
      toast.error(t("line.messages.notificationError"))
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(`CONNECT:${user?.id}`)
      setIsCopied(true)
      toast.success(t("line.messages.codeCopied"))
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error(t("line.messages.copyError"))
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("line.title")}</h2>
        <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-gray-500'}`}>
          {isConnected
            ? t("line.connectionStatus.connected")
            : t("line.connectionStatus.disconnected")
          }
        </span>
      </div>

      {!isConnected && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-2">{t("line.connectionInstructions.title")}</p>
          <ol className="list-decimal pl-4 space-y-1">
          <li>{t("line.connectionInstructions.step2")}</li>
            <li>{t("line.connectionInstructions.step1")}</li>
            <li>{t("line.connectionInstructions.step3")}</li>
          </ol>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="line-notifications">{t("line.notifications")}</Label>
          <p className="text-sm text-gray-500">
            {t("line.notificationsDescription")}
          </p>
        </div>
        <Switch
          id="line-notifications"
          checked={Boolean(notifications)}
          onCheckedChange={handleNotificationChange}
          disabled={!isConnected || isLoading}
        />
      </div>

      <div className="space-y-2">
        <Button
          variant={isConnected ? "outline" : "default"}
          className="w-full"
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {t("common.loading")}
            </span>
          ) : (
            isConnected ? t("line.disconnect") : t("line.connect")
          )}
        </Button>

        {!isConnected && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopyCode}
            disabled={!user?.id}
          >
            <Copy className="mr-2 h-4 w-4" />
            {isCopied ? t("line.codeCopied") : t("line.copyCode")}
          </Button>
        )}
      </div>
    </div>
  )
}


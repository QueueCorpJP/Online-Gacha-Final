"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { RootState } from "@/redux/store"
import { fetchInventorySettings, updateInventorySettings } from "@/redux/features/inventorySettingsSlice"
import type { InventorySettingsState } from '@/redux/features/inventorySettingsSlice'
import { Loader2 } from 'lucide-react'
import { useTranslations } from '@/hooks/use-translations'

interface InventorySettings {
  globalThreshold: string;
  notificationMethod: string;
  realTimeUpdates: boolean;
}

export function InventorySettings() {
  const dispatch = useDispatch()
  const { settings, loading, error } = useSelector((state: RootState) => state.inventorySettings as InventorySettingsState)
  const { t } = useTranslations();
  const [inventorySetting, setInventorySetting] = useState<InventorySettings | undefined>();

  useEffect(() => {
    if (settings) {
      setInventorySetting(settings);
    }
  }, [settings])

  useEffect(() => {
    dispatch(fetchInventorySettings() as any)
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updateInventorySettings(inventorySetting!) as any)
      toast.success(t("profile.inventory.settings.saveSuccess"))
    } catch (error) {
      toast.error(t("profile.inventory.settings.saveError"))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[100vw]">
      <h2 className="text-xl font-bold">{t("profile.inventory.settings.title")}</h2>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Label htmlFor="globalThreshold">{t("profile.inventory.settings.globalThreshold")}</Label>
          <Input
            id="globalThreshold"
            type="number"
            value={inventorySetting?.globalThreshold}
            onChange={(e) => {
              const newSettings = {
                ...settings,
                globalThreshold: e.target.value
              };
              setInventorySetting(newSettings);
              // dispatch(updateInventorySettings(newSettings) as any);
            }}
            // placeholder={t("profile.inventory.settings.globalThresholdPlaceholder")}
            min="0"
            max="100"
            className="max-w-[100px]"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notificationMethod">{t("profile.inventory.settings.notificationMethod")}</Label>
          <Select
            value={settings.notificationMethod}
            onValueChange={(value) => dispatch(updateInventorySettings({
              ...settings,
              notificationMethod: value
            }) as any)}
          >
            <SelectTrigger id="notificationMethod" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">{t("profile.inventory.settings.notifications.line")}</SelectItem>
              <SelectItem value="email">{t("profile.inventory.settings.notifications.email")}</SelectItem>
              <SelectItem value="slack">{t("profile.inventory.settings.notifications.slack")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="realTimeUpdates"
            checked={settings.realTimeUpdates}
            onCheckedChange={(checked) => dispatch(updateInventorySettings({
              ...settings,
              realTimeUpdates: checked
            }) as any)}
          />
          <Label htmlFor="realTimeUpdates">{t("profile.inventory.settings.realTimeUpdates")}</Label>
        </div>
      </div>

      <Button type="submit" className="bg-black hover:bg-gray-800">
        {t("profile.inventory.settings.saveSettings")}
      </Button>
    </form>
  )
}


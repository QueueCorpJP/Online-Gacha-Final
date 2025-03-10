"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { RootState } from "@/redux/store"
import { fetchSecuritySettings, updateSecuritySettings } from "@/redux/features/securitySettingsSlice"
import { useTranslations } from "@/hooks/use-translations"

const formSchema = z.object({
  ipRestriction: z.boolean(),
  logMonitoring: z.boolean(),
  alertEmail: z.string().email(),
})

export function SecuritySettings() {
  const dispatch = useDispatch()
  const { settings, loading, error } = useSelector((state: RootState) => state.securitySettings)
  const { t } = useTranslations()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  useEffect(() => {
    dispatch(fetchSecuritySettings() as any)
  }, [dispatch])

  useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await dispatch(updateSecuritySettings(values) as any).unwrap()
      toast.success(t("securitySettings.toast.success"))
    } catch (error) {
      toast.error(t("securitySettings.toast.error"))
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500">{t("securitySettings.error", { error })}</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ipRestriction"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="font-normal">{t("securitySettings.ipRestriction.title")}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t("securitySettings.ipRestriction.description")}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logMonitoring"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="font-normal">{t("securitySettings.logMonitoring.title")}</FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t("securitySettings.logMonitoring.description")}
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alertEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("securitySettings.alertEmail.title")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("securitySettings.alertEmail.placeholder")}
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? t("securitySettings.button.saving") : t("securitySettings.button.save")}
        </Button>
      </form>
    </Form>
  )
}


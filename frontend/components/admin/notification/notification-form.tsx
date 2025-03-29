"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { toast } from "sonner"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { sendNotification, resetNotificationState } from "@/redux/features/notificationSlice"
import type { RootState } from "@/redux/store"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  type: z.string({
    required_error: "Please select a notification type",
  }),
  title: z.string().min(1, "Please enter a title"),
  content: z.string().min(1, "Please enter content"),
})

export function NotificationForm() {
  const { t } = useTranslations()
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state: RootState) => state.notification)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "app",
      title: "",
      content: "",
    },
  })

  useEffect(() => {
    if (success) {
      toast.success(t("notifications.sendSuccess"))
      form.reset()
      dispatch(resetNotificationState())
    }
    if (error && typeof error === 'string') {
      toast.error(error)
      dispatch(resetNotificationState())
    }
  }, [success, error, dispatch, form, t])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await dispatch(sendNotification(values) as any)
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error(t("notifications.sendError"))
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notifications.form.type.label")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("notifications.form.type.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="app">{t("notifications.form.type.options.app")}</SelectItem>
                  <SelectItem value="push">{t("notifications.form.type.options.push")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notifications.form.title.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("notifications.form.title.placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notifications.form.content.label")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("notifications.form.content.placeholder")} 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? <LoadingSpinner /> : t("notifications.form.submit")}
        </Button>
      </form>
    </Form>
  )
}


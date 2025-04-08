"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

export function ContactForm() {
  const { t } = useTranslations()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSchema = z.object({
    name: z.string().min(1, t("contact.form.validation.nameRequired")),
    email: z.string().email(t("contact.form.validation.emailInvalid")),
    category: z.string().min(1, t("contact.form.validation.categoryRequired")),
    message: z.string().min(1, t("contact.form.validation.messageRequired")),
    privacy: z.boolean().refine((val) => val === true, {
      message: t("contact.form.validation.privacyRequired"),
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      category: "",
      message: "",
      privacy: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const inquiryData = {
        userId: user?.id || null,
        subject: `${values.category}: ${values.name}`,
        message: `
Name: ${values.name}
Email: ${values.email}
Category: ${values.category}

Message:
${values.message}
        `.trim(),
        status: 'pending'
      }

      await api.post('/support/inquiries', inquiryData)

      toast.success(t("contact.form.success"))
      form.reset({
        name: user?.name || "",
        email: user?.email || "",
        category: "",
        message: "",
        privacy: false,
      })
    } catch (error) {
      console.error('Contact form submission error:', error)
      toast.error(t("contact.form.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6 px-2 sm:px-4 md:px-6 py-5 md:py-6 bg-white rounded-lg shadow-sm">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder={t("contact.form.placeholders.name")} 
                  className="bg-white text-base sm:text-base focus:ring-purple-500" 
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder={t("contact.form.placeholders.email")} 
                  className="bg-white text-base sm:text-base focus:ring-purple-500" 
                  type="email"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="bg-white text-base sm:text-base focus:ring-purple-500">
                    <SelectValue placeholder={t("contact.form.placeholders.category")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="text-base sm:text-base">
                  <SelectItem value="general">{t("contact.form.categories.general")}</SelectItem>
                  <SelectItem value="technical">{t("contact.form.categories.technical")}</SelectItem>
                  <SelectItem value="billing">{t("contact.form.categories.billing")}</SelectItem>
                  <SelectItem value="other">{t("contact.form.categories.other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder={t("contact.form.placeholders.message")} 
                  className="min-h-[150px] sm:min-h-[200px] bg-white text-base sm:text-base focus:ring-purple-500" 
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-purple-600 focus:ring-purple-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-xs sm:text-sm font-normal text-black">
                  <Link href="/privacy" className="text-purple-500 hover:underline">
                    {t("contact.form.privacy.agreement")}
                  </Link>
                  {" "}{t("contact.form.privacy.link")}
                </FormLabel>
                <FormMessage className="text-xs sm:text-sm" />
              </div>
            </FormItem>
          )}
        />
        <Alert className="bg-purple-50 border-purple-100">
          <InfoIcon color="#9333EA" className="h-4 w-4 text-purple-500" />
          <AlertDescription className="text-xs sm:text-sm">
            {t("contact.form.notice")}
          </AlertDescription>
        </Alert>
        <Button 
          type="submit" 
          className="w-full py-2 sm:py-3 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}
        </Button>
      </form>
    </Form>
  )
}

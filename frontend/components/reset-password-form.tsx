"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { api } from "@/lib/axios"
import { useTranslations } from "@/hooks/use-translations"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"



export function ResetPasswordForm() {
  const { t } = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z.object({
    password: z.string().min(8, {
      message: t("signup.form.errors.passwordLength"),
    }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("signup.form.errors.passwordMismatch"),
    path: ["confirmPassword"],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = searchParams.get('token')
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid reset token",
      })
      return
    }

    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: values.password,
      })
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      })
      router.push('/reset-password/sent')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{t("resetPassword.title")}</CardTitle>
        <CardDescription className="text-center">
          {t("resetPassword.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("resetPassword.form.newPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("resetPassword.form.confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
              disabled={isLoading}
            >
              {isLoading ? t("resetPassword.form.submitting") : t("resetPassword.form.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}


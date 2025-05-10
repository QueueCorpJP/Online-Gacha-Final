"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { api } from "@/lib/axios"
import { useTranslations } from "@/hooks/use-translations"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
})

export function ForgotPasswordForm() {
  const { t } = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: values.email })
      form.reset()
      
      setTimeout(() => {
        router.push("/forgot-password/sent")
        window.location.href = "/forgot-password/sent"
      }, 100)

    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      })
      
      setTimeout(() => {
        router.push("/forgot-password/sent")
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{t("forgotPassword.title")}</CardTitle>
        <CardDescription className="text-center">
          {t("forgotPassword.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forgotPassword.email.label")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("forgotPassword.email.placeholder")} 
                      type="email" 
                      {...field} 
                    />
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
              {isLoading ? t("forgotPassword.submit.loading") : t("forgotPassword.submit.default")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

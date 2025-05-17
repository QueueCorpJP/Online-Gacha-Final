"use client"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTranslations } from "@/hooks/use-translations"
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '@/redux/features/authSlice'
import { fetchProfile } from '@/redux/features/profileSlice'
import { AppDispatch, RootState } from '@/redux/store'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function LoginForm() {
  const { t } = useTranslations()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const formSchema = z.object({
    email: z.string().email({
      message: t("login.form.email.error"),
    }),
    password: z.string().min(8, {
      message: t("login.form.password.error"),
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (error) {
      toast.error(t("login.error"), { description: error } as any)
      dispatch(clearError())
    }
  }, [error, dispatch, t])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      toast.success(t("login.success.title"), {
        description: t("login.success.description"),
      })
      
      // Fetch profile data after successful login
      try {
        await dispatch(fetchProfile()).unwrap()
      } catch (error) {
        // プロフィールデータの取得に失敗した場合のエラー処理
      }
      
      router.push('/')
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{t("login.title")}</CardTitle>
        <CardDescription className="text-center">{t("login.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.form.email.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("login.form.email.placeholder")} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("login.form.password.label")}</FormLabel>
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
              {isLoading ? t("login.form.submitting") : t("login.form.submit")}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-[#7C3AED] hover:text-[#6D28D9]">
            {t("login.forgotPassword")}
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="text-[#7C3AED] hover:text-[#6D28D9] ml-1">
            {t("login.signUp")}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

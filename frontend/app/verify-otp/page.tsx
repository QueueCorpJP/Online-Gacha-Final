"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/features/authSlice"
import type { AppDispatch } from "@/redux/store"

export default function VerifyOTP() {
  const { t } = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const dispatch = useDispatch<AppDispatch>()
  
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error(t("otp.errors.invalidEmail"))
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp
      })
      
      // OTP認証成功時にログイン状態にする
      const { token, user } = response.data
      if (token && user) {
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        dispatch(setUser(user))
      }
      
      toast.success(t("otp.success"))
      router.push('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("otp.errors.verification"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success(t("otp.resendSuccess"))
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("otp.errors.resend"))
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">{t("otp.title")}</h2>
      <p className="text-gray-600 text-center mb-6">
        {t("otp.description", { email: email || '' })}
      </p>
      
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            {t("otp.label")}
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            placeholder={t("otp.placeholder")}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {isLoading ? t("otp.verifying") : t("otp.verify")}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          className="text-sm text-purple-600 hover:text-purple-500"
        >
          {t("otp.resend")}
        </button>
      </div>
    </div>
  )
}

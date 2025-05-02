"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { useTranslations } from "@/hooks/use-translations"
import { signUp } from "@/redux/features/authSlice"
import { toast } from "sonner"
import { RootState } from "@/redux/store"

export function SignUpForm() {
  const { t } = useTranslations()
  const router = useRouter()
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("signup.form.errors.passwordMismatch"))
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast.error(t("signup.form.errors.passwordLength"))
      return
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      toast.error(t("signup.form.errors.termsRequired"))
      return
    }

    try {
      const resultAction = await dispatch(signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }) as any)

      if (signUp.fulfilled.match(resultAction)) {
        toast.success(t("signup.success"))
        // Redirect to OTP confirmation page with email
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
      } else {
        toast.error(resultAction.payload || t("signup.error"))
      }
    } catch (err) {
      toast.error(t("signup.error"))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-medium">
            {t("signup.form.lastName")}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={t("signup.form.placeholders.lastName")}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-medium">
            {t("signup.form.firstName")}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={t("signup.form.placeholders.firstName")}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium">
          {t("signup.form.username")}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder={t("signup.form.placeholders.username")}
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          {t("signup.form.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t("signup.form.placeholders.email")}
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          {t("signup.form.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
        />
        <p className="text-xs text-gray-500">{t("signup.form.passwordHint")}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          {t("signup.form.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="agreeToTerms"
          name="agreeToTerms"
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          required
          className="h-4 w-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
          <Link href="/terms-of-service" className="text-[#7C3AED] hover:text-[#6D28D9]">
            {t("signup.form.terms.termsOfService")}
          </Link>
          {t("signup.form.terms.and")}
          <Link href="/privacy" className="text-[#7C3AED] hover:text-[#6D28D9]">
            {t("signup.form.terms.privacyPolicy")}
          </Link>
          {t("signup.form.terms.agree")}
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-[#7C3AED] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t("signup.form.submitting") : t("signup.form.submit")}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center mt-2">
          {error}
        </p>
      )}
    </form>
  )
}

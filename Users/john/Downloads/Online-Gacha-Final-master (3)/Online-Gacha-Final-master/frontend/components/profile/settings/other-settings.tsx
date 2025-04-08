"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { logout } from "@/redux/features/authSlice"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function OtherSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslations()

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true)
      await api.delete('/user/account')
      toast.success(t("settings.other.deleteAccount.success"))
      dispatch(logout())
      router.push("/")
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : t("settings.other.deleteAccount.error")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await api.post('/auth/logout')
      dispatch(logout())
      toast.success(t("settings.other.logout.success"))
      router.push("/login")
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : t("settings.other.logout.error")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("settings.other.title")}</h2>
      <nav className="space-y-8">
        <Link 
          href="/faq" 
          className="block text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t("settings.other.links.faq")}
        </Link>
        <Link 
          href="/terms" 
          className="block text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t("settings.other.links.terms")}
        </Link>
        <Link 
          href="/privacy" 
          className="block text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t("settings.other.links.privacy")}
        </Link>
        <Link 
          href="/legal" 
          className="block text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t("settings.other.links.legal")}
        </Link>
        <hr className="border-gray-200" />
        <AlertDialog>
          <AlertDialogTrigger 
            className="flex w-full items-center text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            {t("settings.other.deleteAccount.button")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("settings.other.deleteAccount.confirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.other.deleteAccount.confirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("settings.other.deleteAccount.confirmButton")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <button 
          onClick={handleLogout} 
          disabled={isLoading}
          className="w-full text-left text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
          {t("settings.other.logout.title")}
        </button>
      
      </nav>
    </div>
  )
}

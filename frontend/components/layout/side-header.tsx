"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, ChevronDown, Plus, Menu } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslations } from "@/hooks/use-translations"
import { PaymentMethodDialog } from "../payment-method-dialog"
import { logout } from "@/redux/features/authSlice"
import type { RootState } from "@/redux/store"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/components/ui/use-mobile"
import { MobileMenu } from "@/components/mobile-menu"
import { fetchUserNotifications } from "@/redux/features/notificationSlice"
import { fetchProfile } from "@/redux/features/profileSlice"

interface SiteHeaderProps {
  isAdmin?: boolean
}

export function SiteHeader({ isAdmin = false }: SiteHeaderProps) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useTranslations()
  const dispatch = useDispatch()
  const router = useRouter()
  const isMobile = useIsMobile()
  
  const { user } = useSelector((state: RootState) => state.auth)
  const { data: profileData } = useSelector((state: RootState) => state.profile)
  const isLoggedIn = !!user
  const { notifications } = useSelector((state: RootState) => state.notification)

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserNotifications())
      dispatch(fetchProfile())
    }
  }, [dispatch, isLoggedIn])

  const hasUnreadNotifications = notifications.some(notification => !notification.isRead)

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const getInitials = (lastName?: string, firstName?: string) => {
    const firstInitial = firstName?.[0] || '';
    const lastInitial = lastName?.[0] || '';
    return `${lastInitial}${firstInitial}`.toUpperCase() || 'UN';
  }

  const UserActions = () => (
    <div className="flex items-center gap-6">
      {/* Points Display */}
    <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-sm font-medium text-white">
            {t("header.points.coin")}
          </div>
          <span className="font-medium">{profileData?.coinBalance || 0}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => setPaymentDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">{t("header.points.add")}</span>
        </Button>
      </div>

      {/* Notifications - Show on both mobile and desktop */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative inline-flex"
        onClick={() => router.push('/notifications')}
      >
        <Bell className="h-5 w-5" />
        {hasUnreadNotifications && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        )}
        <span className="sr-only">{t("header.notifications.title")}</span>
      </Button>

      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative inline-flex px-8">
            <span className="text-sm font-medium">{localStorage.getItem("language")?.toUpperCase() || "JA"}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {
            localStorage.setItem("language", "ja");
            document.documentElement.lang = "ja";
            window.location.reload();
          }}>
            <span className="mr-2">🇯🇵</span> 日本語
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            localStorage.setItem("language", "en");
            document.documentElement.lang = "en";
            window.location.reload();
          }}>
            <span className="mr-2">🇺🇸</span> English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            localStorage.setItem("language", "zh");
            document.documentElement.lang = "zh";
            window.location.reload();
          }}>
            <span className="mr-2">🇨🇳</span> 中文
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!isMobile && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {profileData?.profileUrl ? (
                <AvatarImage src={profileData.profileUrl} alt={profileData ? `${profileData.lastName} ${profileData.firstName}` : t("header.userMenu.username")} />
              ) : (
                <AvatarFallback>
                  {profileData ? getInitials(profileData.lastName, profileData.firstName) : "UN"}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="hidden sm:inline font-medium">
              {profileData ? `${profileData.lastName} ${profileData.firstName} ` : t("header.userMenu.username")}
            </span>
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile">{t("header.userMenu.profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile/settings">{t("header.userMenu.settings")}</Link>
            </DropdownMenuItem>
            {user?.roles?.includes('admin') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/gacha">管理者ダッシュボード</Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={handleLogout}
            >
              {t("header.userMenu.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  )

  const AuthButtons = () => (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => router.push('/login')}
      >
        {t("header.auth.login")}
      </Button>
      <Button 
        size="sm" 
        className="hidden sm:inline-flex bg-[#7C3AED] hover:bg-[#6D28D9]"
        onClick={() => router.push('/signup')}
      >
        {t("header.auth.signup")}
      </Button>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  )

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="mx-auto container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#7C3AED]">
            SHIJON管理画面
          </Link>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <a href="/profile">
            <Button variant="outline" className="font-medium">
              管理者プロフィール
            </Button>
            </a>
          </div>
          
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="container-fluid px-4 sm:px-5 sticky top-0 z-50 w-full border-b bg-white">
        <div className="w-full flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt={t("header.logo.alt")}
              width={24}
              height={24}
            />
            <span className="text-xl font-bold text-[#7C3AED]">SHIJON</span>
            {/* <span className="ml-2 text-red-500 font-bold">【テスト表示</span> */}
          </Link>

          {isLoggedIn ? <UserActions /> : <AuthButtons />}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        open={mobileMenuOpen} 
        onOpenChange={setMobileMenuOpen}
        setPaymentDialogOpen={setPaymentDialogOpen}
      />
      
      <PaymentMethodDialog 
        open={paymentDialogOpen} 
        onOpenChange={setPaymentDialogOpen} 
      />
    </>
  )
}

"use client"

import { X, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/mobile-menu"
import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/features/authSlice"
import { RootState } from "@/redux/store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface MobileMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    setPaymentDialogOpen: (open: boolean) => void
}

export function MobileMenu({ open, onOpenChange, setPaymentDialogOpen }: MobileMenuProps) {
    const { t } = useTranslations()
    const dispatch = useDispatch()
    const router = useRouter()
    const { user } = useSelector((state: RootState) => state.auth)
    const { data: profile } = useSelector((state: RootState) => state.profile)
    const isLoggedIn = !!user

    const handleLogout = () => {
        dispatch(logout())
        onOpenChange(false)
    }

    const getInitials = (firstName: string, lastName: string) => {
        // Handle cases where firstName or lastName might be undefined or empty
        const firstInitial = firstName && firstName.length > 0 ? firstName[0] : '';
        const lastInitial = lastName && lastName.length > 0 ? lastName[0] : '';
        
        // If both are empty, return a fallback
        if (!firstInitial && !lastInitial) {
            return 'UN';
        }
        
        return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    const authenticatedMenuItems = [
        { href: "/products", label: t("navigation.originalGacha") },
        { href: "/profile/inventory", label: t("profile.tabs.inventory") },
        { href: "/profile/inventory", label: t("navigation.exchange") },
        { href: "/profile", label: t("header.userMenu.profile") },
        { href: "/profile/settings", label: t("header.userMenu.settings") },
        // Add admin dashboard link if user has admin role
        ...(user?.roles?.includes('admin') ? [
            { href: "/admin/gacha", label: t("header.userMenu.adminDashboard") }
        ] : [])
    ]

    const unauthenticatedMenuItems = [
        { href: "/products", label: t("navigation.originalGacha") },
        { href: "/rankings", label: t("navigation.gachaRanking") },
        // 未ログイン時は交換所を表示しない
    ]

    const AuthenticatedHeader = () => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            {profile ? getInitials(profile.lastName, profile.firstName) : "UN"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {profile ? `${profile.lastName} ${profile.firstName}` : t("header.userMenu.username")}
                        </span>
                        <div 
                            className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700"
                            onClick={() => {
                                onOpenChange(false)
                                setPaymentDialogOpen(true)
                            }}
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-medium text-white">
                                {t("header.points.coin")}
                            </div>
                            <span>{profile?.coinBalance || 0}</span>
                            <Plus className="h-4 w-4" />
                        </div>
                    </div>
                </div>
                <CloseButton />
            </div>
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium text-gray-500">
                    {t("header.notifications.title")}
                </span>
                <a href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                    <span className="sr-only">{t("header.notifications.title")}</span>
                </Button>
                </a>
            </div>
        </div>
    )

    const UnauthenticatedHeader = () => (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t("common.menu")}</h2>
                <CloseButton />
            </div>
            <div className="flex flex-col gap-2">
                <Button 
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
                    onClick={() => {
                        router.push('/signup')
                        onOpenChange(false)
                    }}
                >
                    {t("header.auth.signup")}
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                        router.push('/login')
                        onOpenChange(false)
                    }}
                >
                    {t("header.auth.login")}
                </Button>
            </div>
        </div>
    )

    const CloseButton = () => (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)} 
            className="h-auto w-auto p-0"
        >
            <X className="h-5 w-5" />
            <span className="sr-only">{t("common.cancel")}</span>
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed block inset-y-0 right-0 h-full w-[300px] rounded-none p-0">
                <DialogHeader className="p-4 border-b">
                    {isLoggedIn ? <AuthenticatedHeader /> : <UnauthenticatedHeader />}
                </DialogHeader>
                <div className="flex h-full flex-col p-4">
                    <nav className="space-y-6">
                        {(isLoggedIn ? authenticatedMenuItems : unauthenticatedMenuItems).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block text-lg hover:text-[#7C3AED]"
                                onClick={() => onOpenChange(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="text-lg text-red-500 hover:text-red-600 text-left mt-6 flex items-center gap-2"
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" 
                                    stroke="currentColor" 
                                    strokeWidth="1.33333" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                <path 
                                    d="M10.6665 11.3332L13.9998 7.99984L10.6665 4.6665" 
                                    stroke="currentColor" 
                                    strokeWidth="1.33333" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                <path 
                                    d="M14 8H6" 
                                    stroke="currentColor" 
                                    strokeWidth="1.33333" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            </svg>
                            {t("header.userMenu.logout")}
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


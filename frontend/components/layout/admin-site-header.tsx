"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, ChevronDown, Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentMethodDialog } from "@/components/payment-method-dialog"
import { MobileMenu } from "@/components/mobile-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SiteHeaderProps {
  isAdmin?: boolean
}

export function SiteHeader({ isAdmin = false }: SiteHeaderProps) {
  const [isLoggedIn] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-[#7C3AED]">
            SHIJON管理画面
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <Button variant="outline" className="font-medium">
              管理者プロフィール
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Header%20(2)-2ZHlLPUVotfKWFP5kMTw2G0AHqbu3t.png"
                alt="SHIJON Logo"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </div>
            <span className="text-xl font-bold text-[#7C3AED]">SHIJON</span>
          </Link>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-medium text-white">
                  M
                </div>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-sm font-medium text-white">
                  C
                </div>
                <span className="font-medium">0</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPaymentDialogOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="relative hidden md:inline-flex">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="hidden items-center gap-2 md:flex">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <span className="font-medium">ユーザー名</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>プロフィール</DropdownMenuItem>
                <DropdownMenuItem>設定</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              ログイン
            </Button>
            <Button size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
              新規登録
            </Button>
          </div>
        )}
      </div>

      <PaymentMethodDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} />
    </header>
  )
}


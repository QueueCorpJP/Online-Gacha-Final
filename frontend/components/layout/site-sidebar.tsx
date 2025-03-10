"use client"

import Link from "next/link"
import { Gift, Trophy, RefreshCw, Sparkles, TrendingUp, Star, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import type React from "react"

interface NavItem {
  title: string
  icon: React.ReactNode
  href: string
}

export function SiteSidebar({ className }: { className?: string }) {
  const { t } = useTranslations()

  const menuItems: NavItem[] = [
    {
      title: t("sidebar.menu.originalGacha"),
      icon: <Gift className="h-4 w-4" />,
      href: "/products",
    },
    {
      title: t("sidebar.menu.gachaRanking"),
      icon: <Trophy className="h-4 w-4" />,
      href: "/rankings",
    },
    {
      title: t("sidebar.menu.exchange"),
      icon: <RefreshCw className="h-4 w-4" />,
      href: "/profile/inventory",
    },
  ]

  const featuredItems: NavItem[] = [
    {
      title: t("sidebar.featured.newGacha"),
      icon: <Sparkles className="h-4 w-4" />,
      href: "/products?filter=new",
    },
    {
      title: t("sidebar.featured.trending"),
      icon: <TrendingUp className="h-4 w-4" />,
      href: "/products?filter=trending",
    },
    {
      title: t("sidebar.featured.recommended"),
      icon: <Star className="h-4 w-4" />,
      href: "/products?filter=recommended",
    },
    {
      title: t("sidebar.featured.limited"),
      icon: <Package className="h-4 w-4" />,
      href: "/products?filter=limited",
    },
  ]

  return (
    <aside className={cn("w-64 border-r bg-white", className)}>
      <nav className="space-y-8 p-6">
        <div>
          <h2 className="mb-2 px-2 text-sm font-semibold">{t("sidebar.sections.menu")}</h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start text-gray-800 hover:bg-purple-50 hover:text-purple-600 !px-2"
                asChild
              >
                <Link href={item.href}>
                  <span className="mr-2 text-[#7C3AED]">{item.icon}</span>
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-2 px-2 text-sm font-semibold">{t("sidebar.sections.featured")}</h2>
          <div className="space-y-1">
            {featuredItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start text-gray-800 hover:bg-purple-50 hover:text-purple-600"
                asChild
              >
                <Link href={item.href}>
                  <span className="mr-2 text-[#7C3AED]">{item.icon}</span>
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}

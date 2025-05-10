"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, Trophy, RefreshCw, Sparkles, TrendingUp, Star, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

const menuItems = [
  {
    title: "メニュー",
    items: [
      {
        title: "オリバガチャ",
        href: "/original-gacha",
        icon: <Gift className="mr-2 h-4 w-4" />,
      },
      {
        title: "ガチャランキング",
        href: "/ranking",
        icon: <Trophy className="mr-2 h-4 w-4" />,
      },
      {
        title: "交換所",
        href: "/exchange",
        icon: <RefreshCw className="mr-2 h-4 w-4" />,
      },
    ],
  },
  {
    title: "特集",
    items: [
      {
        title: "新着ガチャ",
        href: "/new",
        icon: <Sparkles className="mr-2 h-4 w-4" />,
      },
      {
        title: "人気急上昇",
        href: "/trending",
        icon: <TrendingUp className="mr-2 h-4 w-4" />,
      },
      {
        title: "おすす",
        href: "/recommended",
        icon: <Star className="mr-2 h-4 w-4" />,
      },
      {
        title: "限定ガチャ",
        href: "/limited",
        icon: <Package className="mr-2 h-4 w-4" />,
      },
    ],
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useSelector((state: RootState) => state.auth)
  const isLoggedIn = !!user

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <Button variant="default" className="w-full justify-center bg-[#7C3AED] hover:bg-[#6D28D9]">
            新規登録
          </Button>
          <Button variant="outline" className="w-full justify-center">
            ログイン
          </Button>
        </div>

        <div className="flex flex-col space-y-4">
          {menuItems.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-medium">{section.title}</h4>
              <div className="flex flex-col space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 hover:text-[#7C3AED]",
                      pathname === item.href ? "bg-gray-100 text-[#7C3AED]" : "text-gray-700",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}


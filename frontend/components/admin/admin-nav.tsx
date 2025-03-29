"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "ガチャ管理", href: "/admin/gacha" },
  { name: "カテゴリー管理", href: "/admin/category" },
  { name: "ニュース・ブログ", href: "/admin/news-blog" },
  { name: "ユーザー管理", href: "/admin/users" },
  { name: "決済管理", href: "/admin/payments" },
  { name: "在庫管理", href: "/admin/inventory" },
  { name: "発送管理", href: "/admin/inventory/status" },
  { name: "レポート", href: "/admin/reports" },
  { name: "通知管理", href: "/admin/notifications" },
  { name: "セキュリティ", href: "/admin/security" },
  { name: "カスタマーサポート", href: "/admin/support" },
]

export function AdminNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      )
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <nav className="max-w-[100vw] w-full border-b bg-[#F4F4F5]">
      <div className="max-w-[100vw] px-2 sm:px-4 lg:px-0 relative">
        <ScrollArea className="max-w-[100vw] w-full whitespace-nowrap">
          <div 
            ref={scrollContainerRef}
            className="flex w-full space-x-2 sm:space-x-4 px-4"
            onScroll={checkScroll}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b-2 px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-colors min-w-[120px] sm:min-w-[100px] text-center flex-shrink-0",
                  pathname === item.href
                    ? "border-[#7C3AED] text-[#7C3AED] bg-white"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900",
                  isMobile && "flex-1"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <ScrollBar 
            orientation="horizontal" 
            className={cn(
              "invisible",
              isMobile && "!visible"
            )} 
          />
        </ScrollArea>
        
        {/* Scroll buttons */}
        {!isMobile && canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-md"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {!isMobile && canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-md"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  )
}


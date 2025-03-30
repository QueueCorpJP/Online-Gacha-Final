"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const isExtraSmall = typeof window !== 'undefined' && window.innerWidth < 480
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  )

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
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      checkScroll()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Extra small screens - use dropdown menu
  if (isExtraSmall) {
    return (
      <nav className="sticky top-0 z-10 w-full border-b bg-[#F4F4F5] shadow-sm">
        <div className="px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>メニュー</span>
                <Menu className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full cursor-pointer",
                      pathname === item.href && "bg-purple-50 text-purple-700 font-medium"
                    )}
                  >
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    )
  }

  // Normal screens - use horizontal scroll
  return (
    <nav className="sticky top-0 z-10 w-full border-b bg-[#F4F4F5] shadow-sm">
      <div className="w-full px-2 sm:px-4 lg:px-0 relative">
        <ScrollArea className="w-full whitespace-nowrap">
          <div 
            ref={scrollContainerRef}
            className="flex w-full space-x-1 sm:space-x-2 md:space-x-4 px-2 py-1"
            onScroll={checkScroll}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b-2 px-2 sm:px-3 md:px-6 py-2 text-xs sm:text-sm font-medium transition-colors text-center flex-shrink-0",
                  pathname === item.href
                    ? "border-[#7C3AED] text-[#7C3AED] bg-white"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900",
                  isMobile 
                    ? "min-w-[90px]" 
                    : windowWidth < 768 
                      ? "min-w-[100px]" 
                      : "min-w-[120px]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <ScrollBar 
            orientation="horizontal" 
            className="opacity-0 sm:opacity-100" 
          />
        </ScrollArea>
        
        {/* Scroll buttons - only on tablet and desktop */}
        {windowWidth >= 640 && canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-md"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {windowWidth >= 640 && canScrollRight && (
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


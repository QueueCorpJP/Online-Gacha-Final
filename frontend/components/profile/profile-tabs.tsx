"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const tabs = [
  { 
    translationKey: "profile.tabs.profile" as const,
    href: "/profile" 
  },
  { 
    translationKey: "profile.tabs.inventory" as const,
    href: "/profile/inventory" 
  },
  { 
    translationKey: "profile.tabs.inviteCode" as const,
    href: "/profile/invite" 
  },
  { 
    translationKey: "profile.tabs.pointHistory" as const,
    href: "/profile/points" 
  },
  { 
    translationKey: "profile.tabs.settings" as const,
    href: "/profile/settings" 
  },
] as const

export function ProfileTabs() {
  const pathname = usePathname()
  const { t } = useTranslations()
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
    <div className="w-full border-b bg-[#F4F4F5]">
      <div className="w-full container sm:px-4 lg:px-0 relative">
        <ScrollArea className="max-w-[100vw] ull whitespace-nowrap">
          <div 
            ref={scrollContainerRef}
            className="flex w-full space-x-2 sm:space-x-4 px-4"
            onScroll={checkScroll}
          >
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "border-b-2 px-3 sm:px-6 py-2 text-sm font-medium transition-colors min-w-[100px] sm:min-w-[140px] text-center flex-shrink-0",
                  pathname === tab.href
                    ? "border-[#7C3AED] text-[#7C3AED] bg-white"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  isMobile && "flex-1"
                )}
              >
                {t(tab.translationKey)}
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
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-md"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {canScrollRight && (
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
    </div>
  )
}

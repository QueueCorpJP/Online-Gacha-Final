"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useDispatch, useSelector } from "react-redux"
import { fetchCategories } from "@/redux/features/categorySlice"
import type { AppDispatch, RootState } from "@/redux/store"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryNav() {
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { categories, isLoading, error } = useSelector((state: RootState) => state.category)

  // Only fetch categories if we're on the home page
  useEffect(() => {
    if (pathname === '/') {
      dispatch(fetchCategories())
    }
  }, [dispatch, pathname])

  // Don't render anything if we're not on the home page
  if (pathname !== '/') {
    return null
  }

  if (error) {
    return (
      <div className="border-b bg-gray-50 p-4 text-center text-sm text-red-500">
        Failed to load categories
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="border-b bg-gray-50">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max px-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                className="mx-2 h-8 w-24 rounded"
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="border-b bg-gray-50">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max px-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categories=${category.id}`}
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm transition-colors hover:text-gray-900",
                pathname === `/categories/${category.id}` ? "text-gray-900" : "text-gray-600",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}


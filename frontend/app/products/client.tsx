"use client"

import { GachaGrid } from "@/components/collection/gacha-grid"
import { GachaFilters } from "@/types/gacha"
import { useSearchParams } from "next/navigation"

export default function ProductsClient() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  const categories = searchParams.getAll('categories')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const ratings = searchParams.getAll('ratings')
  const sortBy = searchParams.get('sortBy')

  const initialFilters: GachaFilters = {}
  if (categories.length > 0)
    initialFilters.categories = categories;
  if (minPrice)
    initialFilters.minPrice = Number(minPrice);
  if (maxPrice)
    initialFilters.maxPrice = Number(maxPrice);
  if (ratings.length > 0)
    initialFilters.ratings = ratings.map(Number);
  if (sortBy)
    initialFilters.sortBy = sortBy;
  if (filter)
    initialFilters.filter = filter;

  return <GachaGrid initialFilters={initialFilters} />
}


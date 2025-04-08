"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GachaCard } from "@/components/cards/gacha-card"
import { useTranslations } from "@/hooks/use-translations"
import { fetchGachas, setFilters } from "@/redux/features/gachaSlice"
import { RootState } from "@/redux/store"
import Link from "next/link"
import { fetchCategories } from "@/redux/features/categorySlice"
import { GachaFilters, GachaGridProps } from "@/types/gacha";

export function GachaGrid({ initialFilters }: GachaGridProps) {
  const { t } = useTranslations()
  const dispatch = useDispatch()
  const { gachas, loading, filters } = useSelector((state: RootState) => state.gacha)
  const { categories } = useSelector((state: RootState) => state.category);
  const [sortType, setSortType] = useState<"recommended" | "newest" | "price-asc" | "price-desc">('recommended');
  const [selected, setSelected] = useState<boolean>(false);
  const [visibleGachas, setVisibleGachas] = useState(3);

  const handleLoadMore = () => {
    setVisibleGachas(prev => prev + 3);
  };

  console.log("initial filtere", initialFilters)

  // Initialize filters with initialFilters prop
  useEffect(() => {
    if (initialFilters) {
      dispatch(setFilters(initialFilters))
    }
  }, []) // Run only once on mount

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    console.log(filters);
    console.log("fetching gachas", initialFilters);
    let newFilters: GachaFilters;
    if (selected) {
      newFilters = {
        ...filters,
        minPrice: filters?.minPrice ?? undefined,
        maxPrice: filters?.maxPrice ?? undefined,
      }
    } else {
      newFilters = {
        ...filters,
        ...initialFilters,
        minPrice: undefined,
        maxPrice: undefined,
      }
    }
   
    dispatch(fetchGachas(newFilters))      
  }, [dispatch, filters])

  const sortOptions = [
    { value: "recommended", label: t("product.sort.recommended") },
    { value: "newest", label: t("product.sort.newest") },
    { value: "price-asc", label: t("product.sort.priceAsc") },
    { value: "price-desc", label: t("product.sort.priceDesc") },
  ]

  const ratings = [
    { value: 5, label: t("product.rating.fiveStars") },
    { value: 4, label: t("product.rating.fourStars") },
    { value: 3, label: t("product.rating.threeStars") },
  ]

  const handleSortChange = (value: "recommended" | "newest" | "price-asc" | "price-desc") => {
    let sortField: string;
    let sortOrder: string;

    console.log("change", filters);

    setSortType(value);

    switch (value) {
      case "newest":
        sortField = "createdAt";
        sortOrder = "desc";
        break;
      case "price-asc":
        sortField = "price";
        sortOrder = "asc";
        break;
      case "price-desc":
        sortField = "price";
        sortOrder = "desc";
        break;
      case "recommended":
      default:
        sortField = "createdAt"; // Default sort by creation date
        sortOrder = "desc";
    }


    dispatch(setFilters({ ...filters, sortBy: `${sortField}:${sortOrder}` }));
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelected(true);
    const newCategories = checked
      ? [...(filters?.categories ?? []), categoryId]
      : (filters?.categories ?? []).filter((id) => id !== categoryId)
    dispatch(setFilters({ categories: newCategories }))
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    setSelected(true);
    const numValue = value ? Number(value) : null
    dispatch(setFilters({ [type === 'min' ? 'minPrice' : 'maxPrice']: numValue }))
  }

  const handleRatingChange = (rating: number, checked: boolean) => {
    setSelected(true);
    const newRatings = checked
      ? [...(filters?.ratings ?? []), rating]
      : (filters?.ratings ?? []).filter((r) => r !== rating)
    dispatch(setFilters({ ratings: newRatings }))
  }

  return (
    <div className="container mx-auto flex flex-col py-16">
      <div className="flex justify-between items-baseline px-4">
        <h1 className="font-bold text-2xl">{t("product.title")}</h1>
        <div className="mb-4">
          <Select value={sortType ?? 'recommended'} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        {/* Filter Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 p-4">
          <div className="rounded-lg bg-white p-4">
            <h2 className="mb-4 font-bold">{t("product.filter.title")}</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">{t("product.filter.category")}</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={filters?.categories?.includes(category.id) ?? false}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <label htmlFor={category.id} className="text-sm">
                        {category.name }
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full">
                <h3 className="mb-2 text-sm font-medium">{t("product.filter.price")}</h3>
                <div className="flex w0full items-center space-x-2">
                  <Input
                    type="number"
                    placeholder={t("product.filter.priceMin")}
                    value={filters?.minPrice ?? ''}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="md:w-20"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder={t("product.filter.priceMax")}
                    value={filters?.maxPrice ?? ''}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="md:w-20"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">{t("product.filter.rating")}</h3>
                <div className="space-y-2">
                  {ratings.map((rating) => (
                    <div key={rating.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating.value}`}
                        checked={(filters?.ratings ?? []).includes(rating.value)}
                        onCheckedChange={(checked) => handleRatingChange(rating.value, checked as boolean)}
                      />
                      <label htmlFor={`rating-${rating.value}`} className="text-sm">
                        {rating.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gachas.slice(0, visibleGachas).map((gacha) => (
                <Link href={`/gacha/${gacha.id}`} key={gacha.id}>
                  <GachaCard
                    title={gacha.name}
                    rating={gacha.rating}
                    pricePerTry={parseFloat(gacha.price)}
                    remaining={gacha.totalStock}
                    imageUrl={gacha.thumbnail}
                  />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            {visibleGachas < gachas.length ? (
              <Button variant="outline" className="bg-white" onClick={handleLoadMore}>
                {t("product.loadMore")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

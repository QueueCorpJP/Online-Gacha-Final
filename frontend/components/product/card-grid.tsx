import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { useMemo, memo } from "react"

interface Item {
  id?: string | number
  name: string
  imageUrl?: string
  rarity: string
  probability: number
  stock?: number
}

interface CardGridProps {
  items: Item[]
}

// 個別のカードコンポーネントをメモ化
const CardItem = memo(({ item, index, t }: { item: Item; index: number; t: any }) => {
  const imageUrl = useMemo(() => 
    item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg",
    [item.imageUrl]
  )

  return (
    <div key={item.id || index} className="">
      <div className="aspect-[3/4] relative rounded-lg bg-zinc-100 overflow-hidden">
        <Image 
          src={imageUrl}
          alt={item.name} 
          fill 
          className="object-cover rounded-t-lg transition-opacity duration-300" 
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>
      <div className="text-white text-sm bg-[#00000080] p-3 rounded-b-lg">
        <div className="truncate">{item.name}</div>
        <div className="text-xs mt-1">
          {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} • {parseInt(item.probability.toString())}%
          {item.stock !== undefined && ` • ${t("gacha.cards.remaining", { count: item.stock })}`}
        </div>
      </div>
    </div>
  )
})

CardItem.displayName = 'CardItem'

export function CardGrid({ items = [] }: CardGridProps) {
  const { t } = useTranslations()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, i) => (
        <CardItem key={item.id || i} item={item} index={i} t={t} />
      ))}
    </div>
  )
}

import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"

interface CardGridProps {
  items?: {
    id: string;
    name: string;
    rarity: string;
    probability: string;
    imageUrl?: string;
    stock?: number;
  }[];
}

export function CardGrid({ items = [] }: CardGridProps) {

  console.log("items", items);
  const { t } = useTranslations()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, i) => (
        <div key={item.id || i} className="">
          <div className="aspect-[3/4] relative rounded-lg bg-zinc-100">
            <Image 
              src={item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg"}
              alt={item.name} 
              fill 
              className="object-cover rounded-t-lg" 
            />
          </div>
          <div className="text-white text-sm bg-[#00000080] p-3 rounded-b-lg">
            <div>{item.name}</div>
            <div className="text-xs mt-1">
              {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} • {parseInt(item.probability)}%
              {item.stock !== undefined && ` • ${t("gacha.cards.remaining"), item.stock}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

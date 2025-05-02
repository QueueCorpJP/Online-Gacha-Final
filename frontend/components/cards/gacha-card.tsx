import Image from "next/image"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"

interface GachaCardProps {
  title: string;
  remaining?: number;
  price?: number;
  pricePerTry?: number;
  rating?: number;
  isNew?: boolean;
  variant?: "rect" | "square";
  imageUrl?: string;
  className?: string;
}

export function GachaCard({
  title,
  rating,
  pricePerTry,
  remaining,
  price,
  imageUrl = "/placeholder.svg",
  isNew = false,
  className,
  variant = "square"
}: GachaCardProps) {
  const { t } = useTranslations()
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {isNew && (
        <div className="absolute right-2 top-2 rounded-full bg-[#7C3AED] px-3 py-1 text-xs font-medium text-white">
          NEW
        </div>
      )}
      <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
        <Image src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}` || "/placeholder.svg"} alt={title} fill className="object-contain" />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold tracking-tight">{title}</h3>
        <div className="flex items-center justify-between">
          {rating ? (
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{rating}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              {remaining && t("gacha.card.remaining", { count: remaining })}
            </span>
          )}
          <span className="text-lg font-bold text-[#7C3AED]">
            {pricePerTry ? `¥${pricePerTry.toLocaleString()}/回` : `¥${price?.toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>
  )
}


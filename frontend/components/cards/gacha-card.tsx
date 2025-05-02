import Image from "next/image"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"

type Language = 'ja' | 'en' | 'zh';

interface GachaCardProps {
  title: string;
  remaining?: number;
  price?: number | string;
  pricePerTry?: number | string;
  rating?: number;
  isNew?: boolean;
  variant?: "rect" | "square";
  imageUrl?: string;
  className?: string;
  translations?: {
    ja?: { name: string; description: string };
    en?: { name: string; description: string };
    zh?: { name: string; description: string };
  };
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
  variant = "square",
  translations
}: GachaCardProps) {
  const { t, language } = useTranslations()
  
  // 言語設定に応じたタイトルを取得
  const localizedTitle = translations && translations[language as Language]?.name
    ? translations[language as Language].name
    : title;
  
  // 価格の表示フォーマットを処理する関数
  const formatPrice = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return "";
    
    // 文字列の場合は数値に変換を試みる
    if (typeof value === 'string') {
      // 小数点を含む数値文字列の場合
      if (value.includes('.')) {
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? "" : parsedValue.toLocaleString();
      } 
      // 整数の場合
      const parsedValue = parseInt(value, 10);
      return isNaN(parsedValue) ? "" : parsedValue.toLocaleString();
    }
    
    // すでに数値の場合
    return value.toLocaleString();
  };
  
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
        <Image src={`${process.env.NEXT_PUBLIC_API_URL}${imageUrl}` || "/placeholder.svg"} alt={localizedTitle} fill className="object-contain" />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold tracking-tight">{localizedTitle}</h3>
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
            {pricePerTry 
              ? `¥${formatPrice(pricePerTry)}/回` 
              : `¥${formatPrice(price)}`
            }
          </span>
        </div>
      </div>
    </div>
  )
}


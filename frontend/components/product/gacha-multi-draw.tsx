import { useState, useEffect } from 'react'
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface GachaMultiDrawProps {
  items: any[];
  onComplete: () => void;
  totalDraws: number;
}

type RarityKey = 'D' | 'C' | 'B' | 'A' | 'S';

const RARITY_ORDER: Record<RarityKey, number> = {
  'S': 4,
  'A': 3,
  'B': 2,
  'C': 1,
  'D': 0,
};

// レアリティに応じた色を取得する関数
function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 's':
      return 'from-purple-600 to-pink-500'
    case 'a':
      return 'from-yellow-400 to-orange-500'
    case 'b':
      return 'from-blue-400 to-blue-600'
    case 'c':
      return 'from-blue-400 to-blue-600'
    default:
      return 'from-gray-400 to-gray-600'
  }
}

// レアリティの表示形式を整える関数
function formatRarity(rarity: string): string {
  const rarityMap: Record<string, string> = {
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'S': 'S'
  };

  return rarityMap[rarity.toUpperCase()] || rarity;
}

export function GachaMultiDraw({ items, onComplete, totalDraws }: GachaMultiDrawProps) {
  const { t, language } = useTranslations()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showNextButton, setShowNextButton] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  // 言語に応じたアイテム名を取得する関数
  const getLocalizedName = (item: any): string => {
    if (item.translations && language && item.translations[language as keyof typeof item.translations]?.name) {
      return item.translations[language as keyof typeof item.translations].name;
    }
    return item.name;
  }

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsCompleted(true)
      onComplete()
    }
  }

  const currentItem = items[currentIndex]
  const progress = `${currentIndex + 1}/${totalDraws}`

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-3xl text-center mb-4">
        <p className="text-gray-600">{progress}</p>
      </div>

      <div className="w-full max-w-md relative">
        <Card className="border-0 bg-zinc-50 overflow-hidden rounded-xl shadow-lg animate-pulse-slow">
          <div className="aspect-square relative">
            <Image 
              src={currentItem?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${currentItem.imageUrl}` : "/placeholder.svg"}
              alt={getLocalizedName(currentItem)}
              fill
              className="object-contain p-4"
            />
          </div>
          <div className="p-6 text-center">
            <Badge className={`mb-3 ${getRarityColor(currentItem?.rarity || "")}`}>
              {formatRarity(currentItem?.rarity || "")}
            </Badge>
            <h2 className="text-2xl font-bold mb-2">{getLocalizedName(currentItem)}</h2>
          </div>
        </Card>
      </div>

      <div className="w-full max-w-md mt-8 flex justify-center">
        <Button 
          onClick={handleNext}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center gap-2"
        >
          <span className="text-lg font-bold">
            {currentIndex < items.length - 1 ? t("gacha.result.next") : t("gacha.result.complete")}
          </span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 
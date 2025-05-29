import { useState, useMemo, useCallback } from 'react'
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface GachaSingleDrawProps {
  result: any;
  onComplete: () => void;
}

// レアリティに応じた色を取得する関数（最適化）
const getRarityColor = (rarity: string): string => {
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

// レアリティの表示形式を整える関数（最適化）
const formatRarity = (rarity: string): string => {
  const rarityMap: Record<string, string> = {
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'S': 'S'
  };

  return rarityMap[rarity.toUpperCase()] || rarity;
}

export function GachaSingleDraw({ result, onComplete }: GachaSingleDrawProps) {
  const { t, language } = useTranslations()
  const [isRevealed, setIsRevealed] = useState(false)

  // 言語に応じたアイテム名を取得する関数（メモ化）
  const getLocalizedName = useCallback((item: any): string => {
    if (item.translations && language && item.translations[language as keyof typeof item.translations]?.name) {
      return item.translations[language as keyof typeof item.translations].name;
    }
    return item.name;
  }, [language])

  // 結果を表示する処理（最適化）
  const handleReveal = useCallback(() => {
    setIsRevealed(true)
  }, [])

  // 完了処理（最適化）
  const handleComplete = useCallback(() => {
    onComplete()
  }, [onComplete])

  // 画像URLをメモ化
  const imageUrl = useMemo(() => 
    result?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${result.imageUrl}` : "/placeholder.svg",
    [result?.imageUrl]
  )

  // レアリティ色をメモ化
  const rarityColor = useMemo(() => getRarityColor(result?.rarity || ""), [result?.rarity])
  
  // アイテム名をメモ化
  const itemName = useMemo(() => getLocalizedName(result), [result, getLocalizedName])

  if (!result) {
    return <div className="text-center p-8">結果がありません</div>
  }

  if (!isRevealed) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-md relative">
          <Card className="border-0 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden rounded-xl shadow-lg animate-glow">
            <div className="aspect-square relative flex items-center justify-center">
              <div className="text-6xl">?</div>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">ガチャ結果</h2>
              <p className="text-gray-600">タップして確認</p>
            </div>
          </Card>
        </div>
        <div className="w-full max-w-md mt-8 flex justify-center">
          <Button 
            onClick={handleReveal}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <span className="text-lg font-bold">結果を確認</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md relative">
        <Card className="border-0 bg-zinc-50 overflow-hidden rounded-xl shadow-lg transition-transform duration-200 hover:scale-105">
          <div className="aspect-square relative">
            <Image 
              src={imageUrl}
              alt={itemName}
              fill
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-6 text-center">
            <Badge className={`mb-3 bg-gradient-to-r ${rarityColor} text-white`}>
              {formatRarity(result?.rarity || "")}
            </Badge>
            <h2 className="text-2xl font-bold mb-2">{itemName}</h2>
          </div>
        </Card>
      </div>
      <div className="w-full max-w-md mt-8 flex justify-center">
        <Button 
          onClick={handleComplete}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <span className="text-lg font-bold">完了</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 
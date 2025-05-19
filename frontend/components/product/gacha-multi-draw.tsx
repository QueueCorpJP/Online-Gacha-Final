import { useState, useEffect } from 'react'
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { api } from '@/lib/axios'

interface GachaMultiDrawProps {
  gachaId: string;
  onComplete: (results: any[]) => void;
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

export function GachaMultiDraw({ gachaId, onComplete, totalDraws }: GachaMultiDrawProps) {
  const { t, language } = useTranslations()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // useEffectで最初に10連分まとめて取得
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const response = await api.post(`/admin/gacha/${gachaId}/pull`, { times: totalDraws, isFree: false })
        if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
          setResults(response.data.items)
        } else {
          setError('ガチャアイテムの在庫がありません')
        }
      } catch (e) {
        setError('ガチャ取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [gachaId, totalDraws])

  // 言語に応じたアイテム名を取得する関数
  const getLocalizedName = (item: any): string => {
    if (item.translations && language && item.translations[language as keyof typeof item.translations]?.name) {
      return item.translations[language as keyof typeof item.translations].name;
    }
    return item.name;
  }

  // handleNextではAPIを叩かず、次のインデックスに進むだけ
  const handleNext = () => {
    if (currentIndex < totalDraws - 1) {
      setCurrentIndex(idx => idx + 1)
    } else {
      setIsCompleted(true)
      onComplete(results)
    }
  }

  const currentItem = results[currentIndex]
  const progress = `${currentIndex + 1}/${totalDraws}`

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>
  }

  if (isLoading || !currentItem) {
    return <div className="text-center p-8">Loading...</div>
  }

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
          disabled={isLoading || isCompleted}
        >
          
          <span className="text-lg font-bold">
            {currentIndex < totalDraws - 1 ? '次へ' : '結果を確認する'}
          </span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
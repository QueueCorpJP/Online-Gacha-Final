import { useState, useEffect } from 'react'
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight, Loader2 } from "lucide-react"
import { api } from '@/lib/axios'
import { Progress } from "@/components/ui/progress"

interface GachaHundredDrawProps {
  gachaId: string;
  onComplete: (results: any[]) => void;
  totalBatches: number; // 合計バッチ数（100連の場合は10バッチ）
  batchSize: number; // 1バッチあたりの数（10）
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

export function GachaHundredDraw({ gachaId, onComplete, totalBatches, batchSize }: GachaHundredDrawProps) {
  const { t, language } = useTranslations()
  const [currentBatch, setCurrentBatch] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allResults, setAllResults] = useState<any[]>([]) // すべての結果
  const [batchResults, setBatchResults] = useState<any[]>([]) // 現在のバッチの結果
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // 各バッチを順番に取得
  useEffect(() => {
    const fetchNextBatch = async () => {
      if (currentBatch >= totalBatches) {
        setIsCompleted(true)
        onComplete(allResults)
        return
      }

      setIsLoading(true)
      try {
        const response = await api.post(`/admin/gacha/${gachaId}/pull`, { times: batchSize, isFree: false })
        if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
          const newBatchResults = response.data.items
          setBatchResults(newBatchResults)
          setAllResults(prev => [...prev, ...newBatchResults])
          setCurrentIndex(0) // バッチ内の最初のアイテムから表示
          
          // 進捗を更新
          const newProgress = Math.round(((currentBatch + 1) / totalBatches) * 100)
          setProgress(newProgress)
        } else {
          setError('ガチャアイテムの在庫がありません')
          setIsCompleted(true)
        }
      } catch (e) {
        setError('ガチャ取得に失敗しました')
        setIsCompleted(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isCompleted && !isLoading) {
      fetchNextBatch()
    }
  }, [currentBatch, gachaId, batchSize, totalBatches, isCompleted, allResults, onComplete, isLoading])

  // 言語に応じたアイテム名を取得する関数
  const getLocalizedName = (item: any): string => {
    if (item.translations && language && item.translations[language as keyof typeof item.translations]?.name) {
      return item.translations[language as keyof typeof item.translations].name;
    }
    return item.name;
  }

  // 次のアイテムに進む
  const handleNext = () => {
    if (currentIndex < batchResults.length - 1) {
      // 同じバッチ内で次のアイテムへ
      setCurrentIndex(idx => idx + 1)
    } else {
      // 次のバッチへ
      setCurrentBatch(batch => batch + 1)
    }
  }

  const currentItem = batchResults[currentIndex]
  const progressText = `${progress}% 完了 (${allResults.length}/${totalBatches * batchSize})`

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>
  }

  if (isLoading && batchResults.length === 0) {
    return (
      <div className="text-center p-8 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>データを取得中...</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-3xl text-center mb-4">
        <p className="text-gray-600 mb-2">{progressText}</p>
        <Progress value={progress} className="w-full h-2" />
      </div>
      {currentItem && (
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
      )}
      <div className="w-full max-w-md mt-8 flex justify-center">
        <Button 
          onClick={handleNext}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center gap-2"
          disabled={isLoading || isCompleted}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>処理中...</span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold">
                {currentBatch < totalBatches - 1 || currentIndex < batchResults.length - 1 ? '次へ' : '結果を確認する'}
              </span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 
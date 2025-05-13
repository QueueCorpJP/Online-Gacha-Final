"use client"

import { useState, useEffect, useRef } from 'react'
import Image from "next/image"
import Link from "next/link"
import { Coins, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useTranslations } from "@/hooks/use-translations"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/redux/store"
import { useSearchParams } from 'next/navigation'
import { fetchGachaById } from "@/redux/features/gachaSlice"
import { toast } from 'sonner'
import { api } from '@/lib/axios'

type RarityKey = 'D' | 'C' | 'B' | 'A' | 'S';

const RARITY_ORDER: Record<RarityKey, number> = {
  'D': 0,
  'C': 1,  
  'B': 2,
  'A': 3,
  'S': 4,
};

interface GachaResult {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  probability: number;
  translations?: {
    ja: { name: string; description: string };
    en: { name: string; description: string };
    zh: { name: string; description: string };
  };
}

interface GroupedResults {
  [key: string]: GachaResult[];
}

interface UniqueGachaResult extends GachaResult {
  count: number;
}

interface PullResult {
  gachaId: string;
  items: GachaResult[];
  pullTime: string;
}

export default function GachaResultClient() {
  const { t, language } = useTranslations()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uniqueResults, setUniqueResults] = useState<UniqueGachaResult[]>([])
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({})
  const { currentGacha: gacha } = useSelector((state: RootState) => state.gacha)
  const [isLoading, setIsLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // 言語に応じたアイテム名を取得する関数
  const getLocalizedName = (item: GachaResult): string => {
    if (item.translations && item.translations[language]?.name) {
      return item.translations[language].name;
    }
    return item.name;
  }

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      window.location.href = '/gacha'
      return
    }

    console.log(data);

    // Parse the data first
    const parsedData: PullResult = JSON.parse(decodeURIComponent(data))
    
    // 既に表示済みかどうかをチェック
    const resultId = `gacha_result_${parsedData.pullTime}`
    const isAlreadyViewed = sessionStorage.getItem(resultId) === 'viewed'
    
    // Start loading animation (動画再生済みの場合はスキップ)
    setIsLoading(!isAlreadyViewed)
    setShowResults(isAlreadyViewed)

    // 既に表示済みの場合は保存されたデータを使用
    if (isAlreadyViewed) {
      const savedResultsJson = sessionStorage.getItem(`${resultId}_data`)
      if (savedResultsJson) {
        try {
          const savedResults = JSON.parse(savedResultsJson)
          setUniqueResults(savedResults.uniqueItems)
          setGroupedResults(savedResults.grouped)
          setIsLoading(false)
          setShowResults(true)
          
          // ガチャ情報も取得しておく（ボタンの表示などに必要）
          dispatch(fetchGachaById(parsedData.gachaId))
          return
        } catch (e) {
          console.error('Failed to parse saved results:', e)
          // 保存データの解析に失敗した場合は通常の処理を続行
        }
      }
    }

    // Then use the parsed data to fetch gacha details
    dispatch(fetchGachaById(parsedData.gachaId)).unwrap()
      .then(() => {
        // Process pull results
        const itemCounts = parsedData.items.reduce((acc: { [key: string]: UniqueGachaResult }, item: GachaResult) => {
          if (!acc[item.id]) {
            acc[item.id] = { ...item, count: 1 };
          } else {
            acc[item.id].count++;
          }

          console.log(acc);

          return acc;
        }, {});

        const uniqueItems = Object.values(itemCounts).sort((a, b) => {
          const rarityA = a.rarity.toLowerCase();
          const rarityB = b.rarity.toLowerCase();
          return (RARITY_ORDER[rarityA as RarityKey] || 999) - (RARITY_ORDER[rarityB as RarityKey] || 999);
        });

        const grouped = uniqueItems.reduce((acc: GroupedResults, item: UniqueGachaResult) => {
          const rarity = item.rarity.toLowerCase();
          if (!acc[rarity]) {
            acc[rarity] = [];
          }
          acc[rarity].push(item);
          return acc;
        }, {});

        console.log(uniqueItems);

        setUniqueResults(uniqueItems);
        setGroupedResults(grouped);

        // 結果データをセッションストレージに保存
        const resultsToSave = {
          uniqueItems,
          grouped
        }
        sessionStorage.setItem(`${resultId}_data`, JSON.stringify(resultsToSave))

        // 既に表示済みの場合は動画をスキップ
        if (isAlreadyViewed) {
          setIsLoading(false)
          setShowResults(true)
          return
        }

        // Play video and handle its completion
        if (videoRef.current) {
          videoRef.current.play()
          videoRef.current.onended = () => {
            // 表示済みとしてマーク
            sessionStorage.setItem(resultId, 'viewed')
            setIsLoading(false)
            setTimeout(() => {
              setShowResults(true)
            }, 500)
          }
        }
      })
      .catch((error) => {
        console.error('Failed to fetch gacha details:', error)
        window.location.href = '/gacha'
      });

  }, [searchParams, dispatch])

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, uniqueResults.length - 1))
  }

  const handleDraw = async (times: number) => {
    try {
      setIsDrawing(true)
      // Make API call to purchase and pull gacha
      const response = await api.post(`/admin/gacha/${gacha?.id}/pull`, {
        times: times,
        isFree: false,
      })

      // Show results
      if (response.data.items) {
        // Store the result data and redirect
        const resultData = {
          items: response.data.items,
          gachaId: gacha?.id,
          pullTime: new Date().toISOString()
        };

        // Using window.location for client-side navigation with state
        window.location.href = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
      }
    } catch (error: any) {
      toast.error(t("gacha.error.pull.title"), {
        description: error.response?.data?.message || t("gacha.error.pull.description")
      })
    } finally {
      setIsDrawing(false)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay={true}
          muted={true}
          preload="auto"
        >
          <source src={`/movies/${getVideoByRarity(uniqueResults)}.webm`} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  if (!showResults || !uniqueResults.length) return null

  const currentItem = uniqueResults[currentIndex]

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center py-8 px-4 
      ${showResults ? 'animate-fadeIn' : 'opacity-0'}`}>
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{t("gacha.result.title")}</h1>
        <p className="text-gray-600">
          {t("gacha.result.congratulations")} ({currentIndex + 1}/{uniqueResults.length})
        </p>
      </div>

      {/* Main item card display */}
      <div className="w-full max-w-md relative">
        <Card className="border-0 bg-zinc-50 overflow-hidden rounded-xl shadow-lg">
          <div className="aspect-square relative">
            <Image 
              src={currentItem.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${currentItem.imageUrl}` : "/placeholder.svg"}
              alt={getLocalizedName(currentItem)}
              fill
              className="object-contain p-4"
            />
          </div>
          <div className="p-6 text-center">
            <Badge className={`mb-3 ${getRarityColor(currentItem.rarity)}`}>
              {formatRarity(currentItem.rarity)}
            </Badge>
            <h2 className="text-2xl font-bold mb-2">{getLocalizedName(currentItem)}</h2>
            <p className="text-gray-500 mb-4">×{currentItem.count}</p>
          </div>
        </Card>

        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white shadow-md"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white shadow-md"
            onClick={handleNext}
            disabled={currentIndex === uniqueResults.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="w-full max-w-3xl mt-8 space-y-4">
        <h3 className="text-xl font-semibold">{t("gacha.result.summary")}</h3>
        <div className="bg-white p-4 rounded-xl shadow">
          {Object.entries(groupedResults).sort(([rarityA], [rarityB]) => {
            return (RARITY_ORDER[rarityB.toUpperCase() as RarityKey] || 0) - 
                  (RARITY_ORDER[rarityA.toUpperCase() as RarityKey] || 0);
          }).map(([rarity, items]) => (
            <div key={rarity} className="mb-4 last:mb-0">
              <h4 className={`${getRarityColor(rarity)} inline-block px-2 py-1 rounded text-sm font-medium mb-2`}>
                {formatRarity(rarity)}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-zinc-50 p-2 rounded">
                    <div className="h-10 w-10 relative flex-shrink-0">
                      <Image 
                        src={item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg"}
                        alt={getLocalizedName(item)}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getLocalizedName(item)}</p>
                      <p className="text-xs text-gray-500">×{(item as UniqueGachaResult).count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-3xl mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={`/gacha/${gacha?.id}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("gacha.result.backToGacha")}
          </Button>
        </Link>
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button 
            onClick={() => handleDraw(1)}
            disabled={isDrawing}
            className="bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            <Coins className="mr-2 h-4 w-4" />
            <p className="text-lg font-bold">¥{gacha?.price?.toLocaleString()}</p>
          </Button>
          <Button 
            onClick={() => handleDraw(10)}
            disabled={isDrawing}
            className="bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <p className="text-lg font-bold">¥{(gacha?.price * 10)?.toLocaleString()}</p>
          </Button>
        </div>
      </div>
    </div>
  )
}

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

function formatRarity(rarity: string): string {
  const rarityMap = {
    'A': 'A',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'S': 'S'
  };
  
  return rarityMap[rarity.toUpperCase()] || rarity;
}

function getHighestRarity(items: GachaResult[]): string {
  const rarityOrder = ['D', 'C', 'B', 'A', 'S'];
  
  return items.reduce((highest, item) => {
    const currentIndex = rarityOrder.indexOf(item.rarity.toUpperCase());
    const highestIndex = rarityOrder.indexOf(highest.toUpperCase());
    
    // Lower index means higher rarity (A is 0, S is 4)
    return currentIndex < highestIndex ? item.rarity : highest;
  }, 'D');
}

function getVideoByRarity(items: GachaResult[]): string {
  const highestRarity = getHighestRarity(items);
  return highestRarity.toUpperCase();
}

// Add this to your global CSS or tailwind config
const styles = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  '.animate-fadeIn': {
    animation: 'fadeIn 0.5s ease-in forwards',
  },
}

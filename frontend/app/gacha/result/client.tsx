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
  const { t } = useTranslations()
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

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      window.location.href = '/gacha'
      return
    }

    console.log(data);

    // Start loading animation
    setIsLoading(true)
    setShowResults(false)

    // Parse the data first
    const parsedData: PullResult = JSON.parse(decodeURIComponent(data))
    
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

        // Play video and handle its completion
        if (videoRef.current) {
          videoRef.current.play()
          videoRef.current.onended = () => {
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

      {/* Rarity Summary */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.entries(groupedResults)
            .sort(([a], [b]) => (RARITY_ORDER[a.toLowerCase() as RarityKey] || 999) - (RARITY_ORDER[b.toLowerCase() as RarityKey] || 999))
            .map(([rarity, items]) => {
              const totalCount = items.reduce<number>((sum, item) => sum + (item as UniqueGachaResult).count, 0);
              return (
                <div key={rarity} className="flex items-center gap-2">
                  <Badge 
                    className={`bg-gradient-to-r ${getRarityColor(rarity)} text-white border-none`}
                  >
                    {formatRarity(rarity)}
                  </Badge>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                    ×{totalCount.toString()}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Navigation and Card Display */}
      <div className="relative mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="relative p-2">
          <div className="absolute inset-0 rounded-[8px] bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl p-3" />
          <Image
            src={currentItem.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${currentItem.imageUrl}` : "/placeholder.svg"}
            alt={currentItem.name}
            width={225}
            height={396}
            className="aspect-[3/4] rounded-[8px] relative object-cover"
          />
        </div>

        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentIndex === uniqueResults.length - 1}
          className="p-2"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Card Info */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-between gap-28 mb-4">
          <h2 className="text-xl font-bold">{currentItem.name}</h2>
          <div className="flex items-center gap-2">
            <Badge 
              className={`bg-gradient-to-r ${getRarityColor(currentItem.rarity)} text-white border-none flex items-center gap-1`}
            >
              <span className="text-white">✨</span>
              {formatRarity(currentItem.rarity)}
            </Badge>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
              ×{currentItem.count}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-28 text-gray-600 font-normal mb-4">
          <div className="text-sm text-left">
            <p>{t("gacha.result.cardInfo.id")}: {currentItem.id}</p>
            <p>{t("gachaForm.itemSettings.probability")}: {currentItem.probability}</p>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 mb-8">
        {uniqueResults.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-purple-600 w-4' 
                : 'bg-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Draw Again Options */}
      <Card className="w-full max-w-lg mb-8">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">{t("gacha.result.drawAgain")}</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{t("gacha.result.oneDraw")}</p>
                <p className="text-lg font-bold">¥{gacha?.price?.toLocaleString()}</p>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleDraw(1)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("gacha.result.oneDraw")}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{t("gacha.result.tenDraws")}</p>
                <p className="text-lg font-bold">¥{(gacha?.price * 10)?.toLocaleString()}</p>
                <p className="text-sm text-purple-600 font-medium">{t("gacha.result.discount")}</p>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleDraw(10)}
                disabled={isDrawing}
              >
                {isDrawing ? (
                  <div className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2">
                      <svg className="h-full w-full" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                          fill="none"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                    {t("common.loading")}
                  </div>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t("gacha.result.tenDraws")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Link 
        href={`/products`}
        className="text-gray-600 hover:text-gray-900 text-sm"
      >
        {t("gacha.result.returnToList")}
      </Link>
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

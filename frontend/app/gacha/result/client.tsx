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
  'S': 0,
  'A': 1,  
  'B': 2,
  'C': 3,
  'D': 4,
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
  const [videoSrc, setVideoSrc] = useState("")

  // 言語に応じたアイテム名を取得する関数
  const getLocalizedName = (item: GachaResult): string => {
    if (item.translations && item.translations[language]?.name) {
      return item.translations[language].name;
    }
    return item.name;
  }

  // Clear session storage when leaving the page
  useEffect(() => {
    // This will only run client-side
    const handleBeforeUnload = () => {
      // Only clear specific keys related to viewing status, not the actual result data
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('gacha_result_') && key.endsWith('_viewed')) {
          sessionStorage.removeItem(key);
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      window.location.href = '/gacha'
      return
    }

    try {
      // Parse the data first
      const parsedData: PullResult = JSON.parse(decodeURIComponent(data))
      
      // Check if already viewed - use a specific key for viewing status
      const resultId = `gacha_result_${parsedData.pullTime}`
      const viewStatusKey = `${resultId}_viewed`
      const isAlreadyViewed = sessionStorage.getItem(viewStatusKey) === 'true'
      
      // Start loading animation (skip if video already played)
      setIsLoading(!isAlreadyViewed)
      setShowResults(isAlreadyViewed)

      // Always fetch gacha info (needed for buttons)
      dispatch(fetchGachaById(parsedData.gachaId))

      // Process item data
      const processItems = () => {
        // Make sure we actually have items
        if (!parsedData.items || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
          console.error('No valid items in pull results');
          toast.error(t("gacha.error.result.title"), {
            description: t("gacha.error.result.description")
          });
          return { uniqueItems: [], grouped: {} };
        }

        // Process pull results
        const itemCounts = parsedData.items.reduce((acc: { [key: string]: UniqueGachaResult }, item: GachaResult) => {
          if (!acc[item.id]) {
            acc[item.id] = { ...item, count: 1 };
          } else {
            acc[item.id].count++;
          }
          return acc;
        }, {});

        const uniqueItems = Object.values(itemCounts).sort((a, b) => {
          const rarityA = a.rarity.toUpperCase() as RarityKey;
          const rarityB = b.rarity.toUpperCase() as RarityKey;
          return (RARITY_ORDER[rarityA] || 999) - (RARITY_ORDER[rarityB] || 999);
        });

        const grouped = uniqueItems.reduce((acc: GroupedResults, item: UniqueGachaResult) => {
          const rarity = item.rarity.toLowerCase();
          if (!acc[rarity]) {
            acc[rarity] = [];
          }
          acc[rarity].push(item);
          return acc;
        }, {});

        console.log('Processed items:', uniqueItems);

        // Save result data to session storage (separate from view status)
        const resultsToSave = {
          uniqueItems,
          grouped
        }
        sessionStorage.setItem(`${resultId}_data`, JSON.stringify(resultsToSave))

        // Determine highest rarity for video
        const highestRarity = getHighestRarity(parsedData.items);
        setVideoSrc(`/movies/${highestRarity}.webm`);

        return { uniqueItems, grouped };
      }

      // Process items and use the result
      const { uniqueItems, grouped } = processItems();
      setUniqueResults(uniqueItems);
      setGroupedResults(grouped);

      // If already viewed, show results immediately
      if (isAlreadyViewed) {
        setIsLoading(false);
        setShowResults(true);
        return;
      }

      // First time viewing, play video
      if (videoRef.current) {
        videoRef.current.oncanplay = () => {
          videoRef.current?.play().catch(err => {
            console.error('Failed to play video:', err);
            // Fallback in case video can't play
            setIsLoading(false);
            setShowResults(true);
            sessionStorage.setItem(viewStatusKey, 'true');
          });
        };
        
        videoRef.current.onended = () => {
          // Mark as viewed
          sessionStorage.setItem(viewStatusKey, 'true');
          setIsLoading(false);
          setTimeout(() => {
            setShowResults(true);
          }, 500);
        };
      }
      
    } catch (error) {
      console.error('Failed to process gacha results:', error);
      toast.error(t("gacha.error.result.title"), {
        description: t("gacha.error.result.description")
      });
      setTimeout(() => {
        window.location.href = '/gacha';
      }, 2000);
    }

  }, [searchParams, dispatch, t]);

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
          autoPlay={false} // Changed to false to avoid race conditions
          muted={true}
          preload="auto"
        >
          <source src={videoSrc} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  if (!showResults || !uniqueResults.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">{t("gacha.loading")}</h1>
        <p className="text-gray-600">{t("gacha.please_wait")}</p>
      </div>
    );
  }

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
      return 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
    case 'a':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    case 'b':
      return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
    case 'c':
      return 'bg-gradient-to-r from-teal-400 to-teal-600 text-white'
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
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
  if (!items || items.length === 0) return 'D';
  
  const rarityOrder = ['S', 'A', 'B', 'C', 'D'];
  let highestRarityFound = 'D';
  let highestIndex = 999;
  
  for (const item of items) {
    const currentRarity = item.rarity.toUpperCase();
    const currentIndex = rarityOrder.indexOf(currentRarity);
    
    if (currentIndex !== -1 && currentIndex < highestIndex) {
      highestIndex = currentIndex;
      highestRarityFound = currentRarity;
    }
  }
  
  return highestRarityFound;
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
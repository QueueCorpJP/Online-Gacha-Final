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
type Language = 'ja' | 'en' | 'zh';

const RARITY_ORDER: Record<RarityKey, number> = {
  'S': 4,
  'A': 3,
  'B': 2,
  'C': 1,
  'D': 0,
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

// 最高レアリティを取得する関数
function getHighestRarity(items: GachaResult[]): string {
  if (!items || items.length === 0) {
    return 'D'; // デフォルト値
  }
  
  const rarityOrder = ['D', 'C', 'B', 'A', 'S'];

  return items.reduce((highest, item) => {
    const currentIndex = rarityOrder.indexOf(item.rarity.toUpperCase());
    const highestIndex = rarityOrder.indexOf(highest.toUpperCase());

    // 高いインデックスが高レアリティ
    return currentIndex > highestIndex ? item.rarity : highest;
  }, 'D');
}

// 動画ファイル名を取得する関数
function getVideoByRarity(items: GachaResult[]): string {
  if (!items || items.length === 0) {
    return 'D';
  }
  const highestRarity = getHighestRarity(items);
  return highestRarity.toUpperCase();
}

export default function GachaResultClient() {
  // 翻訳関数を最初に初期化
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
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("ガチャ結果の表示に失敗しました")

  // 言語に応じたアイテム名を取得する関数
  const getLocalizedName = (item: GachaResult): string => {
    if (item.translations && language && item.translations[language as keyof typeof item.translations]?.name) {
      return item.translations[language as keyof typeof item.translations].name;
    }
    return item.name;
  }

  // ガチャ結果を処理する関数
  const processGachaResults = (items: GachaResult[]): { uniqueItems: UniqueGachaResult[], grouped: GroupedResults } => {
    // アイテムが空の場合はエラーをスロー
    if (!items || items.length === 0) {
      throw new Error("ガチャアイテムがありません");
    }
    
    // アイテムをカウントして重複を除去
    const itemCounts = items.reduce((acc: { [key: string]: UniqueGachaResult }, item: GachaResult) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item, count: 1 };
      } else {
        acc[item.id].count++;
      }
      return acc;
    }, {});

    // レアリティでソート（Sが最も高く、Dが最も低い）
    const uniqueItems = Object.values(itemCounts).sort((a, b) => {
      const rarityA = a.rarity.toUpperCase() as RarityKey;
      const rarityB = b.rarity.toUpperCase() as RarityKey;
      return (RARITY_ORDER[rarityB] || 0) - (RARITY_ORDER[rarityA] || 0);
    });

    // レアリティごとにグループ化
    const grouped = uniqueItems.reduce((acc: GroupedResults, item: UniqueGachaResult) => {
      const rarity = item.rarity.toLowerCase();
      if (!acc[rarity]) {
        acc[rarity] = [];
      }
      acc[rarity].push(item);
      return acc;
    }, {});

    return { uniqueItems, grouped };
  };

  // ガチャを再度引く処理
  const handleRetryGacha = async () => {
    try {
      setIsDrawing(true);
      
      // ガチャIDが存在する場合のみ実行
      if (!gacha?.id) {
        toast.error("ガチャ情報が見つかりません");
        return;
      }
      
      const response = await api.post(`/admin/gacha/${gacha.id}/pull`, {
        times: 1,
        isFree: false,
      });
      
      if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
        // 成功した場合は結果ページにリダイレクト
        const resultData = {
          items: response.data.items,
          gachaId: gacha.id,
          pullTime: new Date().toISOString()
        };
        
        window.location.href = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
      } else {
        toast.error("ガチャの結果が空です。もう一度お試しください。");
      }
    } catch (error: any) {
      console.error("Error retrying gacha:", error);
      toast.error("ガチャの実行に失敗しました");
    } finally {
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      window.location.href = '/gacha'
      return
    }

    // Start loading animation
    setIsLoading(true)
    setShowResults(false)
    setHasError(false)

    try {
      // データをデコードしてパース
      const parsedData: PullResult = JSON.parse(decodeURIComponent(data))
      
      // アイテムが空の場合はエラー
      if (!parsedData.items || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
        console.error("No items found in parsed data:", parsedData);
        setErrorMessage("ガチャアイテムが見つかりません。もう一度お試しください。");
        setHasError(true);
        toast.error("ガチャアイテムが見つかりません");
        return;
      }

      // 先にアイテムを処理して表示できるようにする
      try {
        const { uniqueItems, grouped } = processGachaResults(parsedData.items);
        console.log("Processed items:", uniqueItems);
        
        // ステートを更新
        setUniqueResults(uniqueItems);
        setGroupedResults(grouped);
        
        // Then use the parsed data to fetch gacha details
        dispatch(fetchGachaById(parsedData.gachaId))
        
        // 動画再生処理
        if (videoRef.current) {
          try {
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Video started playing");
                  
                  // 動画再生完了時の処理
                  videoRef.current!.onended = () => {
                    console.log("Video playback ended");
                    setIsLoading(false);
                    setTimeout(() => {
                      setShowResults(true);
                    }, 500);
                  };
                })
                .catch(err => {
                  console.error("Error playing video:", err);
                  // 動画再生に失敗した場合は結果を直接表示
                  setIsLoading(false);
                  setShowResults(true);
                });
            }
            
            // 動画再生エラー時のフォールバック
            videoRef.current.onerror = () => {
              console.error("Video playback error");
              setIsLoading(false);
              setShowResults(true);
            };
          } catch (playError) {
            console.error("Error during video playback setup:", playError);
            setIsLoading(false);
            setShowResults(true);
          }
        } else {
          // ビデオ要素がない場合は直接結果を表示
          console.warn("Video element not found, showing results directly");
          setIsLoading(false);
          setShowResults(true);
        }
      } catch (processError) {
        console.error("Error processing gacha items:", processError);
        setErrorMessage("ガチャアイテムの処理に失敗しました。もう一度お試しください。");
        setHasError(true);
        toast.error("ガチャアイテムの処理に失敗しました");
      }
    } catch (error) {
      console.error("Error processing gacha results:", error);
      setErrorMessage("ガチャ結果の処理に失敗しました。もう一度お試しください。");
      setHasError(true);
      toast.error("ガチャ結果の処理に失敗しました");
    }
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
      if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
        // Store the result data and redirect
        const resultData = {
          items: response.data.items,
          gachaId: gacha?.id,
          pullTime: new Date().toISOString()
        };

        // Using window.location for client-side navigation with state
        window.location.href = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
      } else {
        toast.error("ガチャの結果が空です。もう一度お試しください。");
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

  // エラーが発生した場合
  if (hasError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
        <p className="text-gray-600 mb-8">{errorMessage}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/gacha">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              ガチャ一覧に戻る
            </Button>
          </Link>
          <Button 
            onClick={handleRetryGacha} 
            disabled={isDrawing}
            className="bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            もう一度引く
          </Button>
        </div>
      </div>
    )
  }

  // 読み込み中の場合
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
          <source src={`/movies/${getVideoByRarity(uniqueResults)}.mp4`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  // 結果が準備できていない場合
  if (!showResults || uniqueResults.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">結果を読み込んでいます...</p>
          <Button 
            variant="outline" 
            onClick={() => setShowResults(true)}
            className="text-white border-white hover:bg-white hover:text-black"
          >
            今すぐ結果を表示
          </Button>
        </div>
      </div>
    )
  }

  // 現在表示するアイテム
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
            return (RARITY_ORDER[(rarityB.toUpperCase() as RarityKey)] || 0) - 
                  (RARITY_ORDER[(rarityA.toUpperCase() as RarityKey)] || 0);
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
            ガチャに戻る
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
            <p className="text-lg font-bold">¥{gacha?.price && typeof gacha.price === 'number' ? (gacha.price * 10).toLocaleString() : '0'}</p>
          </Button>
        </div>
      </div>
    </div>
  )
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
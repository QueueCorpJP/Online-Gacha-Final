"use client"

import { useState, useEffect, useRef } from 'react'
import Image from "next/image"
import Link from "next/link"
import { Coins, RotateCcw, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  
  // 最高レアリティを取得
  const highestRarity = getHighestRarity(items);
  
  // レア度を大文字に統一して返す
  // 動画ファイル名は A.webm, B.webm, C.webm, D.webm, S.webm の形式
  const normalizedRarity = highestRarity.toUpperCase();
  
  // 有効なレア度のみを許可（A, B, C, D, S）
  if (['A', 'B', 'C', 'D', 'S'].includes(normalizedRarity)) {
    return normalizedRarity;
  }
  
  // 不明なレア度の場合はデフォルトとしてDを返す
  console.warn(`Unknown rarity: ${highestRarity}, using default 'D'`);
  return 'D';
}

// 安全なリダイレクト関数
function safeRedirect(url: string): void {
  try {
    // 現在のURLと同じでないことを確認（無限リダイレクト防止）
    if (window.location.href !== url) {
      console.log(`Redirecting to: ${url}`);
      window.location.href = url;
    } else {
      console.warn('Prevented redirect to the same URL');
    }
  } catch (error) {
    console.error('Redirect failed:', error);
    // エラーが発生した場合はトップページへ
    window.location.href = '/';
  }
}

export default function GachaResultClient() {
  // 翻訳関数を最初に初期化
  const { t, language } = useTranslations()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uniqueResults, setUniqueResults] = useState<UniqueGachaResult[]>([])
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({})
  const [originalItems, setOriginalItems] = useState<GachaResult[]>([]) // 元の順番を保持
  const [isMultiDraw, setIsMultiDraw] = useState(false) // 10連ガチャかどうか
  const [showFirstCard, setShowFirstCard] = useState(true) // 1枚目のカードを表示するかどうか
  const [showMultiDrawAnimation, setShowMultiDrawAnimation] = useState(false) // 10連表示をフェードインするかどうか
  const [animationPhase, setAnimationPhase] = useState<'first-card' | 'fade-out' | 'multi-cards'>('first-card') // アニメーションの段階
  const { currentGacha: gacha } = useSelector((state: RootState) => state.gacha)
  const [isLoading, setIsLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("ガチャ結果の表示に失敗しました")
  const [hasStock, setHasStock] = useState(true) // 在庫状態を管理
  const isRedirecting = useRef(false) // リダイレクト状態を管理する参照
  const [skipVideo, setSkipVideo] = useState(false) // 動画をスキップするかどうか
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [purchaseInfo, setPurchaseInfo] = useState<{ times: number; price: number | string }>({ times: 1, price: 0 })

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
    
    // 元のアイテムを保存
    setOriginalItems(items);
    
    // 10連ガチャかどうかを判定
    setIsMultiDraw(items.length >= 10);
    
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
  const handleRetryGacha = async (e: React.MouseEvent) => {
    try {
      setIsDrawing(true);
      
      // ガチャIDが存在する場合のみ実行
      if (!gacha?.id) {
        e.preventDefault();
        toast.error("ガチャ情報が見つかりません");
        return;
      }
      
      // 在庫確認
      try {
        const stockCheck = await api.get(`/admin/gacha/${gacha.id}/stock-check`).catch(() => null);
        
        if (stockCheck?.data?.availableItems === 0 || stockCheck?.data?.isEmpty) {
          e.preventDefault();
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
          setIsDrawing(false);
          return;
        }
      } catch (stockError) {
        // 在庫確認APIがない場合は無視して続行
        console.log("Stock check API not available, continuing...");
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
        
        // 新しいガチャ結果のため、sessionStorageをクリア
        if (typeof window !== 'undefined') {
          // 現在のガチャ結果に関連するキーを削除（リロード判定用）
          const currentResultKey = `gacha_result_${gacha.id}_${resultData.pullTime}`;
          sessionStorage.removeItem(currentResultKey);
        }
        
        const resultUrl = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
        safeRedirect(resultUrl);
      } else {
        e.preventDefault();
        toast.error("ガチャの結果が空です。在庫がない可能性があります。");
        setHasStock(false);
      }
    } catch (error: any) {
      console.error("Error retrying gacha:", error);
      if (error.response?.data?.code === 'OUT_OF_STOCK' || 
          error.response?.status === 409 || 
          error.response?.data?.message?.includes('stock') || 
          error.response?.data?.message?.includes('在庫')) {
        e.preventDefault();
        toast.error("ガチャアイテムの在庫がありません");
        setHasStock(false);
      } else {
        toast.error("ガチャの実行に失敗しました");
      }
    } finally {
      setIsDrawing(false);
    }
  };

  // 在庫確認関数
  const checkStock = async () => {
    if (!gacha?.id) return;
    
    try {
      const response = await api.get(`/admin/gacha/${gacha.id}/stock-check`).catch(() => null);
      
      if (response?.data) {
        const hasAvailableItems = !(response.data.availableItems === 0 || response.data.isEmpty);
        setHasStock(hasAvailableItems);
        
        if (!hasAvailableItems) {
          console.log("ガチャアイテムの在庫がありません");
        }
      }
    } catch (error) {
      // APIがサポートされていない場合は在庫ありと仮定
      console.log("在庫確認APIがサポートされていません");
      setHasStock(true);
    }
  };

  useEffect(() => {
    // ガチャ情報が取得できたら在庫確認を実行
    if (gacha?.id) {
      checkStock();
    }
  }, [gacha]);

  useEffect(() => {
    const data = searchParams.get('data')
    if (!data) {
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        safeRedirect('/gacha');
      }
      return;
    }

    // Start loading animation
    setIsLoading(true)
    setShowResults(false)
    setHasError(false)

    try {
      // データをデコードしてパース
      const parsedData: PullResult = JSON.parse(decodeURIComponent(data))
      
      // アイテムが空の場合はエラー表示せず、トーストだけ表示してガチャ一覧に戻る
      if (!parsedData.items || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
        console.error("No items found in parsed data:", parsedData);
        toast.error("ガチャアイテムが見つかりません。在庫がない可能性があります。");
        // エラー画面を表示せずにガチャ一覧に戻る
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          safeRedirect('/gacha');
        }
        return;
      }

      // 先にアイテムを処理して表示できるようにする
      try {
        const { uniqueItems, grouped } = processGachaResults(parsedData.items);
        console.log("Processed items:", uniqueItems);
        
        // ステートを更新
        setUniqueResults(uniqueItems);
        setGroupedResults(grouped);
        
        // 10連ガチャの場合、アニメーション状態を初期化
        if (parsedData.items.length >= 10) {
          setShowFirstCard(true);
          setShowMultiDrawAnimation(false);
          setAnimationPhase('first-card');
        }
        
        // Then use the parsed data to fetch gacha details
        dispatch(fetchGachaById(parsedData.gachaId))
        
        // リロードかどうかを判定するためのキーを生成
        const resultKey = `gacha_result_${parsedData.gachaId}_${parsedData.pullTime}`;
        
        // sessionStorageをチェックして、既に表示済みかどうかを判定
        const isAlreadyViewed = typeof window !== 'undefined' && sessionStorage.getItem(resultKey);
        
        if (isAlreadyViewed) {
          // 既に表示済みの場合は動画をスキップ
          console.log("This result has already been viewed, skipping video");
          setSkipVideo(true);
          setIsLoading(false);
          setShowResults(true);
          return;
        }
        
        // 表示済みとしてマーク
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(resultKey, 'viewed');
        }
        
        // 動画再生処理
        if (videoRef.current) {
          try {
            // 動画ソースを事前に設定
            const videoRarity = getVideoByRarity(parsedData.items);
            const webmSource = document.createElement('source');
            webmSource.src = `/movies/${videoRarity}.webm`;
            webmSource.type = 'video/webm';
            
            const mp4Source = document.createElement('source');
            mp4Source.src = `/movies/${videoRarity}.mp4`;
            mp4Source.type = 'video/mp4';
            
            // 既存のソースをクリアして新しいソースを追加
            while (videoRef.current.firstChild) {
              videoRef.current.removeChild(videoRef.current.firstChild);
            }
            
            videoRef.current.appendChild(webmSource);
            videoRef.current.appendChild(mp4Source);
            
            // 動画のロードを確実に行う
            videoRef.current.load();
            
            // 動画再生完了時の処理
            videoRef.current.onended = () => {
              console.log("Video playback ended");
              // 即座に結果を表示
              setIsLoading(false);
              setShowResults(true);
            };
            
            // 動画再生エラー時のフォールバック
            videoRef.current.onerror = () => {
              console.error("Video playback error");
              setIsLoading(false);
              setShowResults(true);
            };
            
            // 動画が準備できたら再生
            videoRef.current.oncanplay = () => {
              const playPromise = videoRef.current!.play();
              
              if (playPromise !== undefined) {
                playPromise.catch(err => {
                  console.error("Error playing video:", err);
                  // 動画再生に失敗した場合は結果を直接表示
                  setIsLoading(false);
                  setShowResults(true);
                });
              }
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
        toast.error("ガチャアイテムの処理に失敗しました");
        // エラー画面を表示せずにガチャ一覧に戻る
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          safeRedirect('/gacha');
        }
      }
    } catch (error) {
      console.error("Error processing gacha results:", error);
      toast.error("ガチャ結果の処理に失敗しました");
      // エラー画面を表示せずにガチャ一覧に戻る
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        safeRedirect('/gacha');
      }
    }
  }, [searchParams, dispatch])

  // 10連ガチャのアニメーション制御
  useEffect(() => {
    if (showResults && isMultiDraw) {
      if (animationPhase === 'first-card') {
        // 最初のカードを3秒間表示
        const timer = setTimeout(() => {
          setAnimationPhase('fade-out');
          // フェードアウト開始
          setShowFirstCard(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      } 
      else if (animationPhase === 'fade-out') {
        // フェードアウト後すぐにフェードイン開始（タイミングを短縮）
        const timer = setTimeout(() => {
          setAnimationPhase('multi-cards');
          setShowMultiDrawAnimation(true);
        }, 500); // フェードアウトの時間を短縮（1000ms→500ms）
        
        return () => clearTimeout(timer);
      }
    }
  }, [showResults, isMultiDraw, animationPhase]);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, uniqueResults.length - 1))
  }

  // 購入確認ダイアログを表示する関数
  const showPurchaseConfirmation = (times: number) => {
    // 価格を計算
    let price: number | string = 0;
    try {
      if (gacha?.price) {
        price = times === 1 
          ? Number(gacha.price) 
          : Number(gacha.price) * times;
      }
    } catch (e) {
      price = "不明";
    }

    // 購入情報を設定
    setPurchaseInfo({ times, price });
    
    // ダイアログを表示
    setConfirmDialogOpen(true);
  };

  // 確認後に実際に購入を実行する関数
  const executePurchase = async () => {
    if (!hasStock) {
      toast.error("ガチャアイテムの在庫がありません");
      return;
    }
    
    try {
      setIsDrawing(true);
      
      // ガチャアイテムの在庫確認（APIがサポートしている場合）
      try {
        // ガチャの在庫情報を取得（オプション）
        const stockCheck = await api.get(`/admin/gacha/${gacha?.id}/stock-check`).catch(() => null);
        
        // 在庫情報がある場合は確認
        if (stockCheck?.data?.availableItems === 0 || stockCheck?.data?.isEmpty) {
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
          setIsDrawing(false);
          return;
        }
      } catch (stockError) {
        // 在庫確認APIがない場合は無視して続行
        console.log("Stock check API not available, continuing...");
      }
      
      // Make API call to purchase and pull gacha
      const response = await api.post(`/admin/gacha/${gacha?.id}/pull`, {
        times: purchaseInfo.times,
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

        // 新しいガチャ結果のため、sessionStorageをクリア
        if (typeof window !== 'undefined') {
          // 現在のガチャ結果に関連するキーを削除（リロード判定用）
          const currentResultKey = `gacha_result_${gacha?.id}_${resultData.pullTime}`;
          sessionStorage.removeItem(currentResultKey);
        }

        // Using safe redirect function
        const resultUrl = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          safeRedirect(resultUrl);
        }
      } else {
        // アイテムが空の場合はトーストだけ表示
        toast.error("ガチャアイテムの在庫がありません");
        setHasStock(false);
        // 現在のページにとどまる（エラー画面に遷移しない）
      }
    } catch (error: any) {
      // エラーメッセージの詳細化
      if (error.response?.data?.code === 'OUT_OF_STOCK' || 
          error.response?.status === 409 || 
          error.response?.data?.message?.includes('stock') || 
          error.response?.data?.message?.includes('在庫')) {
        toast.error("ガチャアイテムの在庫がありません");
        setHasStock(false);
      } else {
        toast.error(t("gacha.error.pull.title"), {
          description: error.response?.data?.message || t("gacha.error.pull.description")
        });
      }
    } finally {
      setIsDrawing(false)
    }
  };

  // 元のhandleDraw関数を置き換え
  const handleDraw = (e: React.MouseEvent, times: number) => {
    e.preventDefault();
    if (!hasStock) {
      toast.error("ガチャアイテムの在庫がありません");
      return;
    }
    
    // 購入確認ダイアログを表示
    showPurchaseConfirmation(times);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  // エラーが発生した場合でもエラー画面は表示せず、ガチャ一覧に戻るようにする
  // エラー画面は削除し、すべてトーストメッセージで対応
  if (hasError) {
    // エラー画面を表示せずにガチャ一覧に戻る
    useEffect(() => {
      toast.error(errorMessage);
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        safeRedirect('/gacha');
      }
    }, []);
    // ローディング表示を返す（すぐにリダイレクトするため）
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>リダイレクト中...</p>
      </div>
    );
  }

  // 読み込み中の場合
  if (isLoading) {
    // 最高レアリティを取得
    const videoRarity = getVideoByRarity(uniqueResults);
    console.log(`Playing video for rarity: ${videoRarity}`);
    
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay={false} // 明示的にfalseに設定し、oncanplayイベントで再生
          muted={true}
          preload="auto"
        >
          {/* ソースはJavaScriptで動的に追加 */}
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
          <p className="text-xl mb-4">結果を準備しています...</p>
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

  // Action buttons
  const renderActionButtons = () => (
    <div className="w-full max-w-3xl mt-8 flex justify-center">
      <div className="flex gap-4 w-full max-w-md">
        <Button 
          onClick={(e) => handleDraw(e, 1)}
          disabled={isDrawing || !hasStock}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center flex-1"
        >          <p className="text-lg font-bold">{t("gacha.result.oneDraw")}</p>

          <Coins className="mr-2 h-4 w-4" />
          <p className="text-lg font-bold">
            ¥{(() => {
              try {
                return gacha?.price !== undefined && gacha?.price !== null 
                  ? Number(gacha.price).toLocaleString() 
                  : '0';
              } catch (e) {
                return '0';
              }
            })()}
          </p>
          {!hasStock && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </span>
          )}
        </Button>
        <Button 
          onClick={(e) => handleDraw(e, 10)}
          disabled={isDrawing || !hasStock}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center flex-1"
        >
                    <p className="text-lg font-bold">{t("gacha.result.multi_draw")}</p>

          <RotateCcw className="mr-2 h-4 w-4" />
          <p className="text-lg font-bold">
            ¥{(() => {
              try {
                return gacha?.price !== undefined && gacha?.price !== null
                  ? (Number(gacha.price) * 10).toLocaleString()
                  : '0';
              } catch (e) {
                return '0';
              }
            })()}
          </p>
          {!hasStock && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  // 10連ガチャの結果表示
  const renderMultiDrawResults = () => {
    if (!originalItems || originalItems.length < 10) return null;
    
    // レア度順にソート
    const sortedItems = [...originalItems].sort((a, b) => {
      const rarityA = a.rarity.toUpperCase() as RarityKey;
      const rarityB = b.rarity.toUpperCase() as RarityKey;
      return (RARITY_ORDER[rarityB] || 0) - (RARITY_ORDER[rarityA] || 0);
    });
    
    // 上段5枚、下段5枚で表示
    return (
      <div className={`w-full max-w-3xl mt-8 transition-opacity duration-1000 ${showMultiDrawAnimation ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-xl font-semibold mb-4 text-center">{t("gacha.result.multi_draw")}</h3>
        <div className="grid grid-cols-5 gap-3 mb-3"> {/* gap-2→gap-3, mb-2→mb-3 に変更してカードを大きく */}
          {sortedItems.slice(0, 5).map((item, index) => (
            <div key={`top-${index}`} className="relative">
              <div className="aspect-square relative rounded-lg overflow-hidden border shadow-md"> {/* shadow-md を追加 */}
                <Image 
                  src={item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg"}
                  alt={getLocalizedName(item)}
                  fill
                  className="object-contain p-1"
                />
                <div className="absolute top-0 right-0 p-1">
                  <Badge className={`${getRarityColor(item.rarity)}`}>
                    {formatRarity(item.rarity)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-3"> {/* gap-2→gap-3 に変更してカードを大きく */}
          {sortedItems.slice(5, 10).map((item, index) => (
            <div key={`bottom-${index}`} className="relative">
              <div className="aspect-square relative rounded-lg overflow-hidden border shadow-md"> {/* shadow-md を追加 */}
                <Image 
                  src={item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg"}
                  alt={getLocalizedName(item)}
                  fill
                  className="object-contain p-1"
                />
                <div className="absolute top-0 right-0 p-1">
                  <Badge className={`${getRarityColor(item.rarity)}`}>
                    {formatRarity(item.rarity)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 1枚目のカード表示（10連ガチャの最初の演出）
  const renderFirstCard = () => {
    if (!originalItems || originalItems.length === 0) return null;
    
    // 最初のカード（レア度順ではなく、実際に引いた順の最初のカード）
    const firstCard = originalItems[0];
    
    return (
      <div className={`w-full max-w-md mx-auto transition-opacity duration-1000 ${animationPhase === 'first-card' ? 'opacity-100' : 'opacity-0'} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
        <Card className="border-0 bg-zinc-50 overflow-hidden rounded-xl shadow-lg animate-pulse-slow">
          <div className="aspect-square relative">
            <Image 
              src={firstCard?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${firstCard.imageUrl}` : "/placeholder.svg"}
              alt={getLocalizedName(firstCard)}
              fill
              className="object-contain p-4"
            />
          </div>
          <div className="p-6 text-center">
            <Badge className={`mb-3 ${getRarityColor(firstCard?.rarity || "")}`}>
              {formatRarity(firstCard?.rarity || "")}
            </Badge>
            <h2 className="text-2xl font-bold mb-2">{getLocalizedName(firstCard)}</h2>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen bg-white flex flex-col items-center py-8 px-4 
        ${showResults ? 'animate-fadeIn' : 'opacity-0'}`}>
        <div className="w-full max-w-3xl text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("gacha.result.title")}</h1>
          <p className="text-gray-600">
            {t("gacha.result.congratulations")} {!isMultiDraw && `(${currentIndex + 1}/${uniqueResults.length})`}
          </p>
        </div>

        {/* 10連ガチャの場合 */}
        {isMultiDraw && (
          <div className="relative w-full flex justify-center min-h-[50vh]"> {/* min-heightを追加して十分な高さを確保 */}
            {/* 1枚目のカード表示 */}
            {renderFirstCard()}
            
            {/* 10連表示 - 中央に配置 */}
            <div className="w-full flex justify-center items-center">
              {renderMultiDrawResults()}
            </div>
          </div>
        )}

        {/* 単発ガチャまたは通常表示 */}
        {(!isMultiDraw || originalItems.length < 10) && (
          <>
            {/* Main item card display */}
            <div className="w-full max-w-md relative">
              <Card className="border-0 bg-zinc-50 overflow-hidden rounded-xl shadow-lg">
                <div className="aspect-square relative">
                  <Image 
                    src={currentItem?.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${currentItem.imageUrl}` : "/placeholder.svg"}
                    alt={currentItem ? getLocalizedName(currentItem) : ""}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-6 text-center">
                  <Badge className={`mb-3 ${getRarityColor(currentItem?.rarity || "")}`}>
                    {formatRarity(currentItem?.rarity || "")}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2">{currentItem ? getLocalizedName(currentItem) : ""}</h2>
                  <p className="text-gray-500 mb-4">×{currentItem?.count || 0}</p>
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
          </>
        )}

        {/* Action buttons */}
        {renderActionButtons()}
      </div>

      {/* 購入確認ダイアログ */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>購入の確認</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseInfo.times === 1 ? "単発" : "10連"}ガチャを引きます。
              <br />
              価格: ¥{typeof purchaseInfo.price === 'number' ? purchaseInfo.price.toLocaleString() : purchaseInfo.price}
              <br />
              よろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={executePurchase} disabled={isDrawing}>
              {isDrawing ? "処理中..." : "購入する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
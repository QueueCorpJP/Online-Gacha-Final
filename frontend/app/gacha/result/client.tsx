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
import { GachaMultiDraw } from "@/components/product/gacha-multi-draw"
import { GachaHundredDraw } from "@/components/product/gacha-hundred-draw"
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
  
  // 最高レアリティを取得（10連の場合も全アイテムから最高レアリティを検索）
  const highestRarity = getHighestRarity(items);
  
  // レア度を大文字に統一して返す
  // 動画ファイル名は A.webm, B.webm, C.webm, D.webm, S.webm の形式
  const normalizedRarity = highestRarity.toUpperCase();
  
  // 有効なレア度のみを許可（A, B, C, D, S）
  if (['A', 'B', 'C', 'D', 'S'].includes(normalizedRarity)) {
    console.log(`10連ガチャの場合、最高レアリティ ${normalizedRarity} の演出を表示します`);
    return normalizedRarity;
  }
  
  // 不明なレア度の場合はデフォルトとしてDを返す
  return 'D';
}

// 安全なリダイレクト関数
function safeRedirect(url: string): void {
  try {
    // 現在のURLと同じでないことを確認（無限リダイレクト防止）
    if (window.location.href !== url) {
      window.location.href = url;
    }
  } catch (error) {
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
  const [multiDrawMode, setMultiDrawMode] = useState(false) // 新しい多重引きモード状態
  const [hundredDrawMode, setHundredDrawMode] = useState(false) // 100連ガチャモード
  const [showActionButtons, setShowActionButtons] = useState(true) // アクションボタンの表示状態
  const [showSummary, setShowSummary] = useState(false) // 結果サマリーの表示状態

  // gachaがnullの場合の型エラー対策: gachaがnullの場合はデフォルト値を使う
  const safeGacha = gacha ?? { id: '', price: 0 };

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

  // 在庫チェック関数
  const checkStock = async () => {
    if (!gacha?.id) return;
    
    try {
      // /admin/gacha/ を /gacha/ に変更
      const response = await api.get(`/gacha/${gacha.id}/stock-check`).catch(() => null);
      
      if (response?.data) {
        const hasAvailableItems = !(response.data.availableItems === 0 || response.data.isEmpty);
        setHasStock(hasAvailableItems);
        
        if (!hasAvailableItems) {
          // 在庫がない
        }
      }
    } catch (error) {
      // APIがサポートされていない場合は在庫ありと仮定
      setHasStock(true);
    }
  };

  // ガチャを引く処理
  const handleRetryGacha = async () => {
    try {
      setIsDrawing(true);
      
      if (!gacha?.id) {
        toast.error("ガチャデータがありません");
        setIsDrawing(false);
        return;
      }
      
      // 在庫確認
      try {
        // checkGachaStock関数の代わりに直接APIを呼び出す
        const stockCheckResponse = await api.get(`/gacha/${gacha.id}/stock-check`).catch(() => null);
        if (stockCheckResponse?.data?.availableItems === 0 || stockCheckResponse?.data?.isEmpty) {
          toast.error("ガチャアイテムの在庫がありません");
          setIsDrawing(false);
          return;
        }
      } catch (stockError) {
        // 在庫確認APIがない場合は続行
      }
      
      // ガチャを引く
      const response = await api.post(`/gacha/${gacha.id}/pull`);
      const resultData = response.data;
      
      // ガチャ結果をURLパラメータとして渡す
      const encodedData = btoa(JSON.stringify(resultData));
      
      // 結果画面への遷移URL
      const resultUrl = `/gacha/result?data=${encodedData}`;
      
      // 結果画面へリダイレクト
      safeRedirect(resultUrl);
    } catch (error) {
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    // ガチャ情報が取得できたら在庫確認を実行
    if (gacha?.id) {
      checkStock();
    }
  }, [gacha]);

  // useEffect内でデータの読み込み処理を行う
  useEffect(() => {
    if (!searchParams) return;

    try {
      // URLパラメータからデータを取得 (古い形式)
      const encodedData = searchParams.get('data');
      
      // データがなければエラー
      if (!encodedData) {
        setHasError(true);
        return;
      }

      // データをデコードして解析
      let parsedData: PullResult;
      try {
        parsedData = JSON.parse(decodeURIComponent(encodedData));
      } catch (e) {
        // Base64エンコードの場合はデコードを試みる
        try {
          const decodedData = atob(encodedData);
          parsedData = JSON.parse(decodedData);
        } catch (e2) {
          throw new Error("データの解析に失敗しました");
        }
      }

      // ガチャIDがある場合は取得
      if (parsedData.gachaId) {
        dispatch(fetchGachaById(parsedData.gachaId));
      }

      // アイテムデータを取得
      const parsedItems = parsedData.items;
      
      // ガチャアイテムがない場合はエラー
      if (!parsedItems || parsedItems.length === 0) {
        setHasError(true);
        setErrorMessage("ガチャアイテムがありません");
        return;
      }

      // マルチドロー判定 (10連や100連)
      if (parsedItems.length > 1) {
        setIsMultiDraw(true);
        setMultiDrawMode(true);
        setShowActionButtons(false);
      } else {
        setIsMultiDraw(false);
        setMultiDrawMode(false);
        setShowActionButtons(true);
      }

      // ガチャ結果を処理
      const { uniqueItems, grouped } = processGachaResults(parsedItems);
      setUniqueResults(uniqueItems);
      setGroupedResults(grouped);

      // 再表示を防止するためにセッションストレージに保存
      if (typeof window !== 'undefined' && parsedData.gachaId && parsedData.pullTime) {
        const resultKey = `gacha_result_${parsedData.gachaId}_${parsedData.pullTime}`;
        sessionStorage.setItem(resultKey, 'displayed');
      }

      // 最高レアリティに基づいて動画ファイルを決定
      // 10連ガチャの場合も、全アイテムの中から最もレアリティの高いものの演出を選択
      const rarity = getVideoByRarity(parsedItems);
      console.log(`選択された演出動画: ${rarity}.webm (${parsedItems.length}連ガチャ)`);
      const videoPath = `/movies/${rarity}.webm`;

      // ビデオ要素の初期化
      if (videoRef.current) {
        videoRef.current.src = videoPath;
        videoRef.current.oncanplay = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              // 自動再生に失敗した場合は結果を直接表示
              setIsLoading(false);
              setShowResults(true);
            });
          }
        };
        videoRef.current.onended = () => {
          setIsLoading(false);
          setShowResults(true);
        };
      } else {
        // ビデオ要素がない場合は直接結果を表示
        setIsLoading(false);
        setShowResults(true);
      }
    } catch (processError) {
      console.error(processError);
      toast.error("ガチャアイテムの処理に失敗しました");
      // エラー画面を表示せずにガチャ一覧に戻る
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        // トップページにリダイレクト
        window.location.href = '/';
      }
    }
  }, [searchParams, dispatch]);

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
        // フェードアウト後にすぐに表示（フェードインなし）
        const timer = setTimeout(() => {
          setAnimationPhase('multi-cards');
          setShowMultiDrawAnimation(true);
          
          // 最初のカード要素を完全に非表示にする（DOM上からも消す）
          const removeTimer = setTimeout(() => {
            const firstCardElement = document.querySelector('.first-card-container');
            if (firstCardElement) {
              firstCardElement.classList.add('hidden');
            }
          }, 500);
          
          return () => {
            clearTimeout(removeTimer);
          };
        }, 300); // フェードアウト後すぐに表示
        
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

  // 購入処理を実行
  const executePurchase = async () => {
    if (!gacha) {
      toast.error("ガチャデータがありません");
      setConfirmDialogOpen(false);
      return;
    }

    try {
      setIsDrawing(true);
      // 在庫確認を実行
      try {
        const stockResponse = await api.get(`/gacha/${gacha.id}/stock-check`).catch(() => null);
        if (stockResponse?.data?.availableItems === 0 || stockResponse?.data?.isEmpty) {
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
          setIsDrawing(false);
          return;
        }
      } catch (stockError) {
        // 在庫確認APIがない場合は無視して続行
      }

      // 100連ガチャの場合
      if (purchaseInfo.times === 100) {
        setShowActionButtons(false);
        setShowSummary(false);
        setHundredDrawMode(true);
        return;
      }
      
      // --- ここから複数回ガチャ時のAPI呼び出しロジック ---
      if (purchaseInfo.times > 1) {
        setShowActionButtons(false);
        setShowSummary(false);
        
        // 10連ガチャの場合、サーバー側で各回ごとに独立した確率計算が行われる
        // timesパラメータは単に回数を指定するだけで、各回は個別の抽選として処理される
        const response = await api.post(`/gacha/${gacha.id}/pull`, { 
          times: purchaseInfo.times, 
          isFree: false 
        });
        
        if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
          // 各アイテムはサーバー側で個別に確率計算された結果
          const allResults = response.data.items;
          
          // 10個のアイテムを結果画面に表示するためのデータを準備
          const resultData = {
            items: allResults, // 10個の個別に抽選されたアイテム
            gachaId: gacha.id,
            pullTime: new Date().toISOString()
          };
          
          if (typeof window !== 'undefined') {
            const currentResultKey = `gacha_result_${gacha.id}_${resultData.pullTime}`;
            sessionStorage.removeItem(currentResultKey);
          }
          
          const resultUrl = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
          if (!isRedirecting.current) {
            isRedirecting.current = true;
            safeRedirect(resultUrl);
          }
        } else {
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
        }
      } else {
        // 単発は従来通り
        const response = await api.post(`/gacha/${gacha.id}/pull`, {
          times: purchaseInfo.times,
          isFree: false,
        });
        if (response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
          const resultData = {
            items: response.data.items,
            gachaId: gacha.id,
            pullTime: new Date().toISOString()
          };
          if (typeof window !== 'undefined') {
            const currentResultKey = `gacha_result_${gacha.id}_${resultData.pullTime}`;
            sessionStorage.removeItem(currentResultKey);
          }
          const resultUrl = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
          if (!isRedirecting.current) {
            isRedirecting.current = true;
            safeRedirect(resultUrl);
          }
        } else {
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
        }
      }
    } catch (error: any) {
      if (error.response?.data?.code === 'OUT_OF_STOCK' || 
          error.response?.status === 409 || 
          error.response?.data?.message?.includes('stock') || 
          error.response?.data?.message?.includes('在庫')) {
        toast.error("ガチャアイテムの在庫がありません");
        setHasStock(false);
      } else {
        toast.error("ガチャ購入処理でエラーが発生しました。再度お試しください。");
      }
    } finally {
      setIsDrawing(false);
      setConfirmDialogOpen(false);
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

  // 100連ガチャ処理
  const handleHundredDraw = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasStock) {
      toast.error("ガチャアイテムの在庫がありません");
      return;
    }
    
    // 購入確認ダイアログを表示
    showPurchaseConfirmation(100);
  };

  // 100連ガチャの完了ハンドラ
  const handleHundredDrawComplete = (results: any[]) => {
    // 結果を保存
    const resultData = {
      items: results,
      gachaId: gacha?.id,
      pullTime: new Date().toISOString()
    };
    
    // 結果画面に遷移
    if (typeof window !== 'undefined') {
      const currentResultKey = `gacha_result_${gacha?.id}_${resultData.pullTime}`;
      sessionStorage.removeItem(currentResultKey);
    }
    
    const resultUrl = `/gacha/result?data=${encodeURIComponent(JSON.stringify(resultData))}`;
    if (!isRedirecting.current) {
      isRedirecting.current = true;
      safeRedirect(resultUrl);
    }
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

  // 多重引きモードの完了ハンドラ
  const handleMultiDrawComplete = () => {
    setMultiDrawMode(false);
    setShowSummary(true);
    setShowActionButtons(true);
  }

  return (
    <>
      {/* 100連ガチャモード */}
      {hundredDrawMode && gacha?.id && (
        <div className="min-h-screen bg-white flex flex-col items-center py-8 px-4">
          <div className="w-full max-h-3xl text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">100連ガチャを引いています</h1>
          </div>
          <GachaHundredDraw 
            gachaId={gacha.id} 
            onComplete={handleHundredDrawComplete}
            totalBatches={10} // 10バッチで合計100連
            batchSize={10}   // 1バッチは10連
          />
        </div>
      )}

      {/* 通常の結果表示 */}
      {!hundredDrawMode && (
        <div className={`min-h-screen bg-white flex flex-col items-center py-8 px-4 
          ${showResults ? 'animate-fadeIn' : 'opacity-0'}`}>
          {/* タイトル・サマリーに10連の回数を明示 */}
          <div className="w-full max-h-3xl text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {isMultiDraw && originalItems.length > 1 ? `ガチャ結果（${originalItems.length}連）` : 'ガチャ結果'}
            </h1>
            <p className="text-gray-600">
              おめでとうございます！
            </p>
          </div>

          {/* 10連・複数回ガチャも単発と同じリザルトUIでまとめて表示 */}
          <div className="w-full max-w-3xl mt-8 space-y-4">
            <h3 className="text-xl font-semibold">{isMultiDraw && originalItems.length > 1 ? `結果一覧（${originalItems.length}枚）` : '結果一覧'}</h3>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {originalItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-zinc-50 p-3 rounded-lg border border-gray-100">
                    <div className="h-20 w-20 relative mb-2">
                      <Image
                        src={item.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}` : "/placeholder.svg"}
                        alt={getLocalizedName(item)}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <div className="w-full text-center">
                      <p className="text-sm font-medium truncate">{getLocalizedName(item)}</p>
                      <span className={`text-xs font-bold ${getRarityColor(item.rarity)} px-2 py-0.5 rounded`}>{formatRarity(item.rarity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サマリー（集計）表示はそのまま残す */}
          <div className="w-full max-w-3xl mt-8 space-y-4">
            <h3 className="text-xl font-semibold">{isMultiDraw && originalItems.length > 1 ? `サマリー（${originalItems.length}枚）` : 'サマリー'}</h3>
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

          {/* アクションボタン（単発/10連ガチャボタンはリザルト下に表示） */}
          {showActionButtons && (
            <div className="w-full max-w-3xl mt-8 flex justify-center relative z-10">
              <div className="flex gap-4 w-full max-w-md flex-wrap">
                <Button 
                  onClick={(e) => handleDraw(e, 1)}
                  disabled={isDrawing || !hasStock}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center flex-1"
                >
                  <p className="text-lg font-bold">単発</p>
                  <Coins className="mr-2 h-4 w-4" />
                  <p className="text-lg font-bold">
                    ¥{(() => {
                      try {
                        return safeGacha.price !== undefined && safeGacha.price !== null 
                          ? Number(safeGacha.price).toLocaleString() 
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
                {/* もう一度引くボタン */}
                <Button 
                  onClick={handleRetryGacha}
                  disabled={isDrawing || !hasStock}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <p className="text-lg font-bold">もう一度</p>
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
                  <p className="text-lg font-bold">10連</p>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <p className="text-lg font-bold">
                    ¥{(() => {
                      try {
                        return safeGacha.price !== undefined && safeGacha.price !== null
                          ? (Number(safeGacha.price) * 10).toLocaleString()
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
                {/* 100連ガチャボタン */}
                <Button 
                  onClick={handleHundredDraw}
                  disabled={isDrawing || !hasStock}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center w-full mt-2"
                >
                  <p className="text-lg font-bold">100連ガチャ</p>
                  <Coins className="mx-2 h-4 w-4" />
                  <p className="text-lg font-bold">
                    ¥{(() => {
                      try {
                        return safeGacha.price !== undefined && safeGacha.price !== null
                          ? (Number(safeGacha.price) * 100).toLocaleString()
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
          )}
        </div>
      )}

      {/* 購入確認ダイアログ */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>購入の確認</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseInfo.times === 1 ? "単発" : 
               purchaseInfo.times === 10 ? "10連" : 
               purchaseInfo.times === 100 ? "100連" : `${purchaseInfo.times}連`}
              ガチャを引きます。
              <br />
              価格: ¥{typeof purchaseInfo.price === 'number' ? purchaseInfo.price.toLocaleString() : purchaseInfo.price}
              <br />
              {purchaseInfo.times === 100 && 
                <span className="text-red-500 mt-2 block">
                  ※100連ガチャは10連を10回実行します。
                  <br/>
                  各カードの表示後、次に進むボタンをクリックしてください。
                </span>
              }
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
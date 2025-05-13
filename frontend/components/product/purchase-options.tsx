import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { api } from "@/lib/axios"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { fetchProfile } from "@/redux/features/profileSlice"
import { AlertCircle } from "lucide-react"
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

interface PurchaseOption {
  type: string
  price?: string | number
  discount?: string
  isFree?: boolean
  times?: number
}

interface GachaPurchaseOptionsProps {
  options: PurchaseOption[]
  gachaId: string
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

export function GachaPurchaseOptions({ options, gachaId }: GachaPurchaseOptionsProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslations()
  const [isProcessing, setIsProcessing] = useState(false)
  const userBalance = useSelector((state: RootState) => state.profile.data?.coinBalance || 0);
  const isRedirecting = useRef(false); // リダイレクト状態を管理する参照
  const [hasStock, setHasStock] = useState(true); // 在庫状態を管理
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // 確認ダイアログの表示状態
  const [selectedOption, setSelectedOption] = useState<PurchaseOption | null>(null); // 選択されたオプション

  useEffect(() => {
    dispatch(fetchProfile())
    // コンポーネントマウント時に在庫確認
    checkStock();
  }, [dispatch])

  useEffect(() => {
    console.log(userBalance);
  }, [userBalance])

  // 在庫確認関数
  const checkStock = async () => {
    if (!gachaId) return;
    
    try {
      const response = await api.get(`/admin/gacha/${gachaId}/stock-check`).catch(() => null);
      
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

  // 購入確認ダイアログを表示する関数
  const showConfirmDialog = (option: PurchaseOption) => {
    // 在庫がない場合は処理を中断
    if (!hasStock) {
      toast.error("ガチャアイテムの在庫がありません");
      return;
    }

    // 残高チェック
    if (!option.isFree && option.price) {
      const price = typeof option.price === 'number' ? option.price : 0;
      if (userBalance < price) {
        toast.error(t("gacha.error.insufficient.balance.title"), {
          description: t("gacha.error.insufficient.balance.description"),
        });
        return;
      }
    }

    // 選択されたオプションを保存
    setSelectedOption(option);
    // 確認ダイアログを表示
    setConfirmDialogOpen(true);
  };

  const handlePurchase = async () => {
    // 選択されたオプションがない場合は処理を中断
    if (!selectedOption) return;
    
    try {
      setIsProcessing(true);

      // ガチャアイテムの在庫確認（APIがサポートしている場合）
      try {
        // ガチャの在庫情報を取得（オプション）
        const stockCheck = await api.get(`/admin/gacha/${gachaId}/stock-check`).catch(() => null);
        
        // 在庫情報がある場合は確認
        if (stockCheck?.data?.availableItems === 0 || stockCheck?.data?.isEmpty) {
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
          setIsProcessing(false);
          return;
        }
      } catch (stockError) {
        // 在庫確認APIがない場合は無視して続行
        console.log("Stock check API not available, continuing...");
      }

      // Make API call to purchase and pull gacha
      const response = await api.post(`/admin/gacha/${gachaId}/pull`, {
        times: selectedOption.times || 1,
        isFree: selectedOption.isFree,
      })

      // Show results
      if (response.data.items) {
        // アイテムが空の場合は在庫切れと判断
        if (!Array.isArray(response.data.items) || response.data.items.length === 0) {
          toast.error("ガチャアイテムの在庫がありません");
          setHasStock(false);
          return;
        }
        
        // Store the result data and redirect
        const resultData = {
          items: response.data.items,
          gachaId: gachaId,
          pullTime: new Date().toISOString()
        };

        console.log("Gacha pull successful. Result data:", resultData);
        
        try {
          // URLパラメータを安全にエンコード
          const encodedData = encodeURIComponent(JSON.stringify(resultData));
          console.log("Encoded data length:", encodedData.length);
          
          // リダイレクト
          const resultUrl = `/gacha/result?data=${encodedData}`;
          console.log("Redirecting to:", resultUrl);
          
          // 安全なリダイレクト処理
          if (!isRedirecting.current) {
            isRedirecting.current = true;
            safeRedirect(resultUrl);
          }
        } catch (err) {
          console.error("Error during redirect:", err);
          toast.error("ガチャ結果の表示に失敗しました");
        }
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
      setIsProcessing(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">{option.type}</div>
              <div className={option.isFree ? "text-[#7C3AED]" : "text-xl font-bold"}>
                {typeof option.price === "number" ? `${t("gacha.card.pricePerTry", { price: option.price.toLocaleString() })}` : option.price}
              </div>
              {option.discount && <div className="text-sm text-[#7C3AED]">{option.discount}</div>}
            </div>
            <Button
              variant={option.isFree ? "default" : "outline"}
              className={
                option.isFree ? "bg-[#7C3AED] hover:bg-[#6D28D9]" : "text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white"
              }
              onClick={() => showConfirmDialog(option)}
              disabled={isProcessing || !hasStock}
            >
              {isProcessing 
                ? t("payment.details.processing")
                : option.isFree 
                  ? t("gacha.purchase.button.pull") 
                  : t("gacha.purchase.button.buy")
              }
              {!hasStock && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </span>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* 購入確認ダイアログ */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>購入の確認</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOption?.type}を引きます。
              <br />
              {selectedOption?.isFree 
                ? "無料ガチャです。" 
                : `価格: ${typeof selectedOption?.price === 'number' 
                    ? `¥${selectedOption.price.toLocaleString()}` 
                    : selectedOption?.price}`}
              <br />
              よろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handlePurchase} disabled={isProcessing}>
              {isProcessing ? "処理中..." : "購入する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

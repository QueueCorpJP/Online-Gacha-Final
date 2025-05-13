import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { api } from "@/lib/axios"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { fetchProfile } from "@/redux/features/profileSlice"

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

export function GachaPurchaseOptions({ options, gachaId }: GachaPurchaseOptionsProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslations()
  const [isProcessing, setIsProcessing] = useState(false)
  const userBalance = useSelector((state: RootState) => state.profile.data?.coinBalance || 0);

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    console.log(userBalance);

  }, [userBalance])

  const handlePurchase = async (option: PurchaseOption) => {
    try {
      setIsProcessing(true)

      // If it's not free, check if user has enough balance
      if (!option.isFree && option.price) {
        const price = typeof option.price === 'number' ? option.price : 0;

        console.log(price);
        if (userBalance < price) {
          toast.error(t("gacha.error.insufficient.balance.title"), {
            description: t("gacha.error.insufficient.balance.description"),
          })
          return
        }
      }

      // Make API call to purchase and pull gacha
      const response = await api.post(`/admin/gacha/${gachaId}/pull`, {
        times: option.times || 1,
        isFree: option.isFree,
      })

      // Show results
      if (response.data.items) {
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
          window.location.href = resultUrl;
        } catch (err) {
          console.error("Error during redirect:", err);
          toast.error("ガチャ結果の表示に失敗しました");
        }
      }
    } catch (error: any) {
      toast.error(t("gacha.error.pull.title"), {
        description: error.response?.data?.message || t("gacha.error.pull.description")
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
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
            onClick={() => handlePurchase(option)}
            disabled={isProcessing}
          >
            {isProcessing 
              ? t("payment.details.processing")
              : option.isFree 
                ? t("gacha.purchase.button.pull") 
                : t("gacha.purchase.button.buy")
            }
          </Button>
        </div>
      ))}
    </div>
  )
}

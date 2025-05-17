"use client"

import { Coins } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSelector } from "react-redux"
import { loadStripe } from "@stripe/stripe-js"
import { useTranslations } from "@/hooks/use-translations"
import { PaymentMethodDialog } from "./payment-method-dialog"
import { useToast } from "@/components/ui/use-toast"
import type { RootState } from "@/redux/store"
import { api } from "@/lib/axios"
import { PaymentDetailsDialog } from "./payment-details-dialog"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const coinOptions = [
  { coins: 500, price: 500 },
  { coins: 1_000, price: 1_000 },
  { coins: 3_000, price: 3_000 },
  { coins: 5_000, price: 5_000 },
  { coins: 10_000, price: 10_000 },
  { coins: 30_000, price: 30_000 },
  { coins: 50_000, price: 50_000 },
  { coins: 100_000, price: 100_000 },
  { coins: 200_000, price: 200_000 },
  // Stripeの要件により200,000円以上は購入できません
  // { coins: 300_000, price: 300_000 },
  // { coins: 500_000, price: 500_000 },
  // { coins: 1_000_000, price: 1_000_000 },
]

export function Charge() {
  const { t } = useTranslations()
  const { toast } = useToast()
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  
  const paymentMethod = useSelector((state: RootState) => state.paymentMethod.selectedMethod)
  const userBalance = useSelector((state: RootState) => state.auth.user?.coinBalance ?? 0)

  console.log(paymentMethod)

  const handlePurchase = async (coins: number, price: number) => {
    if (!paymentMethod) {
      setIsMethodDialogOpen(true)
      return
    }

    // 200,000円の上限チェックは不要になりました。
    // すべての支払い方法で200,000円までしか選択できないようにUI上で制限されています。

    try {
      setIsProcessing(true)
      
      // Create payment intent
      const response = await api.post('/payments/create-intent', {
        amount: price,
        coins: coins,
      })

      console.log(clientSecret)

      if (!response.data?.clientSecret) {
        throw new Error('No client secret received from server')
      }

      setSelectedCoins(coins)
      setSelectedPrice(price)
      setClientSecret(response.data.clientSecret)
      setIsDetailsDialogOpen(true)
    } catch (error: any) {
      console.error('Failed to create payment intent:', error)
      
      toast({
        title: t("payment.error.title"),
        description: error.response?.data?.message || t("payment.error.description"),
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentDetails = async (paymentMethod: any) => {
    if (!selectedCoins || !selectedPrice || !clientSecret) return;

    try {
      setIsProcessing(true);
      
      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Redirect to the payment complete page
      window.location.href = `${window.location.origin}/payment/complete?payment_intent=${paymentMethod.id}`;
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Error",
        description: "Payment failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsDetailsDialogOpen(false);
    }
  }

  const handleMethodDialogChange = (open: boolean) => {
    setIsMethodDialogOpen(open)
    if (!open && selectedCoins && selectedPrice && paymentMethod) {
      // When payment method dialog closes, trigger the payment intent creation
      handlePurchase(selectedCoins, selectedPrice)
    }
  }

  return (
    <>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">
            {paymentMethod 
              ? t(`payment.dialog.methods.${paymentMethod}.name`)
              : t("charge.title.default")
            }
          </h1>
          <p className="text-gray-600">
            {paymentMethod 
              ? t(`payment.dialog.methods.${paymentMethod}.description`)
              : t("charge.description.default")
            }
          </p>

          <div className="mt-4 flex items-center gap-2 text-lg">
            <span className="text-gray-600">{t("charge.currentBalance")}</span>
            <div className="flex items-center gap-1">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span>{userBalance.toLocaleString()} {t("charge.coin")}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {coinOptions.map(({ coins, price }) => (
            <div key={coins} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{coins.toLocaleString()}</span>
                <span>{t("charge.coin")}</span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span>{coins.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => handlePurchase(coins, price)}
                disabled={isProcessing}
                className="rounded-full bg-yellow-400 px-6 py-2 font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing 
                  ? t("charge.button.processing")
                  : t("charge.button.charge", { price: price.toLocaleString() })
                }
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/about"
            className="inline-flex w-full items-center justify-center rounded-full border bg-white px-8 py-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {t("charge.legal")}
          </Link>
        </div>
      </div>

      <PaymentMethodDialog 
        open={isMethodDialogOpen} 
        onOpenChange={handleMethodDialogChange}
      />

      {paymentMethod && clientSecret && (
        <PaymentDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          paymentMethod={paymentMethod}
          clientSecret={clientSecret}
          amount={selectedPrice || 0}
          onSubmit={handlePaymentDetails}
        />
      )}
    </>
  )
}

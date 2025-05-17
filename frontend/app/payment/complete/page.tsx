"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { useDispatch } from "react-redux"
import { loadStripe } from "@stripe/stripe-js"
import { api } from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { updateCoinBalance } from "@/redux/features/authSlice"
import { fetchProfile } from "@/redux/features/profileSlice"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

export default function PaymentCompletePage() {
  const { t } = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [newBalance, setNewBalance] = useState<number | null>(null);


  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const paymentIntentId = searchParams.get('payment_intent')
        
        if (!paymentIntentId) {
          throw new Error('No payment intent ID found')
        }

        const response = await api.post('/payments/confirm', {
          paymentIntentId
        })

        if (response.data.success) {
          setStatus('success')
          setNewBalance(response.data.newBalance);

          console.log(response.data.newBalance);
          // Update the coin balance in the header
          // dispatch(updateCoinBalance(response.data.newBalance));
          dispatch(fetchProfile())
        } else {
          setStatus('failed')
        }
      } catch (error) {
        console.error('Payment confirmation failed:', error)
        setStatus('failed')
      }
    }

    confirmPayment()
  }, [searchParams, dispatch])

  const handleReturn = () => {
    router.push('/charge')
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="rounded-lg border bg-white p-8 shadow-sm text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-pulse h-24 w-24 rounded-full bg-gray-200 mx-auto" />
            <h1 className="text-xl font-bold">{t("payment.complete.processing")}</h1>
            <p className="text-gray-500">{t("payment.complete.wait")}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-600">
                {t("payment.complete.success.title")}
              </h1>
              <p className="text-gray-600">
                {t("payment.complete.success.description")}
              </p>
              {newBalance !== null && (
                <p className="text-lg font-semibold mt-4">
                  {t("payment.complete.balance", { balance: newBalance.toLocaleString() })}
                </p>
              )}
            </div>
            <Button 
              onClick={handleReturn}
              className="w-full"
            >
              {t("payment.complete.return")}
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <XCircle className="h-24 w-24 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-600">
                {t("payment.complete.failed.title")}
              </h1>
              <p className="text-gray-600">
                {t("payment.complete.failed.description")}
              </p>
            </div>
            <Button 
              onClick={handleReturn}
              variant="destructive"
              className="w-full"
            >
              {t("payment.complete.tryAgain")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import type { PaymentMethodType } from "@/redux/features/paymentMethodSlice"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { toast } from "sonner"
// import { ApplePayButton } from "@/components/apple-pay-button" // 未使用のため削除
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js'
import CheckoutForm from "./payment/checkout"

// Move stripePromise inside a function to access Redux state
function getStripePromise() {
  const language = localStorage.getItem('language') || 'ja'
  // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY が実際の環境変数名と一致するように修正
  return loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '',
    {
      locale: language as 'ja' | 'en' | 'zh',
    }
  )
}

const stripePromise = getStripePromise()

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error('Stripe publishable key is not set')
}

interface PaymentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: PaymentMethodType
  clientSecret: string | null
  amount: number
  onSubmit: (paymentMethod: any) => void
}

function PaymentForm({ 
  onSubmit, 
  paymentMethod, 
  amount,
  clientSecret 
}: { 
  onSubmit: (paymentMethod: any) => void
  paymentMethod: PaymentMethodType
  amount: number 
  clientSecret: string | null
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { t } = useTranslations()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasBlocker, setHasBlocker] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'paypay') {
      try {
        setIsProcessing(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Create PayPay payment with Authorization header
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/paypay/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Add the Authorization header
          },
          body: JSON.stringify({
            amount,
            coins: amount, // Adjust this calculation as needed
            orderDescription: `${amount}円 チャージ`,
            redirectUrl: `${window.location.origin}/payment/complete`,
          }),
          credentials: 'include', // Include credentials if using cookies
        });

        // if (!response.ok) {
        //   if (response.status === 401) {
        //     // Handle unauthorized error (e.g., redirect to login)
        //     window.location.href = '/login';
        //     return;
        //   }
        //   throw new Error('Payment request failed');
        // }

        const data = await response.json();

        console.log(data);

        if (data.BODY.data.url) {
          // Redirect to PayPay payment page
          window.location.href = data.BODY.data.url;
        } else {
          throw new Error('PayPay payment URL not received');
        }
      } catch (error) {
        console.error('PayPay payment error:', error);
        toast.error(t("payment.error.title"), {
          description: t("payment.error.description")
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Existing Stripe payment logic
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error(submitError);
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/complete`,
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        return;
      }

      if (clientSecret) {
        onSubmit({ id: clientSecret.split('_secret_')[0] });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  // Show PayPay QR code form if PayPay is selected
  if (paymentMethod === 'paypay') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">{t("payment.paypay.description")}</p>
          <p className="text-sm text-gray-500 mb-6">
            {t("payment.paypay.instruction")}
          </p>
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isProcessing}
        >
          {isProcessing 
            ? t("payment.details.processing") 
            : t("payment.paypay.pay", { amount: amount.toLocaleString() })}
        </Button>
      </form>
    );
  }

  // Existing Stripe payment form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
        },
        paymentMethodOrder: ['card'],
        // ウォレット支払いを無効化
        // wallets: {
        //   applePay: 'auto' as const,
        //   googlePay: 'auto' as const
        // }
      }} />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing 
          ? t("payment.details.processing") 
          : t("payment.details.pay", { amount: amount.toLocaleString() })}
      </Button>
    </form>
  );
}

export function PaymentDetailsDialog({ 
  open, 
  onOpenChange, 
  paymentMethod,
  clientSecret,
  amount,
  onSubmit 
}: PaymentDetailsDialogProps) {
  const { t } = useTranslations()

  if (!clientSecret) return null

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
    loader: 'auto',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(`payment.dialog.methods.${paymentMethod}.name`)}
          </DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm 
            onSubmit={onSubmit}
            paymentMethod={paymentMethod}
            amount={amount}
            clientSecret={clientSecret}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}

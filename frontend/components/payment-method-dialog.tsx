"use client"

import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "@/hooks/use-translations"
import { setPaymentMethod } from "@/redux/features/paymentMethodSlice"
import type { PaymentMethodType } from "@/redux/features/paymentMethodSlice"

interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const paymentMethods = [
  {
    id: "bank" as PaymentMethodType,
    hasDescription: true
  },
  {
    id: "google-pay" as PaymentMethodType,
    hasDescription: false
  },
  {
    id: "credit-card" as PaymentMethodType,
    hasDescription: false
  },
  {
    id: "apple-pay" as PaymentMethodType,
    hasDescription: false
  },
  {
    id: "paypay" as PaymentMethodType,
    hasDescription: false
  }
] as const

export function PaymentMethodDialog({ open, onOpenChange }: PaymentMethodDialogProps) {
  const { t } = useTranslations()
  const dispatch = useDispatch()
  const router = useRouter()
  
  const handleMethodSelect = (methodId: PaymentMethodType) => {
    dispatch(setPaymentMethod(methodId))
    onOpenChange(false) // Close the dialog
    router.push('/charge') // Redirect to charge page
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {t("payment.dialog.title")}
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-600">
            {t("payment.dialog.description")}
          </p>
        </DialogHeader>

        <div className="flex flex-col">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              onClick={() => handleMethodSelect(method.id)}
            >
              <div>
                <div className="font-medium text-left">
                  {t(`payment.dialog.methods.${method.id}.name`)}
                </div>
                {method.hasDescription && (
                  <div className="text-sm text-gray-600">
                    {t(`payment.dialog.methods.${method.id}.description` as const)}
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="border-t p-4">
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            {t("payment.dialog.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

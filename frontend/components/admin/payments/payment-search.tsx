"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchPayments, clearPayments } from "@/redux/features/paymentSlice"
import { RootState } from "@/redux/store"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert } from "@/components/ui/alert"
import { useTranslations } from "@/hooks/use-translations"

export function PaymentSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const dispatch = useDispatch()
  const { payments, loading, error } = useSelector((state: RootState) => state.payments)
  const { t } = useTranslations()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    await dispatch(searchPayments(searchQuery))
  }

  const handleClear = () => {
    setSearchQuery("")
    dispatch(clearPayments())
  }

  return (
    <div className="space-y-4 max-w-[100vw]">
      <h2 className="text-xl font-bold">{t("admin.payments.title")}</h2>
      <form onSubmit={handleSearch} className="flex gap-4">
        <Input
          placeholder={t("admin.payments.search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          disabled={loading}
        />
        <Button type="submit" className="bg-black hover:bg-gray-800" disabled={loading}>
          {loading ? <LoadingSpinner /> : t("admin.payments.search.button")}
        </Button>
       
      </form>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* {payments.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">{t("admin.payments.search.results")}</h3>
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t("admin.payments.details.paymentId")}: {payment.id}</p>
                    <p className="text-sm text-gray-600">{t("admin.payments.details.userId")}: {payment.userId}</p>
                    <p className="text-sm text-gray-600">
                      {t("admin.payments.details.date")}: {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {t("admin.payments.details.amount", { amount: payment.amount.toLocaleString() })}
                    </p>
                    <p className={`text-sm ${
                      payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {t(`admin.payments.details.status.${payment.status}`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  )
}

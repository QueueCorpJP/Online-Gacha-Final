"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/redux/store"
import { fetchPayments, refundPayment } from "@/redux/features/paymentSlice"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/hooks/use-translations"

type PaymentStatus = 'success' | 'pending' | 'refunded';

const statusLabels = {
  success: "完了",
  pending: "処理中",
  refunded: "返金済み",
} as const

const statusStyles: Record<PaymentStatus, string> = {
  success: "text-green-600",
  pending: "text-yellow-600",
  refunded: "text-gray-600",
} as const

interface SearchFilters {
  query: string;
  status: string;
  dateRange: string;
}

export function PaymentTable() {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const { payments, loading, error } = useSelector((state: RootState) => state.payments)
  const [filteredPayments, setFilteredPayments] = useState(payments)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    dateRange: "all"
  })
  const { t } = useTranslations()

  useEffect(() => {
    dispatch(fetchPayments())
  }, [dispatch])

  useEffect(() => {
    filterPayments()
  }, [payments, filters])

  const filterPayments = () => {
    let result = [...payments]

    // Text search
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase()
      result = result.filter(payment =>
        payment.id.toLowerCase().includes(searchTerm) ||
        payment.userId.toLowerCase().includes(searchTerm)
      )
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(payment => payment.status === filters.status)
    }

    // Date range filter
    const now = new Date()
    switch (filters.dateRange) {
      case "today":
        result = result.filter(payment => {
          const paymentDate = new Date(payment.createdAt)
          return paymentDate.toDateString() === now.toDateString()
        })
        break
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        result = result.filter(payment => new Date(payment.createdAt) >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        result = result.filter(payment => new Date(payment.createdAt) >= monthAgo)
        break
    }

    setFilteredPayments(result)
  }

  const handleRefund = async (paymentId: string) => {
    try {
      await dispatch(refundPayment(paymentId)).unwrap()
      toast.success("返金処理が完了しました")
    } catch (error: any) {
      toast.error(error || "返金処理に失敗しました")
    }
  }

  const SearchBar = () => (
    <div className="space-y-4 mb-6">
      <h2 className="text-xl font-bold">{t("admin.payments.title")}</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder={t("payment.table.search.placeholder")}
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="flex-1"
            // onKeyDown={(e) => {
            //   if (e.key === 'Enter') {
            //     filterPayments()
            //   }
            // }}
          />
          <Button 
            onClick={filterPayments}
            className="bg-black hover:bg-gray-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("common.search")
            )}
          </Button>
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => {
            setFilters(prev => ({ ...prev, status: value }))
            filterPayments()
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("payment.table.search.status.label")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("payment.table.search.status.all")}</SelectItem>
            <SelectItem value="success">{t("payment.table.search.status.completed")}</SelectItem>
            <SelectItem value="pending">{t("payment.table.search.status.pending")}</SelectItem>
            <SelectItem value="refunded">{t("payment.table.search.status.refunded")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.dateRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("payment.table.search.dateRange.label")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("payment.table.search.dateRange.all")}</SelectItem>
            <SelectItem value="today">{t("payment.table.search.dateRange.today")}</SelectItem>
            <SelectItem value="week">{t("payment.table.search.dateRange.week")}</SelectItem>
            <SelectItem value="month">{t("payment.table.search.dateRange.month")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-sm text-gray-500">
        {t("payment.table.search.results", { count: filteredPayments.length })}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4 px-4">
        <SearchBar />
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">ID:</span>
                <span className="font-mono text-sm">{payment.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">ユーザーID:</span>
                <span className="font-mono text-sm">{payment.userId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">金額:</span>
                <span className="font-mono">{payment.amount.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">ステータス:</span>
                <span className={statusStyles[payment.status as PaymentStatus]}>
                  {statusLabels[payment.status as PaymentStatus]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">日付:</span>
                <span>{new Date(payment.createdAt).toLocaleDateString("ja-JP")}</span>
              </div>
            </div>
            {payment.status === "success" && (
              <div className="pt-2">
                <RefundButton payment={payment} onRefund={handleRefund} />
              </div>
            )}
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SearchBar />
      <div className="rounded-lg">
        <ScrollArea className="w-full" type="always">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payment.table.headers.id")}</TableHead>
                  <TableHead>{t("payment.table.headers.userId")}</TableHead>
                  <TableHead className="text-right">{t("payment.table.headers.amount")}</TableHead>
                  <TableHead>{t("payment.table.headers.status")}</TableHead>
                  <TableHead>{t("payment.table.headers.date")}</TableHead>
                  <TableHead>{t("payment.table.headers.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono">{payment.id}</TableCell>
                    <TableCell className="font-mono">{payment.user.username}</TableCell>
                    <TableCell className="text-right font-mono">
                      {payment.amount.toLocaleString()}円
                    </TableCell>
                    <TableCell className={statusStyles[payment.status as PaymentStatus]}>
                      {statusLabels[payment.status as PaymentStatus]}
                    </TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      {payment.status === "success" && (
                        <RefundButton payment={payment} onRefund={handleRefund} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

interface RefundButtonProps {
  payment: {
    id: string
    userId: string
    amount: number
    user: {
      username: string
    }
  }
  onRefund: (paymentId: string) => void
}

function RefundButton({ payment, onRefund }: RefundButtonProps) {
  const { t } = useTranslations()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("payment.table.refund.button")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("payment.table.refund.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("payment.table.refund.confirmDescription", {
              userId: payment.user.username,
              amount: payment.amount.toLocaleString()
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("payment.table.refund.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onRefund(payment.id)}
            className="bg-red-500 hover:bg-red-600"
          >
            {t("payment.table.refund.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


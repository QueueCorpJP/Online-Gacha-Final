"use client";
import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useTranslations } from "@/hooks/use-translations"
import { coinService, GachaPurchaseStats } from "@/services/coinService"
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RankingTableProps {
  period: 'daily' | 'weekly' | 'monthly';
}

export function RankingTable({ period }: RankingTableProps) {
  const { t } = useTranslations()
  const [stats, setStats] = useState<GachaPurchaseStats | null>(null)
  const [loading, setLoading] = useState(true);

  console.log(period);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await coinService.getGachaPurchaseStats(period)
        console.log("ランキングデータ:", data);
        setStats(data)
      } catch (error) {
        toast.error(t("common.error"))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [period])

  if (loading) {
    return <div className="p-4 text-center">{t("common.loading")}</div>
  }

  // Get transactions excluding the first one (top user)
  const transactions = stats?.recentTransactions.slice(1) || []

  const getInitials = (username?: string) => {
    return username?.charAt(0).toUpperCase() || 'U';
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm p-3">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="min-w-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">{t("rankings.table.rank")}</TableHead>
                <TableHead>{t("rankings.table.user")}</TableHead>
                <TableHead className="text-right">{t("rankings.table.points")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="mx-6">
              {transactions.map((transaction, index) => (
                <TableRow key={transaction.id} className="hover:bg-transparent">
                  <TableCell className="font-medium">
                    <div
                      className={cn(
                        "flex h-8 w-12 px-2 items-center justify-center rounded-full text-sm",
                        index === 0 && "border-2 border-gray-300",
                        index === 1 && "border-2 border-orange-300",
                        index > 1 && "text-gray-600",
                      )}
                    >
                      {index + 2}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {transaction.user.profileUrl ? (
                          <AvatarImage 
                            src={transaction.user.profileUrl} 
                            alt={t("rankings.table.userAlt", { user: transaction.user.username })} 
                            className="object-cover" 
                          />
                        ) : (
                          <AvatarFallback className="bg-gray-100">
                            {getInitials(transaction.user.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">{transaction.user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-bold">
                    {transaction.amount.toLocaleString()} pt
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}


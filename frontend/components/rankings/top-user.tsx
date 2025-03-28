"use client";
import { useEffect, useState } from "react"
import Image from "next/image"
import { Crown } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { coinService } from "@/services/coinService"
import { toast } from "sonner"

interface TopUserProps {
  period: 'daily' | 'weekly' | 'monthly';
}

export function TopUser({ period }: TopUserProps) {
  const { t } = useTranslations();
  const [topUser, setTopUser] = useState<{
    id: string;
    amount: number;
    user: {
      id: string;
      username: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUser = async () => {
      try {
        setLoading(true);
        const data = await coinService.getGachaPurchaseStats(period);
        if (data.recentTransactions.length > 0) {
          setTopUser(data.recentTransactions[0]);
        }

        console.log(data);
      } catch (error) {
        toast.error(t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchTopUser();
  }, [period]); // Add period to dependency array

  if (loading) {
    return <div className="relative rounded-lg bg-gradient-to-r from-[#9333EA] to-[#6B21A8] p-6 mb-10 animate-pulse" />;
  }

  return (
    <div className="relative rounded-lg bg-gradient-to-r from-[#9333EA] to-[#6B21A8] p-6 mb-10">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex gap-4">
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
              <Image src="/placeholder.svg" alt={topUser?.user.username || t("rankings.topUser.title")} fill className="object-cover" />
            </div>
            <Crown className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-white">{topUser?.user.username || t("rankings.topUser.title")}</h2>
            <p className="text-purple-200">{t("rankings.topUser.dailyRanking")}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-purple-200">{t("rankings.topUser.pointsEarned")}</div>
          <div className="text-3xl font-bold text-yellow-400">
            {t("rankings.topUser.points", { points: topUser?.amount.toLocaleString() || "0" })}
          </div>
        </div>
      </div>
    </div>
  )
}


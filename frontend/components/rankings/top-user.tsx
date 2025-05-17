"use client";
import { useEffect, useState } from "react"
import Image from "next/image"
import { Crown } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/lib/axios"

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
      profileUrl?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTopUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/rankings/${period}/top`);
        
        if (response.data?.user) {
          setTopUser(response.data);
        } else {
          setNoData(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUserData();
  }, [period]);

  if (loading) {
    return <div className="relative rounded-lg bg-gradient-to-r from-[#9333EA] to-[#6B21A8] p-6 mb-10 animate-pulse" />;
  }

  const getInitials = (username?: string) => {
    return username?.charAt(0).toUpperCase() || 'U';
  }

  // トップユーザーがないか、データ構造が正しくないとき
  if (!topUser || !topUser.user) {
    return (
      <div className="relative rounded-lg bg-gradient-to-r from-[#9333EA] to-[#6B21A8] p-6 mb-10">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="text-xl">データ取得中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg bg-gradient-to-r from-[#9333EA] to-[#6B21A8] p-6 mb-10">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex gap-4">
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
              {topUser.user.profileUrl ? (
                <Image 
                  src={topUser.user.profileUrl} 
                  alt={topUser.user.username} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="h-full w-full bg-purple-800 flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials(topUser?.user.username)}
                </div>
              )}
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


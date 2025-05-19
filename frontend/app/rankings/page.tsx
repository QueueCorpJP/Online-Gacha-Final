"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingTable } from "@/components/rankings/ranking-table"
import { useTranslations } from "@/hooks/use-translations"
import { useState } from "react"

type Period = 'daily' | 'weekly' | 'monthly';

export default function RankingsPage() {
  const { t } = useTranslations();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('daily');

  return (
    <main className="container-fluid px-9 py-8 bg-[#F9FAFB]">
      <h1 className="w-full text-center mb-6 text-3xl font-bold">{t("rankings.title")}</h1>
      <Tabs defaultValue="daily" className="w-full" onValueChange={(value) => setSelectedPeriod(value as Period)}>
        <TabsList className="w-full justify-center bg-[#F9FAFB] border-b">
          <TabsTrigger
            value="daily"
            className="data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6"
          >
            {t("rankings.tabs.daily")}
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6"
          >
            {t("rankings.tabs.weekly")}
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-6"
          >
            {t("rankings.tabs.monthly")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-8 space-y-8">
        <RankingTable period={selectedPeriod} />
      </div>
    </main>
  )
}


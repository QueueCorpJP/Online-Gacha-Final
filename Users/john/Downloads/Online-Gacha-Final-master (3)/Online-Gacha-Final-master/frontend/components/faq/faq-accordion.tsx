"use client"

import { useState, useMemo } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FaqSearch } from "./faq-search"

const faqItems = [
  {
    question: "ガチャとは何ですか？",
    answer:
      "ガチャは、ランダムなアイテムやキャラクターを獲得できるシステムです。実際のガチャガチャ（カプセルトイ）のように、何が出るかわからない楽しみがあります。",
  },
  {
    question: "ガチャの確率は公開されていますか？",
    answer: "はい、すべてのガチャの確率は法律に基づき公開されています。各ガチャの詳細ページで確認することができます。",
  },
  {
    question: "ガチャで獲得したアイテムの交換や譲渡は可能ですか？",
    answer: "申し訳ありませんが、セキュリティとフェアプレイの観点から、アイテムの交換や譲渡はできません。",
  },
  {
    question: "課金せずにガチャを引くことはできますか？",
    answer: "はい、ログインボーナスやイベント参加でもらえる無料ポイントを使ってガチャを引くことができます。",
  },
  {
    question: "ガチャの結果に不具合があった場合はどうすればいいですか？",
    answer:
      "不具合が発生した場合は、直ちにサポートチームまでご連絡ください。状況を確認の上、適切な対応をさせていただきます。",
  },
]

export function FaqAccordion() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqItems = useMemo(() => {
    if (!searchQuery) return faqItems

    const query = searchQuery.toLowerCase()
    return faqItems.filter(
      item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div>
      <FaqSearch onSearch={setSearchQuery} />
      <Accordion type="single" collapsible className="space-y-4">
        {filteredFaqItems.map((item, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="border-b border-[#E4E4E7] px-6 last:border-0"
          >
            <AccordionTrigger className="text-left text-[#111827]">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-[#111827]">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
        {filteredFaqItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            検索結果が見つかりませんでした。
          </div>
        )}
      </Accordion>
    </div>
  )
}


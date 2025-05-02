"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { api } from "@/lib/axios"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface FAQ {
  id: string
  question: string
  answer: string
}

export function FaqList() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs')
        setFaqs(response.data)
      } catch (err) {
        setError("FAQの読み込み中にエラーが発生しました")
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    )
  }

  if (faqs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        FAQがまだ登録されていません。
      </div>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq) => (
        <AccordionItem 
          key={faq.id} 
          value={faq.id}
          className="border-b border-[#E4E4E7] px-6 last:border-0"
        >
          <AccordionTrigger className="text-left text-[#111827]">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-[#111827]">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
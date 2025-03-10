"use client"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Trash2 } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
}

const formSchema = z.object({
  question: z.string().min(1, "タイトルを入力してください"),
  answer: z.string().min(1, "内容を入力してください"),
})

export function FaqForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFaqs = async () => {
    try {
      const response = await api.get('/faqs')
      setFaqs(response.data)
    } catch (err) {
      toast.error("FAQの読み込みに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/faqs/${id}`)
      await fetchFaqs()
      toast.success("FAQを削除しました")
    } catch (error) {
      toast.error("FAQの削除に失敗しました")
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      await api.post('/faqs', values)
      await fetchFaqs()
      form.reset()
      toast.success("FAQ追加完了", {
        description: "FAQが正常に追加されました。"
      })
    } catch (error) {
      console.error('Error saving FAQ:', error)
      toast.error("エラー", {
        description: "FAQの追加中にエラーが発生しました。"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current FAQs List */}
      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-medium mb-4">現在のFAQ一覧</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-gray-500 py-4">FAQがまだ登録されていません。</p>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="border p-4 rounded-md"
              >
                <div className="flex items-start justify-between">
                  <AccordionTrigger className="text-left flex-1">
                    {faq.question}
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(faq.id)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <AccordionContent className="text-gray-600 mt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* FAQ Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-[100vw]">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="FAQのタイトルを入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <Textarea placeholder="FAQの内容を入力" className="min-h-[200px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="bg-black hover:bg-black/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中..." : "FAQを追加"}
          </Button>
        </form>
      </Form>
    </div>
  )
}


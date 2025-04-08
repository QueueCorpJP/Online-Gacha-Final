"use client";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api } from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs');
        setFaqs(response.data);
      } catch (err) {
        setError("FAQの読み込み中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-center text-[30px] font-bold">よくある質問</h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-center text-[30px] font-bold">よくある質問</h2>
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-center text-[30px] font-bold">よくある質問</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

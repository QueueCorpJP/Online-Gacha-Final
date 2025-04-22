"use client"

import { useState, useMemo } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FaqSearch } from "./faq-search"

const faqItems = [
  {
    question: "SHIJON（シジョン）とはどのようなサービスですか？",
    answer:
      "SHIJONは、実在する商品や体験が当たるオンラインガチャサービスです。スマートフォンやPCから手軽に参加でき、当選した商品は自宅に配送されます。実店舗に行かなくても、ガチャガチャの楽しさを体験できるサービスです。",
  },
  {
    question: "支払い方法にはどのような選択肢がありますか？",
    answer: "クレジットカード（VISA、Mastercard、JCB、AMEX）、Apple Pay、Google Pay、PayPayに対応しています。クレジットカード、Apple Pay、Google Payでは1回あたり20万円まで、PayPayでは100万円までの支払いが可能です。",
  },
  {
    question: "当選した商品はどのように受け取れますか？",
    answer: "当選した商品は、ご登録の住所に配送されます。通常、当選から1〜7営業日以内に発送され、配送状況はマイページの「配送状況」から確認できます。配送料は無料です。",
  },
  {
    question: "ガチャの当選確率はどのように決まりますか？",
    answer: "各ガチャの当選確率は商品詳細ページに明記されています。レア度に応じて異なる確率が設定されており、法律に基づき適切に表示・管理されています。また、引く回数が増えるほど高レア商品の当選確率が上がる「確率上昇システム」を一部ガチャで採用しています。",
  },
  {
    question: "未成年でもガチャを引くことはできますか？",
    answer: "SHIJONは18歳以上のユーザーを対象としたサービスです。未成年の方は保護者の同意と監督の下でご利用ください。過度なご利用を防ぐため、月間利用限度額の設定も可能です。",
  },
  {
    question: "アカウント情報の変更方法を教えてください",
    answer: "マイページにログイン後、「アカウント設定」から個人情報（メールアドレス、パスワード、住所など）を変更できます。変更後は確認メールが送信されますので、ご確認ください。",
  },
  {
    question: "退会するとデータはどうなりますか？",
    answer: "退会すると、購入履歴や当選履歴を含むすべてのデータが削除されます。ただし、法的な理由により、一部の取引データは一定期間保持されます。退会前に必要なデータのダウンロードや、獲得済み商品の発送状況の確認をおすすめします。",
  },
  {
    question: "ガチャの結果に不具合があった場合はどうすればいいですか？",
    answer: "不具合が発生した場合は、画面右下の「お問い合わせ」ボタンからサポートチームへご連絡ください。取引ID、発生時刻、状況の詳細をお知らせいただくと、迅速な対応が可能です。通常、24時間以内に初回回答をいたします。",
  },
  {
    question: "ポイントの有効期限はありますか？",
    answer: "購入したポイントの有効期限は最終利用日から1年間です。1年間ポイントを使用しないと失効しますので、定期的にご利用いただくことをおすすめします。キャンペーンやプロモーションで獲得したポイントには、別途有効期限が設定されている場合があります。",
  },
  {
    question: "友達にSHIJONを紹介するとどんな特典がありますか？",
    answer: "友達紹介プログラムでは、あなたの紹介コードを使って新規登録した友達が初回購入すると、あなたと友達の両方に500ポイントをプレゼントします。さらに、友達の購入金額の1%があなたのポイントとして還元されます。紹介コードはマイページから確認できます。",
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


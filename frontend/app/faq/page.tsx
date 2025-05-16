import { FaqList } from "@/components/faq/faq-list"
import { FaqContact } from "@/components/faq/faq-contact"

export const metadata = {
  title: "よくある質問 | SHIJON",
  description: "SHIJONサービスに関するよくある質問と回答をご覧いただけます。",
}

export default function FaqPage() {
  return (
    <div className="bg-white px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#111827]">よくある質問</h1>
        <FaqList />
        <FaqContact />
      </div>
    </div>
  )
}


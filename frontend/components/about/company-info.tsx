"use client";
import { useTranslations } from "@/hooks/use-translations";

export function CompanyInfo() {
  const { t } = useTranslations();

  // 会社情報の配列
  const companyDetails = [
    {
      title: "会社名",
      content: "合同会社 OMOTENASHI"
    },
    {
      title: "設立",
      content: "2023年4月1日"
    },
    {
      title: "代表者",
      content: "岩村 雄二"
    },
    {
      title: "所在地",
      content: "〒104-0061 東京都中央区銀座1-12-4 N&E BLD.7階"
    },
    {
      title: "事業内容",
      content: "オンラインゲームの企画・開発・運営\nトレーディングカードの販売\nデジタルコンテンツの制作"
    },
    {
      title: "電話番号",
      content: "03-4222-3343"
    },
    {
      title: "メールアドレス",
      content: "info@oripa-shijon.com"
    },
    {
      title: "URL",
      content: "https://oripa-shijon.com/"
    }
  ];

  return (
    <div className="space-y-8 rounded-lg p-8">
      {companyDetails.map((detail, index) => (
        <section key={index} className="space-y-2 border-b pb-4 last:border-b-0">
          <h2 className="text-lg font-bold text-[#111827]">{detail.title}</h2>
          <div className="whitespace-pre-line text-[#4B5563]">{detail.content}</div>
        </section>
      ))}
      <div className="mt-8 text-center text-sm text-[#4B5563]">
        <p>© 2023-2025 合同会社 OMOTENASHI All Rights Reserved.</p>
      </div>
    </div>
  );
} 
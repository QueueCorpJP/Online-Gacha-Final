"use client";
import { useTranslations } from "@/hooks/use-translations";

export function TransactionDetails() {
  const { t } = useTranslations();

  const transactionDetails = [
    {
      title: t("legal.sections.seller.title"),
      content: t("legal.sections.seller.content"),
    },
    {
      title: t("legal.sections.representative.title"),
      content: t("legal.sections.representative.content"),
    },
    {
      title: t("legal.sections.address.title"),
      content: t("legal.sections.address.content"),
    },
    {
      title: t("legal.sections.phone.title"),
      content: t("legal.sections.phone.content"),
    },
    {
      title: t("legal.sections.email.title"),
      content: t("legal.sections.email.content"),
    },
    {
      title: t("legal.sections.url.title"),
      content: t("legal.sections.url.content"),
    },
    {
      title: t("legal.sections.businessDetails.title"),
      content: t("legal.sections.businessDetails.content"),
    },
    {
      title: t("legal.sections.price.title"),
      content: t("legal.sections.price.content"),
    },
    {
      title: t("legal.sections.additionalFees.title"),
      content: t("legal.sections.additionalFees.content"),
    },
    {
      title: t("legal.sections.paymentMethods.title"),
      content: t("legal.sections.paymentMethods.content"),
    },
    {
      title: t("legal.sections.paymentTiming.title"),
      content: t("legal.sections.paymentTiming.content"),
    },
    {
      title: t("legal.sections.delivery.title"),
      content: t("legal.sections.delivery.content"),
    },
    {
      title: t("legal.sections.returns.title"),
      content: t("legal.sections.returns.content"),
    },
   
    {
      title: t("legal.sections.security.title"),
      content: t("legal.sections.security.content"),
    },
  ];

  return (
    <div className="space-y-8 rounded-lg p-8">
      {transactionDetails.map((detail, index) => (
        <section key={index} className="space-y-2">
          <h2 className="text-lg font-bold text-[#111827]">{detail.title}</h2>
          <div className="whitespace-pre-line text-[#4B5563]">{detail.content}</div>
        </section>
      ))}
      <div className="mt-8 text-center text-sm text-[#4B5563]">
        <p>{t("legal.footer.update")}</p>
        <p>{t("legal.footer.contact")}</p>
      </div>
    </div>
  );
}
  
  

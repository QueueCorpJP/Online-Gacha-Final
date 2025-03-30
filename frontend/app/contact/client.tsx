"use client"

import { ContactForm } from "@/components/contact/contact-form"
import { useTranslations } from "@/hooks/use-translations"

export default function ContactClient() {
  const { t } = useTranslations()

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-8 md:py-16 px-4 md:px-6">
      <div className="container w-full max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-6 md:mb-8 text-center">
          {t("contact.pageTitle")}
        </h1>
        <ContactForm />
      </div>
    </main>
  )
}
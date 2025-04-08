"use client"

import { useEffect, useState } from "react"
import { translations, Language } from "@/locales/translations";

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? K | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never

type TranslationKeys = NestedKeyOf<typeof translations.en>

export function useTranslations() {
  const [language, setLanguage] = useState<Language>("ja")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && savedLanguage in translations) {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = (key: TranslationKeys, values?: Record<string, string | number>): string => {
    const keys = key.split(".")
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (!value) return key

    if (values) {
      return Object.entries(values).reduce((str, [key, val]) => {
        return str.replace(`{${key}}`, String(val))
      }, value)
    }
    
    return value
  }

  return { t, language }
}

"use client"

// eslint-disable-next-line
import { useEffect, useState } from "react"
import { translations } from "@/locales/translations";

// 言語タイプの定義
type Language = keyof typeof translations;

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
    // @ts-ignore - 型エラーを無視
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (!value) {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      // 英語の翻訳を試みる
      let fallbackValue: any = translations["en"];
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      
      // 英語でも見つからなければ、最後のキー部分を表示
      if (!fallbackValue) {
        const lastKey = keys[keys.length - 1];
        return lastKey.charAt(0).toUpperCase() + lastKey.slice(1);
      }
      
      return fallbackValue;
    }

    if (values) {
      return Object.entries(values).reduce((str, [key, val]) => {
        return str.replace(`{${key}}`, String(val))
      }, value)
    }
    
    return value
  }

  return { t, language }
}

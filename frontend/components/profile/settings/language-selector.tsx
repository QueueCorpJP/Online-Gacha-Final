"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { translations, Language } from "@/locales/translations"
import { toast } from "sonner"

interface LanguageOption {
  code: Language
  name: string
  localName: string
  flag: string
}

const languageOptions: LanguageOption[] = [
  {
    code: "ja",
    name: "Japanese",
    localName: "日本語",
    flag: "🇯🇵",
  },
  {
    code: "en",
    name: "English",
    localName: "English",
    flag: "🇺🇸",
  },
  {
    code: "zh",
    name: "Chinese",
    localName: "中文",
    flag: "🇨🇳",
  },
]

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("ja")
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && savedLanguage in translations) {
      setSelectedLanguage(savedLanguage)
    }
  }, [])

  const handleLanguageChange = async (language: Language) => {
    try {
      setIsChanging(true)
      
      // Simulate API call to update user's language preference
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local storage
      localStorage.setItem("language", language)
      
      // Update state
      setSelectedLanguage(language)
      
      // Update HTML lang attribute
      document.documentElement.lang = language
      
      // Show success message
      toast.success(
        language === "ja" 
          ? "言語設定を更新しました" 
          : "Language settings updated"
      )
      
      // Reload the page to apply new language
      window.location.reload()
    } catch (error) {
      toast.error(
        language === "ja"
          ? "言語設定の更新に失敗しました"
          : "Failed to update language settings"
      )
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        {translations[selectedLanguage].settings.languageSettings}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {languageOptions.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-purple-50",
              selectedLanguage === language.code
                ? "border-purple-200 bg-purple-50"
                : "border-gray-200 bg-white",
              isChanging && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-2xl" role="img" aria-label={language.name}>
              {language.flag}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-lg font-medium">{language.localName}</span>
              <span className="text-sm text-gray-500">{language.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
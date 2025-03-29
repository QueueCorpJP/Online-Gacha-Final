"use client";
import { Button } from "@/components/ui/button"

export function FaqContact() {
  return (
    <div className="mt-12 text-center">
      <p className="mb-6 text-[#4B5563]">まだ疑問が解決しませんか？</p>
      <Button
        className="bg-purple-600 px-8 py-6 text-base hover:bg-purple-700"
        onClick={() => (window.location.href = "/contact")}
      >
        お問い合わせ
      </Button>
    </div>
  )
}


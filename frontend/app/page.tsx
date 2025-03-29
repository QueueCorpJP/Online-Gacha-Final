import type { Metadata } from "next"
import HomeClient from "./client"

export const metadata: Metadata = {
  title: "SHIJON - オンラインで楽しむトレカガチャゲーム｜レアカードを狙え！",
  description: "SHIJONは、オンラインで手軽に楽しめるトレカガチャゲームです。レアカードの収集・交換を通じて、新感覚のデジタルカード体験を提供。今すぐ参加して、あなただけのカードコレクションを作り上げよう！",
  keywords: [
    "SHIJON",
    "オンライントレカガチャ",
    "トレカゲーム",
    "レアカード",
    "デジタルカード",
    "カード収集",
    "ガチャゲーム",
    "オンラインカードゲーム",
    "トレーディングカード",
    "カード交換"
  ].join(", "),
  openGraph: {
    title: "SHIJON - オンラインで楽しむトレカガチャゲーム｜レアカードを狙え！",
    description: "SHIJONは、オンラインで手軽に楽しめるトレカガチャゲームです。レアカードの収集・交換を通じて、新感覚のデジタルカード体験を提供。今すぐ参加して、あなただけのカードコレクションを作り上げよう！",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHIJON - オンラインで楽しむトレカガチャゲーム｜レアカードを狙え！",
    description: "SHIJONは、オンラインで手軽に楽しめるトレカガチャゲームです。レアカードの収集・交換を通じて、新感覚のデジタルカード体験を提供。今すぐ参加して、あなただけのカードコレクションを作り上げよう！",
  }
}

export default function HomePage() {
  return <HomeClient />
}

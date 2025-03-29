import type { Metadata } from "next"
import ProductsClient from "./client"

export const metadata: Metadata = {
  title: "商品一覧 | SHIJON",
  description: "トレーディングカードやコレクタブルアイテムのガチャ商品一覧",
  openGraph: {
    title: "商品一覧 | SHIJON",
    description: "トレーディングカードやコレクタブルアイテムのガチャ商品一覧",
  },
  twitter: {
    card: "summary_large_image",
    title: "商品一覧 | SHIJON",
    description: "トレーディングカードやコレクタブルアイテムのガチャ商品一覧",
  }
}

export default function ProductsPage() {
  return <ProductsClient />
}


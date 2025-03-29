import type { Metadata } from "next"
import GachaResultClient from "./client"

export const metadata: Metadata = {
  title: "ガチャ結果 | SHIJON",
  description: "ガチャの結果を確認できます。",
  openGraph: {
    title: "ガチャ結果 | SHIJON",
    description: "ガチャの結果を確認できます。",
  },
  twitter: {
    card: "summary",
    title: "ガチャ結果 | SHIJON",
    description: "ガチャの結果を確認できます。",
  }
}

export default function GachaResultPage() {
  return <GachaResultClient />
}

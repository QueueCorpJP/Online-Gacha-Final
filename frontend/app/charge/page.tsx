import type { Metadata } from "next"
import { Charge } from "@/components/charge"

export const metadata: Metadata = {
  title: "チャージ | SHIJON",
  description: "ポイントをチャージして、ガチャを楽しもう！",
  openGraph: {
    title: "チャージ | SHIJON",
    description: "ポイントをチャージして、ガチャを楽しもう！",
  },
  twitter: {
    card: "summary",
    title: "チャージ | SHIJON",
    description: "ポイントをチャージして、ガチャを楽しもう！",
  }
}

export default function ChargePage() {
  return (
    <div className="container max-w-3xl py-8 mx-auto">
      <Charge />
    </div>
  )
}


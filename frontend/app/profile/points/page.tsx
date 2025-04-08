import type { Metadata } from "next"
import PointsClient from "./client"

export const metadata: Metadata = {
  title: "ポイント | SHIJON",
  description: "ポイント残高と履歴を確認できます。",
  openGraph: {
    title: "ポイント | SHIJON",
    description: "ポイント残高と履歴を確認できます。",
  },
  twitter: {
    card: "summary",
    title: "ポイント | SHIJON",
    description: "ポイント残高と履歴を確認できます。",
  }
}

export default function PointsPage() {
  return <PointsClient />
}


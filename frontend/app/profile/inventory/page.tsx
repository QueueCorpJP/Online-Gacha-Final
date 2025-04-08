import type { Metadata } from "next"
import InventoryClient from "./client"

export const metadata: Metadata = {
  title: "インベントリ | SHIJON",
  description: "獲得したアイテムを確認できます。",
  openGraph: {
    title: "インベントリ | SHIJON",
    description: "獲得したアイテムを確認できます。",
  },
  twitter: {
    card: "summary",
    title: "インベントリ | SHIJON",
    description: "獲得したアイテムを確認できます。",
  }
}

export default function InventoryPage() {
  return <InventoryClient />
}


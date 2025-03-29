import type { Metadata } from "next"
import SettingsClient from "./client"

export const metadata: Metadata = {
  title: "設定 | SHIJON",
  description: "アカウント設定の確認・編集ができます。",
  openGraph: {
    title: "設定 | SHIJON",
    description: "アカウント設定の確認・編集ができます。",
  },
  twitter: {
    card: "summary",
    title: "設定 | SHIJON",
    description: "アカウント設定の確認・編集ができます。",
  }
}

export default function SettingsPage() {
    return <SettingsClient />
}


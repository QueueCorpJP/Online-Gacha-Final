import type { Metadata } from "next"
import PrivacyClient from "./client"

export const metadata: Metadata = {
  title: "プライバシーポリシー | SHIJON",
  description: "SHIJONのプライバシーポリシーをご確認いただけます。",
  openGraph: {
    title: "プライバシーポリシー | SHIJON",
    description: "SHIJONのプライバシーポリシーをご確認いただけます。",
  },
  twitter: {
    card: "summary",
    title: "プライバシーポリシー | SHIJON",
    description: "SHIJONのプライバシーポリシーをご確認いただけます。",
  }
}

export default function PrivacyPage() {
  return <PrivacyClient />
}


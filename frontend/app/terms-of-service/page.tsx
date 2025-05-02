import type { Metadata } from "next"
import TermsClient from "./client"

export const metadata: Metadata = {
  title: "利用規約 | SHIJON",
  description: "SHIJONの利用規約をご確認いただけます。",
  openGraph: {
    title: "利用規約 | SHIJON",
    description: "SHIJONの利用規約をご確認いただけます。",
  },
  twitter: {
    card: "summary",
    title: "利用規約 | SHIJON",
    description: "SHIJONの利用規約をご確認いただけます。",
  }
}

export default function TermsPage() {
  return <TermsClient />
}


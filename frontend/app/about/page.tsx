import type { Metadata } from "next"
import AboutClient from "./client"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | SHIJON",
  description: "特定商取引法に基づく表記をご確認いただけます。",
  openGraph: {
    title: "特定商取引法に基づく表記 | SHIJON",
    description: "特定商取引法に基づく表記をご確認いただけます。",
  },
  twitter: {
    card: "summary",
    title: "特定商取引法に基づく表記 | SHIJON",
    description: "特定商取引法に基づく表記をご確認いただけます。",
  }
}

export default function AboutPage() {
  return <AboutClient />
}


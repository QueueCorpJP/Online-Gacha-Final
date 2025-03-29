import type { Metadata } from "next"
import NotificationsClient from "./client"

export const metadata: Metadata = {
  title: "お知らせ | SHIJON",
  description: "SHIJONからのお知らせ一覧をご確認いただけます。",
  openGraph: {
    title: "お知らせ | SHIJON",
    description: "SHIJONからのお知らせ一覧をご確認いただけます。",
  },
  twitter: {
    card: "summary",
    title: "お知らせ | SHIJON",
    description: "SHIJONからのお知らせ一覧をご確認いただけます。",
  }
}

export default function NotificationsPage() {
  return <NotificationsClient />
}

import type { Metadata } from "next"
import ProfileClient from "./client"

export const metadata: Metadata = {
  title: "プロフィール | SHIJON",
  description: "プロフィール情報の確認・編集ができます。",
  openGraph: {
    title: "プロフィール | SHIJON",
    description: "プロフィール情報の確認・編集ができます。",
  },
  twitter: {
    card: "summary",
    title: "プロフィール | SHIJON",
    description: "プロフィール情報の確認・編集ができます。",
  }
}

export default function ProfilePage() {
  return <ProfileClient />
}

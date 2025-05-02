import type { Metadata } from "next"
import SignUpClient from "./client"
export const metadata: Metadata = {
  title: "新規登録 | SHIJON",
  description: "新規アカウントを作成して、ガチャを楽しもう！",
  openGraph: {
    title: "新規登録 | SHIJON",
    description: "新規アカウントを作成して、ガチャを楽しもう！",
  },
  twitter: {
    card: "summary",
    title: "新規登録 | SHIJON",
    description: "新規アカウントを作成して、ガチャを楽しもう！",
  }
}

export default function SignUpPage() {
  return <SignUpClient />
}

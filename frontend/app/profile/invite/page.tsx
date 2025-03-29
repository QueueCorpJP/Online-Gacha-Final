import type { Metadata } from "next"
import InviteClient from "./client"

export const metadata: Metadata = {
  title: "招待コード | SHIJON",
  description: "友達を招待して特典をゲットしよう！",
  openGraph: {
    title: "招待コード | SHIJON",
    description: "友達を招待して特典をゲットしよう！",
  },
  twitter: {
    card: "summary",
    title: "招待コード | SHIJON",
    description: "友達を招待して特典をゲットしよう！",
  }
}

export default function InvitePage() {
  return <InviteClient />
}


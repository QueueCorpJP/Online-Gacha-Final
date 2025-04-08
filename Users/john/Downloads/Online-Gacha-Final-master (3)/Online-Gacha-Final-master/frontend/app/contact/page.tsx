import type { Metadata } from "next"
import ContactClient from "./client"

export const metadata: Metadata = {
  title: "お問い合わせ | SHIJON",
  description: "SHIJONへのお問い合わせはこちらから承ります。",
  openGraph: {
    title: "お問い合わせ | SHIJON",
    description: "SHIJONへのお問い合わせはこちらから承ります。",
  },
  twitter: {
    card: "summary",
    title: "お問い合わせ | SHIJON",
    description: "SHIJONへのお問い合わせはこちらから承ります。",
  }
}

export default function ContactPage() {
  return <ContactClient />
}

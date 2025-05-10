"use client"
import Link from "next/link"

export default function ForgotPasswordSentPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">送信しました！</h1>
        <p className="mb-6">パスワードリセット用のリンクをメールアドレス宛に送信しました。<br />メールをご確認ください。</p>
        <Link href="/login" className="text-[#7C3AED] hover:underline">ログイン画面へ戻る</Link>
      </div>
    </div>
  )
} 
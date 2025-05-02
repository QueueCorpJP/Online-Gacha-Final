import type { Metadata } from "next"
import { InquiryTable } from "@/components/admin/support/inquiry-table"
import { FaqForm } from "@/components/admin/support/faq-form"
import { AdminNav } from "@/components/admin/admin-nav"
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "カスタマーサポート | SHIJON管理画面",
    description: "お問い合わせ管理とFAQの更新を行うことができます。",
}

export default function SupportPage() {
    return (
        <AdminRoute>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <main className="mx-auto max-w-[100vw] container space-y-8 py-8 md:w-full">
                <div className="max-w-[100vw] w-full rounded-lg border bg-card p-6">
                    <h1 className="text-2xl font-semibold mb-6">お問い合わせ管理</h1>
                    <InquiryTable />
                </div>
                <div className="max-w-[100vw] rounded-lg border bg-card p-6">
                    <h2 className="text-2xl font-semibold mb-6">FAQ更新</h2>
                    <FaqForm />
                </div>
            </main>
        </div>
        </AdminRoute>
    )
}


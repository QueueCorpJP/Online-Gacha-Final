import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { NewsBlogForm } from "@/components/admin/news-blog/news-blog-form"
import { NewsBlogTable } from "@/components/admin/news-blog/news-blog-table"
import AdminRoute from "@/components/auth/admin-route"
import { Toaster } from "sonner"

export const metadata: Metadata = {
    title: "ニュース・ブログ管理 | SHIJON管理画面",
    description: "ニュースやブログの投稿、編集、削除を行うことができます。",
}

export default function NewsBlogPage() {
    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <Toaster />
                <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
                <AdminNav />
                <div className="mx-auto container space-y-8 py-8 px-3">
                    <div className="rounded-lg border bg-white p-6">
                        <h2 className="text-2xl font-bold mb-6">ニュース・ブログ投稿</h2>
                        <NewsBlogForm />
                    </div>
                    <div className="rounded-lg border bg-white p-6">
                        <h2 className="text-2xl font-bold mb-6">投稿一覧</h2>
                        <NewsBlogTable />
                    </div>
                </div>
            </div>
        </AdminRoute>
    )
}

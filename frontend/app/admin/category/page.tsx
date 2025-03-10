import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { CategoryManager } from "@/components/admin/category/category-manager"
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "カテゴリー管理 | SHIJON管理画面",
    description: "カテゴリーの作成、編集、削除を行うことができます。",
}

export default function AdminCategoriesPage() {
    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
                <AdminNav />
                <div className="mx-auto container space-y-8 py-8 px-3">
                    <h1 className="mb-6 text-2xl font-bold">管理者ダッシュボード</h1>
                    <div className="rounded-lg border bg-white p-6">
                        <CategoryManager />
                    </div>
                </div>
            </div>
        </AdminRoute>
    )
}


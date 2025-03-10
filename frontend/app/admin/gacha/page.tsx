import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { GachaForm } from "@/components/admin/gacha-form"
import { GachaTable } from "@/components/admin/gacha-table"
import AdminRoute from "@/components/auth/admin-route"
import { Toaster } from "sonner"

export const metadata: Metadata = {
    title: "ガチャ管理 | SHIJON管理画面",
    description: "ガチャの作成、編集、削除を行うことができます。",
}

export default function AdminGachaPage() {
    return (
        <AdminRoute>
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster />
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <div className="max-w-[100vw] container space-y-8 py-8 px-3">
                <div className="max-auto rounded-lg border bg-white p-6">
                    <GachaForm />
                </div>
                <div className="rounded-lg border bg-white p-6">
                    <GachaTable />
                </div>
            </div>
        </div>
        </AdminRoute>
    )
}


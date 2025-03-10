import type { Metadata } from "next"
import { SecuritySettings } from "@/components/admin/security/security-settings"
import { SecurityLogs } from "@/components/admin/security/security-logs"
import { AdminNav } from "@/components/admin/admin-nav"
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "セキュリティ管理 | SHIJON管理画面",
    description: "セキュリティ設定と監査ログの管理を行うことができます。",
}

export default function SecurityPage() {
    return (
        <AdminRoute>
        <div className="min-h-screen bg-gray-50 py-8">
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <main className="mx-auto max-w-[100vw] container space-y-8 py-8 px-3">
                <div className="rounded-lg border bg-card p-6">
                    <h1 className="text-2xl font-semibold mb-6">セキュリティ設定</h1>
                    <SecuritySettings />
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="text-2xl font-semibold mb-6">セキュリティログ</h2>
                    <SecurityLogs />
                </div>
            </main>
        </div>
        </AdminRoute>
    )
}


import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { NotificationForm } from "@/components/admin/notification/notification-form"
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "通知管理 | SHIJON管理画面",
    description: "ユーザーへの通知管理を行うことができます。",
}

export default function NotificationsPage() {
    return (
        <AdminRoute>
        <div className="bg-gray-50 py-8">
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <main className="mx-auto max-w-[100vw] container space-y-8 py-8 px-3">
                <div className="rounded-lg border bg-card p-6 ">
                    <h1 className="text-2xl font-semibold mb-6">通知管理</h1>
                    <NotificationForm />
                </div>
            </main>
        </div>
        </AdminRoute>
    )
}


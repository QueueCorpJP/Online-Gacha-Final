import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { UserSearch } from "@/components/admin/users/user-search"
import { UserTable } from "@/components/admin/users/user-table"
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "ユーザー管理 | SHIJON管理画面",
    description: "ユーザーの検索、管理を行うことができます。",
}

export default function AdminUsersPage() {
    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
                <AdminNav />
                <div className="mx-auto container space-y-8 py-8 px-3">
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-white p-6">
                            <UserSearch />
                        </div>
                        <div className="rounded-lg border bg-white p-6">
                            <UserTable />
                        </div>
                    </div>
                </div>
            </div>
        </AdminRoute>
    )
}


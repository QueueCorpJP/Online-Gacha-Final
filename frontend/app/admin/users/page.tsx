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
            <div className="min-h-screen bg-gray-50 py-4 md:py-8">
                <h1 className="text-lg md:text-xl font-bold container mx-auto mb-4 md:mb-6 px-4 md:px-6">管理者ダッシュボード</h1>
                <AdminNav />
                <div className="container mx-auto space-y-4 md:space-y-8 py-4 md:py-8 px-4 md:px-6">
                    <div className="space-y-4 md:space-y-6">
                        <div className="w-full rounded-lg border bg-white p-4 md:p-6 overflow-x-auto">
                            <UserSearch />
                        </div>
                        <div className="w-full rounded-lg border bg-white p-4 md:p-6 overflow-x-auto">
                            <UserTable />
                        </div>
                    </div>
                </div>
            </div>
        </AdminRoute>
    )
}


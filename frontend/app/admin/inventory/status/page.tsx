import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav"
import { InventoryStatusManager } from '@/components/admin/inventory/inventory-status-manager';
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "発送管理 | SHIJON管理画面",
    description: "商品の発送状況の管理を行うことができます。",
}

export default function AdminInventoryStatusPage() {
    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
                <AdminNav />
                <div className="mx-auto container space-y-8 py-8 px-3">
                    <div className="rounded-lg border bg-white p-6">
                        <InventoryStatusManager />
                    </div>
                </div>
            </div>
        </AdminRoute>
    )
}

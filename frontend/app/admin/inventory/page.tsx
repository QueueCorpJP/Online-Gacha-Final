import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav";
import { InventorySettings } from "@/components/admin/inventory/inventory-settings";
import { InventoryStatus } from "@/components/admin/inventory/inventory-status";
import AdminRoute from "@/components/auth/admin-route";

export const metadata: Metadata = {
    title: "在庫管理 | SHIJON管理画面",
    description: "在庫の管理、設定を行うことができます。",
}

export default function AdminInventoryPage() {
    return (
        <AdminRoute>
        <div className="min-h-screen bg-gray-50 py-4 md:py-8">
            <h1 className="text-lg md:text-xl font-bold container mx-auto mb-4 md:mb-6 px-4 md:px-6">管理者ダッシュボード</h1>
            <AdminNav />
            <div className="container mx-auto space-y-4 md:space-y-8 py-4 md:py-8 px-4 md:px-6">
                <div className="space-y-4 md:space-y-6">
                    <div className="w-full rounded-lg border bg-white p-4 md:p-6 overflow-x-auto">
                        <InventorySettings />
                    </div>
                    <div className="w-full rounded-lg border bg-white p-4 md:p-6 overflow-x-auto">
                        <InventoryStatus />
                    </div>
                </div>
            </div>
        </div>
        </AdminRoute>
    )
}


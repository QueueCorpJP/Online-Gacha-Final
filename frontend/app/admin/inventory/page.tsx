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
        <div className="bg-gray-50 py-8">
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <div className="mx-auto max-w-[100vw] container space-y-8 py-8 px-3">
                <div className="space-y-6 max-w-[100vw]">
                    <div className="rounded-lg border bg-white p-6 max-w-[100vw]">
                        <InventorySettings />
                    </div>
                    <div className="rounded-lg border bg-white p-6 max-w-[100vw]">
                        <InventoryStatus />
                    </div>
                </div>
            </div>
        </div>
        </AdminRoute>
    )
}


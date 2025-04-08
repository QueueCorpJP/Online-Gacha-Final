import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav";
import { ReportChart } from "@/components/admin/reports/reports-chart";
import AdminRoute from "@/components/auth/admin-route";

export const metadata: Metadata = {
    title: "レポート | SHIJON管理画面",
    description: "売上や利用状況などの分析レポートを確認できます。",
}

export default function AdminReportsPage() {
    return (
        <AdminRoute>
        <div className="min-h-screen bg-gray-50 py-8">
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <div className="mx-auto max-w-[100vw] container space-y-8 py-8 px-3">
                <div className="rounded-lg border bg-white p-6 ">
                    <ReportChart />
                </div>
            </div>
        </div>
        </AdminRoute>
    )
}


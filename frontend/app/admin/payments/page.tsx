import type { Metadata } from "next"
import { AdminNav } from "@/components/admin/admin-nav";
import { PaymentSearch } from "@/components/admin/payments/payment-search";
import { PaymentTable } from "@/components/admin/payments/payment-table";
import AdminRoute from "@/components/auth/admin-route";

export const metadata: Metadata = {
    title: "決済管理 | SHIJON管理画面",
    description: "決済履歴の確認、管理を行うことができます。",
}

export default function AdminPaymentsPage() {
    return (
        <AdminRoute>
        <div className="bg-gray-50 py-8">
            <h1 className="text-xl font-bold container mx-auto mb-6">管理者ダッシュボード</h1>
            <AdminNav />
            <div className="mx-auto container space-y-8 py-8 px-3">
                <div className="space-y-6">
                    {/* <div className="rounded-lg border bg-white p-6">
                        <PaymentSearch />
                    </div> */}
                    <div className="rounded-lg border bg-white p-6">
                        <PaymentTable />
                    </div>
                </div>
            </div>
        </div>
        </AdminRoute>
    )
}


import type { Metadata } from "next"
import { UserDetails } from "@/components/admin/users/user-details"
import AdminRoute from "@/components/auth/admin-route"

export const metadata: Metadata = {
    title: "ユーザー詳細 | SHIJON管理画面",
    description: "ユーザーの詳細情報を確認、編集することができます。",
}

export default function UserDetailsPage() {
  return (
    <AdminRoute>
      <div className="bg-gray-50 py-8 container mx-auto">
        <UserDetails />
      </div>
    </AdminRoute>
  )

}

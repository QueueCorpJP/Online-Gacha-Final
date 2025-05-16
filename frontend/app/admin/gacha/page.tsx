"use client"

import { AdminNav } from "@/components/admin/admin-nav"
import { GachaForm } from "@/components/admin/gacha-form"
import { GachaTable } from "@/components/admin/gacha-table"
import AdminRoute from "@/components/auth/admin-route"
import { Toaster } from "sonner"
import { useState } from "react"

export const metadata = {
  title: "ガチャ管理 | SHIJON管理画面",
  description: "ガチャの作成・編集・削除を行うことができます。",
}

export default function AdminGachaPage() {
    const [editingGachaId, setEditingGachaId] = useState<string | null>(null);

    const handleEditGacha = (id: string) => {
        setEditingGachaId(id);
        // 画面上部のフォームまでスクロール
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleFormSubmit = () => {
        setEditingGachaId(null);
    };

    return (
        <AdminRoute>
        <div className="min-h-screen bg-gray-50 py-4 md:py-8">
            <Toaster />
            <h1 className="text-lg md:text-xl font-bold container mx-auto mb-4 md:mb-6 px-4 md:px-6">管理者ダッシュボード</h1>
            <AdminNav />
            <div className="container mx-auto space-y-4 md:space-y-8 py-4 md:py-8 px-4 md:px-6">
                <div className="w-full rounded-lg border bg-white p-4 md:p-6 overflow-x-auto">
                    <GachaForm 
                        gachaId={editingGachaId} 
                        onSubmitSuccess={handleFormSubmit} 
                    />
                </div>
                <div className="w-full rounded-lg border bg-white p-4 md:p-6 overflow-x-auto">
                    <GachaTable onEdit={handleEditGacha} />
                </div>
            </div>
        </div>
        </AdminRoute>
    )
}


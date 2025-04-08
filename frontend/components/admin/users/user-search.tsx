"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { setUsers } from "@/redux/features/userSlice"
import { useTranslations } from "@/hooks/use-translations"

interface User {
  id: string
  email: string
  username: string
  status: string
  createdAt: string
}

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { t } = useTranslations()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    // if (!searchQuery.trim()) {
    //   toast.error(t("admin.users.messages.searchKeywordRequired"))
    //   return
    // }

    setLoading(true)
    try {
      const response = await api.get<User[]>(`/admin/users/search?q=${encodeURIComponent(searchQuery)}`)
      dispatch(setUsers(response.data)) // Update Redux store with search results
      if (response.data.length === 0) {
        toast.info(t("admin.users.messages.noUsersFound"))
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error(t("admin.users.messages.searchError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-4">
        <Input
          placeholder={t("admin.users.search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          disabled={loading}
        />
        <Button 
          type="submit" 
          className="bg-black hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? t("common.searching") : t("common.search")}
        </Button>
      </form>
    </div>
  )
}


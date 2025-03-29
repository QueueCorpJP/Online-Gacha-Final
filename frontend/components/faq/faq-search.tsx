"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCallback, useState } from "react"

interface FaqSearchProps {
  onSearch: (query: string) => void;
}

export function FaqSearch({ onSearch }: FaqSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }, [onSearch])

  return (
    <div className="relative mb-12">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="質問を検索..."
        className="h-14 rounded-xl border-gray-800 bg-white pl-12 text-black placeholder:text-gray-400 focus-visible:ring-purple-500"
      />
    </div>
  )
}


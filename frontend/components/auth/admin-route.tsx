"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Loader2 } from "lucide-react"

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  // console.log("user", isLoading, user);
  useEffect(() => {
    if (!isLoading && (!user || !Array.isArray(user.roles) || !user.roles.includes('admin'))) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user || !user.roles.includes('admin')) {
    return null
  }

  return <>{children}</>
}

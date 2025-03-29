"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchUserNotifications, markNotificationAsRead } from "@/redux/features/notificationSlice"
import { format } from "date-fns"
import { useTranslations } from "@/hooks/use-translations"
import { Bell, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificationsClient() {
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslations()
  const { notifications, loading } = useSelector((state: RootState) => state.notification)
  const [visibleItems, setVisibleItems] = useState(5)

  useEffect(() => {
    dispatch(fetchUserNotifications())
  }, [dispatch])

  const handleMarkAsRead = async (notificationId: string) => {
    await dispatch(markNotificationAsRead(notificationId))
    dispatch(fetchUserNotifications())
  }

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 5)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('notifications.empty')}
          </div>
        ) : (
          <>
            {notifications.slice(0, visibleItems).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {format(new Date(notification.createdAt), 'yyyy/MM/dd HH:mm')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t('notifications.markAsRead')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {visibleItems < notifications.length && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  className="bg-white"
                >
                  {t('product.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

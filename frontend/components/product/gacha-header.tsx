"use client";
import { Star, Heart, ThumbsDown, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import { useState, useEffect } from 'react'
import { api } from '@/lib/axios'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import { ShareModal } from "@/components/share-modal"

interface GachaHeaderProps {
  category: string
  title: string
  reviews: number
  likes: number
  dislikes: number
  gachaId: string
}

export function GachaHeader({ 
  category, 
  title, 
  reviews, 
  likes: initialLikes,
  dislikes: initialDislikes,
  gachaId 
}: GachaHeaderProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const checkReactionStatus = async () => {
      if (!user) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await api.get(`/admin/gacha/${gachaId}/favorite`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setIsFavorited(response.data.favorited);
        setIsDisliked(response.data.disliked);
        setLikes(response.data.likes || initialLikes);
        setDislikes(response.data.dislikes || initialDislikes);

        const totalReactions = (response.data.likes || initialLikes) + (response.data.dislikes || initialDislikes);
        setRating(totalReactions > 0 ? 
          ((response.data.likes || initialLikes) * 5 + (response.data.dislikes || initialDislikes) * 1) / totalReactions 
          : 0);
      } catch (error) {
        // エラー処理
      }
    };
    checkReactionStatus();
  }, [gachaId, user, initialLikes, initialDislikes]);

  useEffect(() => {
    const totalReactions = likes + dislikes;
    setRating(totalReactions > 0 ? 
      (likes * 5 + dislikes * 1) / totalReactions 
      : 0);
  }, [likes, dislikes])

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user) {
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // リアクションを送信
      const response = await api.post(`/admin/gacha/${gachaId}/favorite`, 
        { type },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // サーバーからの応答を処理
      if (response.data) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setIsFavorited(response.data.favorited);
        setIsDisliked(response.data.disliked);
      }
    } catch (error: any) {
      // リアクションの更新に失敗した場合のエラー処理
      if (error.response) {
        console.error('API 500 Error:', error.response.data);
      } else {
        console.error('API Error:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-2 text-sm text-[#7C3AED]">{category}</div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold">{rating.toFixed(1)}</span>
          <span className="text-gray-500">
            {t("gacha.header.reviews").replace("{count}", (likes + dislikes).toString())}
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 p-2"
            onClick={() => handleReaction('like')}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} 
            />
            <span title={t("gacha.header.likes")}>{likes}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 p-2"
            onClick={() => handleReaction('dislike')}
          >
            <ThumbsDown 
              className={`h-5 w-5 ${isDisliked ? 'fill-gray-500 text-gray-500' : ''}`} 
            />
            <span title={t("gacha.header.dislikes")}>{dislikes}</span>
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={() => setIsShareModalOpen(true)}
        >
          <Share2 className="h-4 w-4" />
          {t("gacha.header.share")}
        </Button>
      </div>
      <ShareModal 
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        url={window.location.href}
        title={title}
      />
    </div>
  )
}

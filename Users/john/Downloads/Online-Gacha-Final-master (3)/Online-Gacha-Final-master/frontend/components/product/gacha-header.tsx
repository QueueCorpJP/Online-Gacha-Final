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
        setLikes(response.data.favorited.likes);
        setDislikes(response.data.favorited.dislikes);

        setRating( (likes + dislikes  > 0 )? 
          ((likes) * 5 + (dislikes) * 1) / ((likes) + (dislikes)) 
          : 0)

        console.log(response)
      } catch (error) {
        console.error('Failed to fetch reaction status:', error);
      }
    };
    checkReactionStatus();
  }, [gachaId, user]);

  useEffect(() => {
    setRating( (likes + dislikes  > 0 )? 
      ((likes) * 5 + (dislikes) * 1) / ((likes) + (dislikes)) 
      : 0)

    console.log(rating);
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
      console.log(`Sending ${type} reaction for gacha ${gachaId}`);
      const response = await api.post(`/admin/gacha/${gachaId}/favorite`, 
        { type },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Response from server:', response.data);
      if (response.data) {
        setLikes(response.data.likes);
        setDislikes(response.data.dislikes);
        setIsFavorited(response.data.favorited.favorited);
        setIsDisliked(response.data.favorited.disliked);
        
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
      // Add more detailed error logging
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error response:', (error as AxiosError).response?.data);
        // console.error('Error status:', error.response.status);
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
          <span className="font-bold">{rating}</span>
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
              className={`h-5 w-5 ${likes === 1 ? 'fill-red-500 text-red-500' : ''}`} 
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
              className={`h-5 w-5 ${dislikes === 1 ? 'fill-gray-500 text-gray-500' : ''}`} 
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

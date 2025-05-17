"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { uploadProfileImage, deleteProfileImage, fetchProfile } from "@/redux/features/profileSlice"

interface ProfileImageUploadProps {
  defaultImage?: string
  onImageChange?: (url: string | null) => void
}

export function ProfileImageUpload({ defaultImage, onImageChange }: ProfileImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { imageUploading, data: profileData } = useSelector((state: RootState) => state.profile)

  // プロフィールデータが更新されたら画像を更新
  useEffect(() => {
    if (profileData?.profileUrl) {
      setImage(`${profileData.profileUrl}?t=${new Date().getTime()}`);
      if (onImageChange) {
        onImageChange(profileData.profileUrl);
      }
    } else if (profileData && !profileData.profileUrl) {
      setImage(null);
      if (onImageChange) {
        onImageChange(null);
      }
    }
  }, [profileData, onImageChange]);

  useEffect(() => {
    if (defaultImage) {
      setImage(defaultImage)
    }
  }, [defaultImage])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        const file = acceptedFiles[0]
        
        // ファイルサイズチェック (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("ファイルサイズが大きすぎます（最大5MB）")
          return
        }

        setIsUploading(true)
        try {
          const uploadResult = await dispatch(uploadProfileImage(file))
          
          // アップロード後、プロフィール情報を再取得して実際の状態を確認
          const profileResult = await dispatch(fetchProfile())
          
          // プロフィールデータに新しい画像URLがあれば成功と判断
          if (profileResult.meta.requestStatus === 'fulfilled' && profileResult.payload?.profileUrl) {
            // 新しいタイムスタンプ付きのURLを使用してキャッシュ回避
            const imageUrl = `${profileResult.payload.profileUrl}?t=${new Date().getTime()}`
            setImage(imageUrl)
            
            if (onImageChange) {
              onImageChange(profileResult.payload.profileUrl)
            }
            
            toast.success("画像をアップロードしました")
            return
          }
          
          // プロフィール確認で判断できない場合は、元のレスポンスで判断
          if (uploadResult.meta.requestStatus === 'fulfilled') {
            if (uploadResult.payload?.url) {
              const imageUrl = `${uploadResult.payload.url}?t=${new Date().getTime()}`
              setImage(imageUrl)
              
              if (onImageChange) {
                onImageChange(uploadResult.payload.url)
              }
              
              toast.success("画像をアップロードしました")
            }
          } else if (uploadResult.meta.requestStatus === 'rejected') {
            toast.error("画像のアップロードに失敗しました")
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          
          // エラーが発生しても念のためプロフィール情報を取得して確認
          try {
            const profileResult = await dispatch(fetchProfile())
            
            // 新しいプロフィール画像URLがあれば、エラーが発生しても実際には成功している
            if (profileResult.meta.requestStatus === 'fulfilled' && 
                profileResult.payload?.profileUrl &&
                (!image || (image && !image.includes(profileResult.payload.profileUrl)))) {
              
              const imageUrl = `${profileResult.payload.profileUrl}?t=${new Date().getTime()}`
              setImage(imageUrl)
              
              if (onImageChange) {
                onImageChange(profileResult.payload.profileUrl)
              }
              
              toast.success("画像をアップロードしました")
              return
            }
          } catch (e) {
            console.error("Error fetching profile after upload error:", e)
          }
          
          toast.error("画像のアップロードに失敗しました")
        } finally {
          setIsUploading(false)
        }
      }
    },
    [dispatch, onImageChange, image],
  )

  const deleteImage = async () => {
    if (!image) return

    setIsUploading(true)
    try {
      const deleteResult = await dispatch(deleteProfileImage())
      
      // プロフィール情報を再取得して実際に画像が削除されたか確認
      const profileResult = await dispatch(fetchProfile())
      
      // プロフィールデータに画像URLがなければ削除成功と判断
      if (profileResult.meta.requestStatus === 'fulfilled' && !profileResult.payload?.profileUrl) {
        setImage(null)
        
        if (onImageChange) {
          onImageChange(null)
        }
        
        toast.success("画像を削除しました")
        return
      }
      
      // 判断できない場合は、deleteResultのステータスで判断
      if (deleteResult.meta.requestStatus === 'fulfilled') {
        setImage(null)
        
        if (onImageChange) {
          onImageChange(null)
        }
        
        toast.success("画像を削除しました")
      } else if (deleteResult.meta.requestStatus === 'rejected') {
        // 明示的に失敗の場合のみエラートーストを表示
        toast.error("画像の削除に失敗しました")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      
      // エラーが発生してもプロフィール情報を取得して実際の状態を確認
      const profileResult = await dispatch(fetchProfile())
      
      // プロフィールデータに画像URLがなければ削除成功と判断
      if (profileResult.meta.requestStatus === 'fulfilled' && !profileResult.payload?.profileUrl) {
        setImage(null)
        
        if (onImageChange) {
          onImageChange(null)
        }
        
        toast.success("画像を削除しました")
      } else {
        toast.error("画像の削除に失敗しました")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: imageUploading || isUploading,
  })

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">プロフィール画像</div>

      {image ? (
        <div className="relative">
          <img
            src={`${image}${image.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
            alt="プロフィール画像"
            className="h-32 w-32 rounded-full object-cover border"
            onError={(e) => {
              // 画像読み込みエラー時の処理
              console.error("Image load error, retrying...");
              const imgElement = e.target as HTMLImageElement;
              // 再試行回数を制限するためのカスタム属性
              const retryCount = +(imgElement.getAttribute('data-retry-count') || '0');
              const currentImage = image; // 現在のスコープの値をキャプチャ
              
              if (retryCount < 3 && currentImage) {
                // 画像URLにタイムスタンプを追加して再読み込み
                const newTimestamp = new Date().getTime();
                imgElement.src = `${currentImage.split('?')[0]}?t=${newTimestamp}`;
                imgElement.setAttribute('data-retry-count', (retryCount + 1).toString());
              } else {
                // 3回試行しても失敗した場合、プロフィールデータを再取得
                dispatch(fetchProfile());
              }
            }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6 rounded-full"
            onClick={deleteImage}
            disabled={imageUploading || isUploading}
          >
            {(imageUploading || isUploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            {isDragActive
              ? "ここに画像をドロップ"
              : "画像をドラッグ＆ドロップ、またはクリックして選択"}
          </p>
          <p className="text-xs text-center text-muted-foreground mt-1">
            対応形式: JPG, PNG, GIF
          </p>
          <p className="text-xs text-center text-muted-foreground">
            最大サイズ: 5MB
          </p>
          {(imageUploading || isUploading) && (
            <div className="mt-2 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">アップロード中...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
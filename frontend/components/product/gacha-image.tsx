import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface GachaImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function GachaImage({ src, alt, className, priority = false, sizes = "100vw" }: GachaImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const imageUrl = src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_API_URL}${src}`

  return (
    <div className={cn("relative overflow-hidden min-h-[300px] rounded-lg", className)}>
      <Image
        src={error ? "/placeholder.svg" : imageUrl}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-cover transition-opacity duration-300 rounded-lg",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.error("Failed to load image:", imageUrl);
          setError(true)
          setIsLoading(false)
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
    </div>
  )
}

import { Twitter, Facebook, Instagram, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title: string
}

export function ShareModal({ open, onOpenChange, url, title }: ShareModalProps) {
  const { t } = useTranslations()

  const shareOptions = [
    {
      id: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      onClick: () => window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
        "_blank"
      )
    },
    {
      id: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      onClick: () => window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank"
      )
    },
    // {
    //   id: 'instagram',
    //   icon: Instagram,
    //   label: 'Instagram',
    //   onClick: () => {
    //     // Instagram doesn't have a direct share URL, 
    //     // you might want to handle this differently
    //     alert(t("share.instagram.notAvailable"))
    //   }
    // }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {shareOptions.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="flex flex-col items-center gap-2 p-8"
              onClick={() => {
                option.onClick()
                onOpenChange(false)
              }}
            >
              <option.icon className="h-6 w-6" />
              <span className="text-sm">{option.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
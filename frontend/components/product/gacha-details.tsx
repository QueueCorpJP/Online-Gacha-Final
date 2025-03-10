import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CardGrid } from "./card-grid"
import { useTranslations } from "@/hooks/use-translations"

interface ProductDetail {
  title: string
  content: string
  isPurple?: boolean
}

interface GachaDetailsProps {
  description: string
  details: ProductDetail[]
  items: any[] // Update this type according to your item structure
}

export function GachaDetails({ description, details, items }: GachaDetailsProps) {
  const { t } = useTranslations()

  return (
    <Tabs defaultValue="details" className="mt-8 bg">
      <TabsList className="border-b w-full justify-start">
        <TabsTrigger
          value="details"
          className={cn(
            "border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:text-[#7C3AED]",
          )}
        >
          {t("gacha.details.tabs.details")}
        </TabsTrigger>
        <TabsTrigger
          value="cards"
          className={cn(
            "border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:text-[#7C3AED]",
          )}
        >
          {t("gacha.details.tabs.cards")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="p-4 mt-0 bg-muted">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-bold">{t("gacha.details.sections.description")}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
          {details.map((detail, index) => (
            <div key={index}>
              <h3 className={cn("mb-2", detail.isPurple && "text-[#7C3AED]")}>{detail.title}</h3>
              <p className="text-gray-600">{detail.content}</p>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="cards" className="p-4 mt-0 bg-muted">
        <CardGrid items={items} />
      </TabsContent>
    </Tabs>
  )
}

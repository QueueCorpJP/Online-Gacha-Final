import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/side-header";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { GachaCard } from "./components/cards/gacha-card";
import FAQ from "./components/faq";
import { useIsMobile } from "./components/ui/use-mobile";
import { useTranslations } from "@/hooks/use-translations";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchGachas } from "@/redux/features/gachaSlice";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { format } from "date-fns";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface NewsBlog {
  id: string;
  title: string;
  content: string;
  image?: string;
  isFeatured: boolean;
  createdAt: string;
}

export default function Home() {
  const isMobile = useIsMobile();
  const { t } = useTranslations();
  const dispatch = useDispatch<AppDispatch>();
  
  const { gachas, loading, error } = useSelector((state: RootState) => state.gacha);
  const [newsBlogs, setNewsBlogs] = useState<NewsBlog[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Add these state variables for carousel control
  const [popularApi, setPopularApi] = useState<CarouselApi | null>(null);
  const [currentPopularSlide, setCurrentPopularSlide] = useState(0);
  const [featuredApi, setFeaturedApi] = useState<CarouselApi | null>(null);
  const [currentFeaturedSlide, setCurrentFeaturedSlide] = useState(0);
  const [featuredMobileApi, setFeaturedMobileApi] = useState<CarouselApi | null>(null);
  const [currentFeaturedMobileSlide, setCurrentFeaturedMobileSlide] = useState(0);
  
  // Add these useEffects to track slide changes
  useEffect(() => {
    if (!popularApi) return;
    
    const onSelect = () => {
      setCurrentPopularSlide(popularApi.selectedScrollSnap());
    };
    
    popularApi.on("select", onSelect);
    // Initial call to set the correct state
    onSelect();
    
    return () => {
      popularApi.off("select", onSelect);
    };
  }, [popularApi]);

  useEffect(() => {
    if (!featuredApi) return;
    
    const onSelect = () => {
      setCurrentFeaturedSlide(featuredApi.selectedScrollSnap());
    };
    
    featuredApi.on("select", onSelect);
    // Initial call to set the correct state
    onSelect();
    
    return () => {
      featuredApi.off("select", onSelect);
    };
  }, [featuredApi]);

  useEffect(() => {
    if (!featuredMobileApi) return;
    
    const onSelect = () => {
      setCurrentFeaturedMobileSlide(featuredMobileApi.selectedScrollSnap());
    };
    
    featuredMobileApi.on("select", onSelect);
    // Initial call to set the correct state
    onSelect();
    
    return () => {
      featuredMobileApi.off("select", onSelect);
    };
  }, [featuredMobileApi]);

  useEffect(() => {
    dispatch(fetchGachas());
    loadNewsBlogs();
  }, [dispatch]);

  const loadNewsBlogs = async () => {
    try {
      const response = await api.get("/news-blog");
      setNewsBlogs(response.data);
    } catch (error) {
      console.error("Failed to load news blogs:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  // Select 3 featured cards - prioritize active gachas with highest price
  const featuredCards = gachas
    .filter(gacha => gacha.isActive)
    .sort((a, b) => Number(b.price) - Number(a.price))
    .slice(0, 6)
    .map(gacha => ({
      id: gacha.id,
      image: gacha.thumbnail || "/placeholder.png",
      remaining: gacha.items.reduce((total, item) => total + (item.stock || 0), 0),
      price: Number(gacha.price) || 10,
      title: gacha.name,
      translations: gacha.translations
    }));

  // Select 4 popular gachas - could be based on different criteria
  const popularGacha = gachas
    .filter(gacha => gacha.isActive)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8)
    .map(gacha => ({
      id: gacha.id,
      image: gacha.thumbnail || "/placeholder.png",
      rating: gacha.rating || 0,
      pricePerTry: Number(gacha.price) || 10,
      isNew: gacha.createdAt ? new Date(gacha.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false, // 7 days
      title: gacha.name,
      translations: gacha.translations
    }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>;
  }

  return (
    <div className="bg-white">
      <div className="flex">
        {!isMobile ? <SiteSidebar /> : null}

        <main className="flex-1 p-4 lg:p-8">
          {/* Featured Cards */}
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("home.featured.title")}</h2>
              <Link href="/products?sortBy=recommended">
                <Button variant="link" className="text-purple-600">
                  {t("home.featured.viewMore")}
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="hidden md:block">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  setApi={setFeaturedApi}
                  className="w-full"
                >
                  <CarouselContent>
                    {Array.from({ length: Math.ceil(featuredCards.length / 3) }).map((_, index) => (
                      <CarouselItem key={index} className="basis-full">
                        <div className="grid gap-4 grid-cols-3">
                          {featuredCards.slice(index * 3, index * 3 + 3).map((card) => (
                            <Link key={card.id} href={`/gacha/${card.id}`}>
                              <GachaCard
                                title={card.title}
                                remaining={card.remaining}
                                price={card.price}
                                variant="rect"
                                imageUrl={card.image}
                                translations={card.translations}
                              />
                            </Link>
                          ))}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(featuredCards.length / 3) }).map((_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${i === currentFeaturedSlide ? 'bg-purple-600 text-white' : 'bg-white'}`}
                          onClick={() => featuredApi?.scrollTo(i)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Carousel>
              </div>
              
              <div className="md:hidden">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  setApi={setFeaturedMobileApi}
                  className="w-full"
                >
                  <CarouselContent className="max-w-[calc(100vw-20px)]">
                    {featuredCards.map((card) => (
                      <CarouselItem key={card.id} className="basis-full">
                        <Link href={`/gacha/${card.id}`}>
                          <GachaCard
                            title={card.title}
                            remaining={card.remaining}
                            price={card.price}
                            variant="rect"
                            imageUrl={card.image}
                            translations={card.translations}
                          />
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                </Carousel>
              </div>
            </div>
          </div>

          {/* Popular Gacha */}
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("home.popular.title")}</h2>
              <Link href="/products?sortBy=rating-desc">
                <Button variant="link" className="text-purple-600">
                  {t("home.popular.viewMore")}
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="hidden md:block">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  setApi={setPopularApi}
                  className="w-full"
                >
                  <CarouselContent>
                    {Array.from({ length: Math.ceil(popularGacha.length / 4) }).map((_, index) => (
                      <CarouselItem key={index} className="basis-full">
                        <div className="grid gap-4 grid-cols-4">
                          {popularGacha.slice(index * 4, index * 4 + 4).map((card) => (
                            <Link key={card.id} href={`/gacha/${card.id}`}>
                              <GachaCard
                                title={card.title}
                                remaining={card.remaining}
                                price={card.price}
                                variant="rect"
                                imageUrl={card.image}
                                translations={card.translations}
                              />
                            </Link>
                          ))}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(popularGacha.length / 4) }).map((_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${i === currentPopularSlide ? 'bg-purple-600 text-white' : 'bg-white'}`}
                          onClick={() => popularApi?.scrollTo(i)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Carousel>
              </div>
              
              <div className="md:hidden">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="max-w-[calc(100vw-20px)]">
                    {popularGacha.map((card) => (
                      <CarouselItem key={card.id} className="basis-full">
                        <Link href={`/gacha/${card.id}`}>
                          <GachaCard
                            title={card.title}
                            remaining={card.remaining}
                            price={card.price}
                            variant="rect"
                            imageUrl={card.image}
                            translations={card.translations}
                          />
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {/* <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex gap-1">
                      {Array.from({ length: popularGacha.length }).map((_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${i === 0 ? 'bg-purple-600 text-white' : 'bg-white'}`}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div> */}
                </Carousel>
              </div>
            </div>
          </div>

          {/* News & Blog Section */}
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("home.news.title")}</h2>
              <Link href="/news-blog">
                <Button variant="link" className="text-purple-600">
                  {t("home.news.viewMore")}
                </Button>
              </Link>
            </div>
            
            {newsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {newsBlogs.slice(0, 3).map((post) => (
                  <Link 
                    key={post.id} 
                    href={`/news-blog/${post.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-[1.02]">
                      {post.image && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(post.createdAt), "yyyy.MM.dd")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
              
          {/* FAQ */}
          <FAQ />
        </main>
      </div>
    </div>
  );
}

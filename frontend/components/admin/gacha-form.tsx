"use client";
import { useTranslations } from "@/hooks/use-translations"
import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { UploadZone } from "@/components/ui/upload-zone"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { createGacha, updateGacha, fetchGachaById } from "@/redux/features/gachaSlice"
import { fetchCategories } from "@/redux/features/categorySlice"
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { GachaFormData, GachaItem, LanguageContent } from "@/types/gacha"
import { validateGachaForm } from "@/lib/validations/gacha-form";
import Image from 'next/image';
import { Checkbox } from "@/components/ui/checkbox";

interface GachaFormProps {
  initialData?: GachaFormData;
  gachaId?: string | null;
  onSubmitSuccess?: () => void;
}

interface LastOnePrize {
  id: string;
  name: string;
  image?: File;
  imageUrl?: string;
}


export function GachaForm({ initialData, gachaId, onSubmitSuccess }: GachaFormProps) {
  const { t } = useTranslations();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { categories, isLoading: categoriesLoading } = useSelector((state: RootState) => state.category);
  const { currentGacha, loading } = useSelector((state: RootState) => state.gacha);

  // Initialize state with either initialData or currentGacha
  const [formGachaId, setFormGachaId] = useState<string | null>(null);
  const [items, setItems] = useState<GachaItem[]>(initialData?.items || []);
  const [isLimitless, setIsLimitless] = useState(initialData?.dailyLimit === null);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [type, setType] = useState<'normal' | 'limited' | 'special'>(initialData?.type || 'normal');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [period, setPeriod] = useState(initialData?.period || 0);
  const [dailyLimit, setDailyLimit] = useState(initialData?.dailyLimit || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [content, setContent] = useState<Record<string, LanguageContent>>(
    initialData?.translations || {
      ja: { name: "", description: "" },
      en: { name: "", description: "" },
      zh: { name: "", description: "" },
    }
  );
  const [totalProbability, setTotalProbability] = useState<number>(0);
  const [category, setCategory] = useState<string>(initialData?.categoryId || '');
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const [lastOnePrize, setLastOnePrize] = useState<LastOnePrize | null>(null);
  const [lastOnePrizeImage, setLastOnePrizeImage] = useState<File | null>(null);
  const [isOneTimeFreeEnabled, setIsOneTimeFreeEnabled] = useState(initialData?.isOneTimeFreeEnabled ?? false);
  const [pityThreshold, setPityThreshold] = useState(initialData?.pityThreshold || 50);
  const [lastOnePrizeId, setLastOnePrizeId] = useState<string | null>(null);

  // 外部から指定されたgachaIdが変更されたとき、そのガチャを取得して表示する
  useEffect(() => {
    if (gachaId && gachaId !== formGachaId) {
      setFormGachaId(gachaId);
      // ガチャデータを取得するアクションをディスパッチ
      dispatch(fetchGachaById(gachaId));
    }
  }, [gachaId, formGachaId, dispatch]);

  // Use useEffect to update form data when currentGacha changes
  useEffect(() => {
    if (currentGacha) {
      setFormGachaId(currentGacha.id);
      setItems(currentGacha.items.map(item => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity as "S" | "A" | "B" | "C" | "D",
        probability: Number(item.probability),
        stock: item.stock,
        exchangeRate: Number(item.exchangeRate),
        image: typeof item.image === 'object' ? item.image as File : undefined,
        imageUrl: item.image ? 
          (item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`)
          : undefined
      })));
      setIsLimitless(currentGacha.dailyLimit === null);
      setIsActive(currentGacha.isActive);
      setType((currentGacha.type === 'normal' || currentGacha.type === 'limited' || currentGacha.type === 'special') 
        ? currentGacha.type 
        : 'normal');
      setPrice(Number(currentGacha.price));
      setPeriod(currentGacha.period ? Number(currentGacha.period) : 0);
      setDailyLimit(currentGacha.dailyLimit || 0);
      setCategory(currentGacha.category?.id || '');
      setIsOneTimeFreeEnabled(currentGacha.isOneTimeFreeEnabled ?? false);
      setPityThreshold(currentGacha.pityThreshold || 50);
      
      // Set thumbnail if exists
      if (currentGacha.thumbnail) {
        setPreviewUrls(prev => ({
          ...prev,
          thumbnail: currentGacha.thumbnail.startsWith('http') 
            ? currentGacha.thumbnail 
            : `${process.env.NEXT_PUBLIC_API_URL}${currentGacha.thumbnail}`
        }));
      }

      // Set content/translations
      setContent({
        ja: { 
          name: currentGacha.translations?.ja?.name || '', 
          description: currentGacha.translations?.ja?.description || '' 
        },
        en: { 
          name: currentGacha.translations?.en?.name || '', 
          description: currentGacha.translations?.en?.description || '' 
        },
        zh: { 
          name: currentGacha.translations?.zh?.name || '', 
          description: currentGacha.translations?.zh?.description || '' 
        }
      });

      // Calculate and set total probability
      const total = currentGacha.items.reduce((sum, item) => sum + Number(item.probability), 0);
      setTotalProbability(total);

      if (currentGacha.lastOnePrize) {
        setLastOnePrize({
          id: currentGacha.lastOnePrize.id,
          name: currentGacha.lastOnePrize.name,
          imageUrl: currentGacha.lastOnePrize.image ? 
            (currentGacha.lastOnePrize.image.startsWith('http') 
              ? currentGacha.lastOnePrize.image 
              : `${process.env.NEXT_PUBLIC_API_URL}${currentGacha.lastOnePrize.image}`)
            : undefined
        });
      }
    }
  }, [currentGacha]);

  useEffect(() => {
    if (initialData) {
      // Fix thumbnail preview URL handling
      if (initialData.thumbnail) {
        const thumbnailUrl = typeof initialData.thumbnail === 'string' 
          ? (initialData.thumbnail.startsWith('http')
            ? initialData.thumbnail
            : `${process.env.NEXT_PUBLIC_API_URL}${initialData.thumbnail}`)
          : '';
        
        setPreviewUrls(prev => ({
          ...prev,
          thumbnail: thumbnailUrl
        }));
      }

      // Fix items image URL handling
      if (initialData.items) {
        const updatedItems = initialData.items.map(item => ({
          ...item,
          imageUrl: item.imageUrl ? 
            (item.imageUrl.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`)
            : undefined
        }));
        setItems(updatedItems);
      }
    }
  }, [initialData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // ... other validation logic ...

    // Validate items
    if (!items || items.length === 0) {
      errors.items = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        // ... other item validations ...

        // Stock validation
        if (!item.stock || item.stock <= 0) {
          errors[`items.${index}.stock`] = 'Stock must be greater than 0';
        }

        // Probability validation
        if (!item.probability || item.probability <= 0 || item.probability > 100) {
          errors[`items.${index}.probability`] = 'Probability must be between 0 and 100';
        }
      });

      // Validate total probability
      const totalProbability = calculateTotalProbability(items);
      if (Math.abs(totalProbability - 100) > 0.01) {
        errors.probability = 'Total probability must equal 100%';
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    setThumbnail(file)
  }

  const addItem = () => {
    const newItem: GachaItem = {
      id: crypto.randomUUID(), // Replace deprecated Math.random().toString()
      name: "",
      rarity: "D", // Default to D rarity
      probability: 0,
      stock: 0,
      exchangeRate: 1.00,
    }
    setItems([...items, newItem])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create validation data object
    const formData: GachaFormData = {
      translations: {
        ja: content.ja,
        en: content.en,
        zh: content.zh,
      },
      categoryId: category,
      type,
      price: Number(price),
      period: period ? Number(period) : 0,
      dailyLimit: isLimitless ? null : Number(dailyLimit),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        probability: Number(item.probability),
        stock: item.stock ? Number(item.stock) : undefined,
        exchangeRate: Number(item.exchangeRate),
        image: item.image
      })),
      isActive,
      thumbnail: thumbnail || undefined,
      isOneTimeFreeEnabled,
      pityThreshold: Number(pityThreshold),
    };

    // Validate the form
    const validationErrors = validateGachaForm(formData);

    // Additional custom validations
    if (!category) {
      validationErrors.category = t("gachaForm.validation.categoryRequired");
    }

    // if (!thumbnail && !gachaId) {
    //   validationErrors.thumbnail = t("gachaForm.validation.thumbnailRequired");
    // }

    // Update errors state
    setErrors(validationErrors);

    console.log(validationErrors)

    // If there are validation errors, show toast and return
    if (Object.keys(validationErrors).length > 0) {
      console.log(validationErrors)
      toast.error(t("gachaForm.toast.validationError"));
      return;
    }

    try {
      // Create FormData for multipart/form-data submission
      const submitFormData = new FormData();
      
      // Add the JSON data
      submitFormData.append('data', JSON.stringify({
        translations: formData.translations,
        categoryId: formData.categoryId,  // Keep categoryId consistent
        type: formData.type,
        price: formData.price,
        period: formData.period,
        dailyLimit: formData.dailyLimit,
        items: formData.items.map((item, index) => ({
          ...item,
          hasNewImage: item.image instanceof File,
          imageIndex: index, // Add index for tracking
          image: undefined // Remove the File object from JSON
        })),
        isActive: formData.isActive,
        isOneTimeFreeEnabled: formData.isOneTimeFreeEnabled,
        pityThreshold: formData.pityThreshold,
      }));

      // Add thumbnail if exists
      if (thumbnail) {
        submitFormData.append('thumbnail', thumbnail);
      }

      // Only append actual files to itemImages
      items.forEach((item, index) => {
        if (item.image instanceof File) {
          submitFormData.append('itemImages', item.image);
        } else {
          // Convert Blob to File with empty name and image type
          const file = new File([], 'empty.png', { type: 'image/png' });
          submitFormData.append('itemImages', file);
        }
      });

      if (formGachaId) {
        const result = await dispatch(updateGacha({ 
          id: formGachaId, 
          data: submitFormData
        })).unwrap();
        
        if (result) {
          toast.success(t("gachaForm.toast.updateSuccess"));
          if (onSubmitSuccess) {
            onSubmitSuccess();
          } else {
            router.push('/admin/gacha');
          }
        }
      } else {
        const result = await dispatch(createGacha(submitFormData)).unwrap();
        
        if (result) {
          toast.success(t("gachaForm.toast.createSuccess"));
          if (onSubmitSuccess) {
            onSubmitSuccess();
          } else {
            router.push('/admin/gacha');
          }
        }
      }

      if (lastOnePrize) {
        submitFormData.append('lastOnePrize', JSON.stringify({
          ...lastOnePrize,
          image: undefined // Remove the File object from JSON
        }));
        
        if (lastOnePrizeImage) {
          submitFormData.append('lastOnePrizeImage', lastOnePrizeImage);
        }
      }
    } catch (error: any) {
      toast.error(t("gachaForm.toast.error"), {
        description: error.message || t("gachaForm.toast.genericError")
      });
    }
  }

  const handleContentChange = (lang: string, field: keyof LanguageContent, value: string) => {
    setContent((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }))
  }

  const placeholders = {
    ja: {
      title: "日本語設定",
      name: "ガチャ名を入力",
      category: "ガチャカテゴリーを選択",
      description: "説明を入力",
    },
    en: {
      title: "English Settings",
      name: "Enter Gacha Name",
      category: "Select Gacha Category",
      description: "Enter Description",
    },
    zh: {
      title: "中文设置",
      name: "输入扭蛋名称",
      category: "选择扭蛋类别",
      description: "输入描述",
    },
  }

  const calculateTotalProbability = (items: GachaItem[]): number => {
    return items.reduce((sum, item) => sum + (item.probability || 0), 0);
  };

  const handleProbabilityChange = (itemId: string, value: number) => {
    const updatedItems = items.map(i => 
      i.id === itemId ? { ...i, probability: value } : i
    );
    setItems(updatedItems);
    setTotalProbability(calculateTotalProbability(updatedItems));
  };

  const renderProbabilityTotal = () => {
    const isValid = Math.abs(totalProbability - 100) < 0.01;
    return (
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm">Total Probability:</span>
        <span className={`font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          {totalProbability.toFixed(2)}%
        </span>
        {!isValid && (
          <span className="text-sm text-red-500">
            (Total must be 100%)
          </span>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (items.length > 0) {
      setTotalProbability(calculateTotalProbability(items));
    }
  }, []); // Run once on component mount

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid">
        <h2 className="font-bold text-2xl mb-10">
          {formGachaId ? t('gachaForm.titleEdit') : t('gachaForm.title')}
        </h2>
        <div className="space-y-8">
          {/* Language Tabs */}

          {["ja", "en", "zh"].map((lang) => (
            <div key={lang} className="space-y-6">
              <h3>{t(`gachaForm.languageSettings.${lang}`)}</h3>
              <div>
                <Input
                  value={content[lang].name}
                  onChange={(e) => handleContentChange(lang, "name", e.target.value)}
                  placeholder={placeholders[lang as keyof typeof placeholders].name}
                  className={`h-12 rounded-lg bg-white ${errors[`${lang}.name`] ? 'border-red-500' : ''}`}
                />
                {errors[`${lang}.name`] && (
                  <p className="text-sm text-red-500 mt-1">{errors[`${lang}.name`]}</p>
                )}
              </div>
              <Textarea
                value={content[lang].description}
                onChange={(e) => handleContentChange(lang, "description", e.target.value)}
                placeholder={placeholders[lang as keyof typeof placeholders].description}
                className="min-h-[200px] rounded-lg bg-white"
              />
            </div>
          ))}

          {/* Common Settings */}
          <Card className="rounded-lg bg-white">
            <CardContent className="p-6">
              <h3 className="mb-6 text-lg font-medium">{t('gachaForm.commonSettings.title')}</h3>
              <div className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <Label htmlFor="category" className="mb-2 block text-sm text-gray-600">
                      {t('gachaForm.commonSettings.category.label')}
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setCategory(value)}
                    >
                      <SelectTrigger className="h-12 rounded-lg bg-white">
                        <SelectValue placeholder={t('gachaForm.commonSettings.category.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>
                            {t('common.loading')}
                          </SelectItem>
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            {t('gachaForm.commonSettings.category.noCategories')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type" className="mb-2 block text-sm text-gray-600">
                      ガチャ種類
                    </Label>
                    <Select
                      value={type}
                      onValueChange={(value: "normal" | "limited" | "special") => setType(value)}
                    >
                      <SelectTrigger className="h-12 rounded-lg bg-white">
                        <SelectValue placeholder={t('gachaForm.commonSettings.type.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">{t('gachaForm.commonSettings.type.normal')}</SelectItem>
                        <SelectItem value="limited">{t('gachaForm.commonSettings.type.limited')}</SelectItem>
                        <SelectItem value="special">{t('gachaForm.commonSettings.type.special')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                <div>
                    <Label htmlFor="price" className="mb-2 block text-sm text-gray-600">
                      {t('gachaForm.commonSettings.price.label')}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={price === 0 ? '' : price}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        setPrice(value);
                      }}
                      placeholder={t('gachaForm.commonSettings.price.placeholder')}
                      className={`h-12 rounded-lg bg-white ${errors.price ? 'border-red-500' : ''}`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="period" className="mb-2 block text-sm text-gray-600">
                      {t('gachaForm.commonSettings.period.label')}
                    </Label>
                    <Input
                      id="period"
                      type="number"
                      value={period === 0 ? '' : period}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        setPeriod(value);
                      }}
                      placeholder={t('gachaForm.commonSettings.period.placeholder')}
                      className="h-12 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyLimit" className="text-sm text-gray-600">
                      {t('gachaForm.commonSettings.dailyLimit.label')}
                    </Label>
                    <div className="mb-2 flex gap-2 items-center justify-between">
                      <Input
                        id="dailyLimit"
                        type="number"
                        value={dailyLimit === 0 ? '' : dailyLimit}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          setDailyLimit(value);
                        }}
                        disabled={isLimitless}
                        placeholder={t('gachaForm.commonSettings.dailyLimit.placeholder')}
                        className="h-12 rounded-lg bg-white"
                      />
                      <div className="flex items-center gap-2 min-w-32">
                        <span className="text-sm text-gray-600">{t('gachaForm.commonSettings.dailyLimit.unlimited')}</span>
                        <Switch
                          checked={isLimitless}
                          onCheckedChange={setIsLimitless}
                          className="data-[state=checked]:bg-[#9333EA]"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label 
                      htmlFor="pityThreshold" 
                      className="mb-2 block text-sm text-gray-600"
                    >
                      {t('gachaForm.commonSettings.pityThreshold.label')}
                    </Label>
                    <Input
                      id="pityThreshold"
                      type="number"
                      min="1"
                      max="100"
                      value={pityThreshold}
                      onChange={(e) => setPityThreshold(Number(e.target.value))}
                      placeholder={t('gachaForm.commonSettings.pityThreshold.placeholder')}
                      className={`h-12 rounded-lg bg-white ${errors.pityThreshold ? 'border-red-500' : ''}`}
                    />
                    {errors.pityThreshold && (
                      <p className="text-sm text-red-500 mt-1">{errors.pityThreshold}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {t('gachaForm.commonSettings.pityThreshold.help')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Settings */}
          <div className="grid gap-8 lg:grid-cols-[3fr,1fr]">
            <Card className="rounded-lg bg-white">
              <CardContent className="p-6">
                <h3 className="mb-6 text-lg font-medium">{t('gachaForm.itemSettings.title')}</h3>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-7 items-center">
                        <div className="space-y-1">
                          <Label htmlFor={`name-${item.id}`}>
                            {t('gachaForm.itemSettings.name')}
                          </Label>
                          <Input 
                            id={`name-${item.id}`}
                            placeholder={t('gachaForm.itemSettings.name')} 
                            value={item.name}
                            onChange={(e) => {
                              console.log(e.target.value, item.id)
                              setItems(prevItems => prevItems.map(i => 
                                i.id === item.id ? { ...i, name: e.target.value } : i
                              ))
                            }}
                            className="h-12 rounded-lg bg-white" 
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`rarity-${item.id}`}>
                            {t('gachaForm.itemSettings.rarity.label')}
                          </Label>
                          <Select
                            value={item.rarity}
                            onValueChange={(value: "S" | "A" | "B" | "C" | "D") => {
                              setItems(prevItems => prevItems.map(i => 
                                i.id === item.id ? { ...i, rarity: value } : i
                              ))
                            }}
                          >
                            <SelectTrigger id={`rarity-${item.id}`} className="h-12 rounded-lg bg-white">
                              <SelectValue placeholder={t('gachaForm.itemSettings.rarity.label')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="S">S</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`probability-${item.id}`}>
                            {t('gachaForm.itemSettings.probability')}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`probability-${item.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.probability || ''}
                              onChange={(e) => {
                                handleProbabilityChange(item.id, Number(e.target.value));
                              }}
                              className={`h-12 rounded-lg bg-white pr-8 ${
                                errors[`items.${index}.probability`] ? 'border-red-500' : ''
                              }`}
                              placeholder="0-100"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              %
                            </span>
                          </div>
                          {errors[`items.${index}.probability`] && (
                            <p className="text-sm text-red-500">{errors[`items.${index}.probability`]}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`exchangeRate-${item.id}`}>
                            {t('gachaForm.itemSettings.exchangeRate')}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`exchangeRate-${item.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.exchangeRate || 1.00}
                              onChange={(e) => {
                                setItems(prevItems => prevItems.map(i => 
                                  i.id === item.id ? { ...i, exchangeRate: Number(e.target.value) } : i
                                ))
                              }}
                              className={`h-12 rounded-lg bg-white pr-8 ${
                                errors[`items.${index}.exchangeRate`] ? 'border-red-500' : ''
                              }`}
                              placeholder="Exchange Rate"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                              %
                            </span>
                          </div>
                          {errors[`items.${index}.exchangeRate`] && (
                            <p className="text-sm text-red-500">{errors[`items.${index}.exchangeRate`]}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`stock-${item.id}`}>
                            {t('gachaForm.itemSettings.stock')}
                          </Label>
                          <Input
                            id={`stock-${item.id}`}
                            placeholder={t('gachaForm.itemSettings.stock')}
                            type="number"
                            min="0"
                            value={item.stock || ''}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : undefined;
                              setItems(prevItems => prevItems.map(i => 
                                i.id === item.id ? { ...i, stock: value ?? 0 } : i
                              ))
                            }}
                            className={`h-12 rounded-lg bg-white ${
                              errors[`items.${index}.stock`] ? 'border-red-500' : ''
                            }`}
                          />
                          {errors[`items.${index}.stock`] && (
                            <p className="text-sm text-red-500">{errors[`items.${index}.stock`]}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={item.id === lastOnePrizeId}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setLastOnePrizeId(item.id);
                              } else {
                                setLastOnePrizeId(null);
                              }
                            }}
                            id={`lastOnePrize-${item.id}`}
                          />
                          <Label
                            htmlFor={`lastOnePrize-${item.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t('gachaForm.itemSettings.lastOnePrize')}
                          </Label>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative h-16 w-16">
                            {(item.image || item.imageUrl) ? (
                              <div className="relative group h-full">
                                <div className="h-full w-full relative">
                                  <Image
                                    src={item.imageUrl ? item.imageUrl : '/placeholder.svg'}
                                    alt={item.name || '商品画像'}
                                    width={100}
                                    height={100}
                                    className="h-full w-full object-contain rounded-md"
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                  <button
                                    type="button"
                                    className="text-white text-sm"
                                    onClick={() => {
                                      setItems(prevItems => prevItems.map(i => 
                                        i.id === item.id ? { ...i, image: undefined, imageUrl: undefined } : i
                                      ))
                                    }}
                                  >
                                    Change
                                  </button>
                                </div>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setItems(prevItems => prevItems.map(i => 
                                        i.id === item.id ? { ...i, image: file, imageUrl: undefined } : i
                                      ))
                                    }
                                  }}
                                  className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
                                />
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const imageUrl = URL.createObjectURL(file);
                                      setItems(prevItems => prevItems.map(i => 
                                        i.id === item.id ? { 
                                          ...i, 
                                          image: file,
                                          imageUrl: imageUrl
                                        } : i
                                      ));
                                    }
                                  }}
                                  className="absolute inset-0 cursor-pointer opacity-0 w-full h-full"
                                />
                                <div className="p-2 h-full w-full flex items-center justify-center rounded-md border border-input bg-violet-50 text-sm font-semibold text-violet-700 hover:bg-violet-100">
                                  画像
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setItems(prevItems => {
                                const updatedItems = prevItems.filter(i => i.id !== item.id);
                                // Recalculate total probability after removing item
                                const newTotal = updatedItems.reduce((sum, item) => sum + (item.probability || 0), 0);
                                setTotalProbability(newTotal);
                                return updatedItems;
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length > 0 && renderProbabilityTotal()}

                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={addItem}
                  >
                    <Plus className="h-4 w-4" />
                    {t('gachaForm.itemSettings.addItem')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <UploadZone
                onFileSelect={handleFileSelect}
                maxSize={5 * 1024 * 1024}
                accept={{
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/png': ['.png']
                }}
                defaultPreview={
                  previewUrls.thumbnail || undefined
                }
                className="bg-white"
              />
              <div className="text-xs text-gray-500 space-y-1">
                <p>{t('gachaForm.thumbnail.recommendedSize')}</p>
                <p>{t('gachaForm.thumbnail.maxFileSize')}</p>
                <p>{t('gachaForm.thumbnail.supportedFormats')}</p>
              </div>
            </div>
            {/* <Card className="rounded-lg bg-white">
        <CardContent className="p-6">
          <h3 className="mb-6 text-lg font-medium">{t('gachaForm.lastOnePrize.title')}</h3>
          <div className="space-y-4">
            <div className="grid gap-4">
              <Label>{t('gachaForm.lastOnePrize.name')}</Label>
              <Input
                value={lastOnePrize?.name || ''}
                onChange={(e) => setLastOnePrize(prev => ({
                  ...prev,
                  id: prev?.id || crypto.randomUUID(),
                  name: e.target.value
                }))}
                placeholder={t('gachaForm.lastOnePrize.namePlaceholder')}
              />
            </div>
            
            <div className="grid gap-4">
              <Label>{t('gachaForm.lastOnePrize.image')}</Label>
              <UploadZone
                currentImage={lastOnePrize?.imageUrl}
                onFileSelect={(file) => {
                  setLastOnePrizeImage(file);
                  setLastOnePrize(prev => ({
                    ...prev,
                    id: prev?.id || crypto.randomUUID(),
                    image: file
                  }));
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card> */}
          </div>

        </div>

        {/* Right Column - Thumbnail Upload */}

      </div>
      <div className="flex items-center gap-2 min-w-32 justify-start mb-4">
        <Switch
          checked={isOneTimeFreeEnabled}
          onCheckedChange={setIsOneTimeFreeEnabled}
          className="data-[state=checked]:bg-[#9333EA]"
        />
        <span className="text-sm text-gray-600">{t('gachaForm.oneTimeFree.label')}</span>
      </div>
      <div className="flex items-center gap-2 min-w-32 justify-start mb-4">
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          className="data-[state=checked]:bg-[#9333EA]"
        />
        <span className="text-sm text-gray-600">{t('gachaForm.status.active')}</span>
      </div>
      <Button type="submit" className="w-full bg-[#9333EA] hover:bg-[#7E22CE] text-white rounded-lg py-4">
        {formGachaId ? t('gachaForm.update') : t('gachaForm.submit')}
      </Button>
    </form>
  )
}


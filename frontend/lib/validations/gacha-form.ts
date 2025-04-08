import { GachaFormData, LanguageContent } from "@/types/gacha";

export const validateGachaForm = (data: GachaFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validate translations
  (['ja', 'en', 'zh'] as const).forEach((lang) => {
    if (!data.translations[lang].name?.trim()) {
      errors[`${lang}.name`] = `Name in ${lang} is required`;
    }
    if (!data.translations[lang].description?.trim()) {
      errors[`${lang}.description`] = `Description in ${lang} is required`;
    }
  });

  // Validate price
  if (!data.price || data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  // Validate period
  if (!data.period || data.period <= 0) {
    errors.period = 'Period must be greater than 0';
  }

  // Validate daily limit
  if (data.dailyLimit !== null && data.dailyLimit <= 0) {
    errors.dailyLimit = 'Daily limit must be greater than 0';
  }

  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    // Validate individual items
    let totalProbability = 0;
    data.items.forEach((item, index) => {
      if (!item.name?.trim()) {
        errors[`items.${index}.name`] = 'Item name is required';
      }
      if (!item.rarity) {
        errors[`items.${index}.rarity`] = 'Item rarity is required';
      }
      if (!item.probability || item.probability <= 0 || item.probability > 100) {
        errors[`items.${index}.probability`] = 'Probability must be between 0 and 100';
      }
      if (item.stock !== undefined && item.stock < 0) {
        errors[`items.${index}.stock`] = 'Stock cannot be negative';
      }
      totalProbability += Number(item.probability) || 0;
    });

    // Validate total probability
    if (Math.abs(totalProbability - 100) > 0.01) {
      errors.probability = 'Total probability must equal 100%';
    }
  }

  // Validate thumbnail
  // if (!data.thumbnail) {
  //   errors.thumbnail = 'Thumbnail is required';
  // }

  // Validate pity threshold
  if (data.pityThreshold !== undefined) {
    if (data.pityThreshold < 1 || data.pityThreshold > 100) {
      errors.pityThreshold = 'Pity threshold must be between 1 and 100';
    }
  }

  return errors;
};

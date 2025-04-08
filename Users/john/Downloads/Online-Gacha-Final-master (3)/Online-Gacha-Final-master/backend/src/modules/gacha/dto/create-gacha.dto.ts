import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from 'src/modules/category/entities/category.entity';
import { RarityType } from '../entities/gacha-item.entity';

class LanguageContent {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

class TranslationsDto {
  @ValidateNested()
  @Type(() => LanguageContent)
  ja: LanguageContent;

  @ValidateNested()
  @Type(() => LanguageContent)
  en: LanguageContent;

  @ValidateNested()
  @Type(() => LanguageContent)
  zh: LanguageContent;
}

class GachaItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  @IsEnum(RarityType)
  rarity: RarityType;

  @IsNumber()
  probability: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  psaGrading?: string;

  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  unopened?: boolean;

  @IsOptional()
  @IsBoolean()
  hasNewImage?: boolean;

  @IsOptional()
  @IsNumber()
  imageIndex?: number;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;
}

class LastOnePrizeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateGachaDto {
  @ValidateNested()
  @Type(() => TranslationsDto)
  translations: TranslationsDto;

  @IsString()
  type: 'normal' | 'limited' | 'special';

  @IsString()
  categoryId: Category;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  period?: number;

  @IsOptional()
  @IsNumber()
  dailyLimit?: number;

  @IsOptional()
  @IsBoolean()
  isLimitless?: boolean;

  @IsOptional()
  @IsBoolean()
  isOneTimeFreeEnabled?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GachaItemDto)
  items: {
    id?: string;
    name: string;
    rarity: RarityType;
    probability: number;
    stock?: number;
    image?: Express.Multer.File;
    imageUrl: string;
    hasNewImage: boolean;
    imageIndex: number;
    exchangeRate: number;
  }[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  // @IsOptional()
  // @IsBoolean()
  // isOneTimeFreeEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => LastOnePrizeDto)
  lastOnePrize?: LastOnePrizeDto;

  @IsOptional()
  @IsNumber()
  pityThreshold?: number;
}

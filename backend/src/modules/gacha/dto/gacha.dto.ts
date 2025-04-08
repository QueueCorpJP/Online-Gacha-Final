import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RarityType } from '../entities/gacha-item.entity';
import { Category } from 'src/modules/category/entities/category.entity';

class LanguageContent {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  description: string;
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

  @IsEnum(RarityType)
  rarity: RarityType;

  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  psaGrading?: string;

  @IsOptional()
  unopened?: boolean;
}

export class CreateGachaDto {
  translations: {
    ja: {
      name: string;
      description: string;
    };
    en: {
      name: string;
      description: string;
    };
    zh: {
      name: string;
      description: string;
    };
  };
  @IsEnum(['normal', 'limited', 'special'])
  type: 'normal' | 'limited' | 'special';
  category: Category;
  price: number;
  period?: number;
  dailyLimit?: number;
  isLimitless?: boolean;
  @IsOptional()
  @IsBoolean()
  isOneTimeFreeEnabled?: boolean;
  items: {
    id?: string;
    name: string;
    rarity: RarityType;
    probability: number;
    stock?: number;
    image?: Express.Multer.File;
    imageUrl: string;
    hasNewImage: boolean,
    imageIndex: number,
    exchangeRate: number
  }[];
  isActive?: boolean;
  @IsString()
  thumbnailUrl?: string;
   @IsOptional()
    @ValidateNested()
    @Type(() => LastOnePrizeDto)
    lastOnePrize?: LastOnePrizeDto;
  @IsNumber()
  @IsOptional()
  pityThreshold?: number;
}

export class UpdateGachaDto extends CreateGachaDto {
  @IsOptional()
  isActive?: boolean;
}

export class GachaFilterDto {
  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ratings?: number[];

  @IsOptional()
  @IsString()
  sortBy?: string;
}

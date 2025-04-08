import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateGachaItemDto {
  @IsString()
  name: string;

  @IsEnum(['S', 'A', 'B', 'C', 'D'])
  rarity: 'S' | 'A' | 'B' | 'C' | 'D';

  @IsNumber()
  @Min(0)
  @Max(100)
  probability: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  exchangeRate: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  hasNewImage?: boolean;

  @IsOptional()
  @IsNumber()
  imageIndex?: number;
}

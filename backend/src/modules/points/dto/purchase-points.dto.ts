import { IsNumber, IsString, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchasePointsDto {
  @ApiProperty({ description: 'Amount of points to purchase', minimum: 100 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
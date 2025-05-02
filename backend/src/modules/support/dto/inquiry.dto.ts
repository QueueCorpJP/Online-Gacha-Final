import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum InquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export class CreateInquiryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;
}

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatus)
  status: InquiryStatus;
}

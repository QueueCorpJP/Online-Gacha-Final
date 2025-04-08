import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateLineSettingsDto {
  @IsOptional()
  @IsBoolean()
  isConnected?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}
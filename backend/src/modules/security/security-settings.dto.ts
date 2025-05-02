import { IsBoolean, IsEmail } from 'class-validator';

export class SecuritySettingsDto {
  @IsBoolean()
  ipRestriction: boolean;

  @IsBoolean()
  logMonitoring: boolean;

  @IsEmail()
  alertEmail: string;
}
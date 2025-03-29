import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecuritySettings } from './security-settings.entity';

@Injectable()
export class SecuritySettingsService {
  constructor(
    @InjectRepository(SecuritySettings)
    private securitySettingsRepository: Repository<SecuritySettings>,
  ) {}

  async getSettings() {
    const settings = await this.securitySettingsRepository.findOne({
      where: { id: 1 }, // Assuming we only have one settings record
    });

    if (!settings) {
      return this.createDefaultSettings();
    }

    return settings;
  }

  async updateSettings(settingsData: Partial<SecuritySettings>) {
    let settings = await this.securitySettingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await this.createDefaultSettings();
    }

    Object.assign(settings, settingsData);
    return this.securitySettingsRepository.save(settings);
  }

  private async createDefaultSettings() {
    const defaultSettings = this.securitySettingsRepository.create({
      ipRestriction: false,
      logMonitoring: true,
      alertEmail: 'alert@example.com',
    });

    return this.securitySettingsRepository.save(defaultSettings);
  }
}
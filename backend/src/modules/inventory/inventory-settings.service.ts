import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventorySettings } from './inventory-settings.entity';

@Injectable()
export class InventorySettingsService {
  constructor(
    @InjectRepository(InventorySettings)
    private readonly settingsRepository: Repository<InventorySettings>,
  ) {}

  async getSettings() {
    const settings = await this.settingsRepository.findOne({
      where: {},
    });

    if (!settings) {
      // Return default settings if none exist
      return {
        globalThreshold: 20,
        notificationMethod: "line",
        realTimeUpdates: true,
      };
    }

    return settings;
  }

  async updateSettings(settings: {
    globalThreshold: number;
    notificationMethod: string;
    realTimeUpdates: boolean;
  }) {
    let existingSettings = await this.settingsRepository.findOne({
      where: {},
    });

    if (!existingSettings) {
      existingSettings = this.settingsRepository.create(settings);
    } else {
      Object.assign(existingSettings, settings);
    }

    return this.settingsRepository.save(existingSettings);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { GachaItem } from '../gacha/entities/gacha-item.entity';

interface InventorySettings {
  globalThreshold: string;
  notificationMethod: string;
  realTimeUpdates: boolean;
}

@Injectable()
export class InventoryManagementService {
  // Add default settings
  private defaultSettings: InventorySettings = {
    globalThreshold: "20",
    notificationMethod: "line",
    realTimeUpdates: true
  };

  constructor(
    @InjectRepository(GachaItem)
    private readonly gachaItemRepository: Repository<GachaItem>,
  ) {}

  async getInventorySettings() {
    // Implement your logic to get settings
    return {
      globalThreshold: "20",
      notificationMethod: "line",
      realTimeUpdates: true
    };
  }

  async updateInventorySettings(settings: InventorySettings) {
    // Implement your logic to update settings
    // For example, save to database or configuration file
    return settings;
  }

  async getInventory() {
    return this.gachaItemRepository.find({
      order: { stock: 'ASC' },
    });
  }

  async getLowStockItems(threshold: number): Promise<GachaItem[]> {
    if (threshold <= 0) {
      throw new NotFoundException('Invalid threshold value');
    }

    return this.gachaItemRepository.find({
      where: { stock: LessThanOrEqual(threshold) },
      order: { stock: 'ASC' },
    });
  }

  async updateStock(itemId: string, newStock: number) {
    const item = await this.gachaItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    item.stock = newStock;
    return this.gachaItemRepository.save(item);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GachaItem } from '../gacha/entities/gacha-item.entity';
import { InventorySettings } from './inventory-settings.entity';
import { Inventory } from './entities/inventory.entity';
import { LineService } from '../line/line.service';

@Injectable()
export class InventoryStatusService {
  constructor(
    @InjectRepository(GachaItem)
    private gachaItemRepository: Repository<GachaItem>,
    @InjectRepository(InventorySettings)
    private settingsRepository: Repository<InventorySettings>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private lineService: LineService,
  ) {}

  async getInventoryStatus() {
    const settings = await this.settingsRepository.findOne({
      where: {} // get the first record
    });
    const globalThreshold = settings?.globalThreshold || 10; // fallback to 10 if not set

    const items = await this.gachaItemRepository
      .createQueryBuilder('item')
      .select([
        'item.id',
        'item.name',
        'item.stock',
      ])
      .getRawMany();

    const totalQuantity = items.reduce((sum, item) => sum + item.item_stock, 0);

    return items.map(item => ({
      id: item.item_id,
      name: item.item_name,
      quantity: item.item_stock,
      percentage: (item.item_stock / totalQuantity) * 100,
      threshold: globalThreshold,
      status: item.item_stock < globalThreshold ? 'LOW' : 'NORMAL',
    }));
  }

  async updateThreshold(id: string, threshold: number) {
    await this.settingsRepository.update(id, { globalThreshold: threshold });
    const item = await this.gachaItemRepository.findOne({ where: { id } });
    
    return {
      ...item,
      status: item.stock < threshold ? 'LOW' : 'NORMAL',
      percentage: await this.calculatePercentage(item.stock),
    };
  }

  private async calculatePercentage(itemQuantity: number): Promise<number> {
    const totalQuantity = await this.gachaItemRepository
      .createQueryBuilder('item')
      .select('SUM(item.stock)', 'total')
      .getRawOne()
      .then(result => result.total);

    return (itemQuantity / totalQuantity) * 100;
  }

  async getInventoryShippingStatuses(
    page: number = 1, 
    limit: number = 10,
    statusFilter?: 'available' | 'shipping' | 'shipped',
    email?: string
  ) {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.item', 'gachaItem')
      .leftJoinAndSelect('inventory.user', 'user')
      .select([
        'inventory.id',
        'gachaItem.name',
        'inventory.status',
        'inventory.acquiredAt',
        'inventory.updatedAt',
        'user.email'
      ])
      .where('inventory.status IN (:...statuses)', {
        statuses: statusFilter ? [statusFilter] : ['available', 'shipping', 'shipped']
      });

    // Add email filter if provided
    if (email) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${email}%` });
    }

    query.orderBy('inventory.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const total = await query.getCount();
    const { entities } = await query.getRawAndEntities();

    const items = entities.map(item => ({
      id: item.id,
      itemName: item.item?.name || '',
      currentStatus: item.status,
      obtainedAt: item.acquiredAt,
      updatedAt: item.updatedAt,
      userEmail: item.user?.email || 'N/A'
    }));

    return {
      items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
  }

  async updateStatus(id: string, status: 'available' | 'exchanged' | 'locked' | 'shipping' | 'shipped') {
    // First get the inventory item with user and item details
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['user', 'item']
    });

    if (!inventory) {
      throw new Error('Inventory item not found');
    }

    // Update the status
    await this.inventoryRepository.update(id, {
      status: status,
      updatedAt: new Date()
    });

    // Get LINE settings for the user
    const lineSettings = await this.lineService.getSettings(inventory.user.id);

    // Send notification to user if they have LINE connected
    if ('lineUserId' in lineSettings && lineSettings.isConnected && lineSettings.notifications && lineSettings.lineUserId) {
      try {
        let messageText = '';
        switch (status) {
          case 'shipping':
            messageText = `発送手続きを開始しました！\n\n商品名: ${inventory.item.name}\nステータス: 発送手続き中`;
            break;
          case 'shipped':
            messageText = `商品が発送されました！\n\n商品名: ${inventory.item.name}\nステータス: 発送完了`;
            break;
          default:
            messageText = `商品のステータスが更新されました\n\n商品名: ${inventory.item.name}\nステータス: ${status}`;
        }

        await this.lineService.sendMessage(lineSettings.lineUserId, {
          text: messageText
        });
      } catch (error) {
        console.error('Failed to send LINE notification:', error);
      }
    }

    return { success: true };
  }
}

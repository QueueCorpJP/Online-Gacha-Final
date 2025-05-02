import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Inventory } from './entities/inventory.entity';
import { RarityType } from '../gacha/entities/gacha-item.entity';
import { User } from '../user/entities/user.entity';
import { CoinTransaction } from '../coin/entities/coin-transaction.entity';
import { LineService } from '../line/line.service';
import { UserRole } from '../../common/enums/user-roles.enum';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
    private lineService: LineService,
    private configService: ConfigService,
  ) {}

  async getUserInventory(userId: string, filter: string) {
    const query = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.item', 'gachaItem')
      .select([
        'item.id',
        'item.status',
        'item.acquiredAt',
        'gachaItem.rarity',
        'gachaItem.name',
        'gachaItem.imageUrl'
      ])
      .where('item.userId = :userId', { userId });

    if (filter === 'A') {
      query.andWhere('gachaItem.rarity IN (:...rarities)', {
        rarities: [RarityType.A]
      });
    } else if (filter === 'B') {
      query.andWhere('gachaItem.rarity IN (:...rarities)', {
        rarities: [RarityType.B]
      });
    } else if (filter === 'C') {
      query.andWhere('gachaItem.rarity IN (:...rarities)', {
        rarities: [RarityType.C]
      });
    } else if (filter === 'D') {
      query.andWhere('gachaItem.rarity IN (:...rarities)', {
        rarities: [RarityType.D]
      });
    } else if (filter === 'S') {
      query.andWhere('gachaItem.rarity IN (:...rarities)', {
        rarities: [RarityType.S]
      });
    }
    

    const items = await query.getMany();

    return items.map(item => ({
      id: item.id,
      name: item.item?.name || 'Unknown Item',
      rarity: item.item?.rarity,
      imageUrl: item.item?.imageUrl || null,
      obtainedAt: item.acquiredAt,
      status: item.status
    }));
  }

  async exchangeForPoints(userId: string, itemId: string) {
    const item = await this.inventoryRepository.findOne({
      where: { id: itemId, userId: userId },
      relations: ['item', 'item.gacha'] // Add relations to access gacha item and gacha details
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.status !== 'available') {
      throw new NotFoundException('Item is not available for exchange');
    }

    // Calculate coins to add
    const basePoints = item.item.gacha.price * (item.item.probability / 100);
    const totalCoins = Math.round(basePoints * item.item.exchangeRate);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user's coin balance
    user.coinBalance += totalCoins;
    await this.userRepository.save(user);

    // Create coin transaction record
    const transaction = this.coinTransactionRepository.create({
      user,
      type: 'earning',
      amount: totalCoins,
      metadata: JSON.stringify({
        source: 'item_exchange',
        itemId: itemId,
        itemName: item.item.name,
        gachaId: item.item.gacha.id,
        gachaName: item.item.gacha.translations.en.name || 'Unknown Gacha',
        rarity: item.item.rarity
      }),
      description: `Exchanged ${item.item.name} (${item.item.rarity}) from gacha`
    });
    await this.coinTransactionRepository.save(transaction);

    // Mark item as exchanged
    item.status = 'exchanged';
    await this.inventoryRepository.save(item);

    return {
      exchangedItem: item,
      coinsAdded: totalCoins,
      newStatus: 'exchanged',
      transaction: {
        id: transaction.id,
        amount: totalCoins,
        type: 'earning',
        createdAt: transaction.createdAt
      }
    };
  }

  async createShippingRequest(itemId: string, userId: string) {
    const item = await this.inventoryRepository.findOne({
      where: { 
        id: itemId, 
        userId: userId,
        status: 'available'
      },
      relations: ['item', 'user'] // Add user relation to get user details
    });

    if (!item) {
      throw new NotFoundException('Item not found or not available for shipping');
    }

    // Lock the item while shipping is in progress
    item.status = 'shipping';
    
    // Save the updated status
    const updatedItem = await this.inventoryRepository.save(item);

    // Get LINE settings for the user
    const lineSettings = await this.lineService.getSettings(userId);
    
    // Get admin users and their LINE settings
    const adminUsers = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.lineSettings', 'lineSettings')
      .where(':role = ANY(user.roles)', { role: UserRole.ADMIN })  // or UserRole.ADMIN if using enum
      .getMany();

    const adminLineUserIds = adminUsers
      .filter(admin => admin.lineSettings?.isConnected && admin.lineSettings?.lineUserId)
      .map(admin => admin.lineSettings.lineUserId);

    console.log(lineSettings);
    // Send notification to user if they have LINE connected
    if (lineSettings?.isConnected && 
        lineSettings?.notifications && 
        'lineUserId' in lineSettings && 
        lineSettings.lineUserId) {
      try {
        await this.lineService.sendMessage(lineSettings.lineUserId, {
          text: `発送リクエストを受け付けました！\n\n商品名: ${item.item.name}\nステータス: 発送手続き中\n\n発送完了時にお知らせいたします。`
        });
        console.log("sent message");
      } catch (error) {
        console.error('Failed to send LINE notification to user:', error);
      }
    }

    // Send notification to all admins
    for (const adminLineUserId of adminLineUserIds) {
      try {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        await this.lineService.sendMessage(adminLineUserId, {
          text: `新しい発送リクエストが届きました！\n\n` +
                `ユーザー: ${user?.email || userId}\n` +
                `商品名: ${item.item.name}\n` +
                `商品ID: ${itemId}\n` +
                `ステータス: 発送手続き中`
        });
      } catch (error) {
        console.error(`Failed to send LINE notification to admin (${adminLineUserId}):`, error);
      }
    }

    return {
      id: updatedItem.id,
      status: updatedItem.status,
      message: 'Shipping request created successfully'
    };
  }
}



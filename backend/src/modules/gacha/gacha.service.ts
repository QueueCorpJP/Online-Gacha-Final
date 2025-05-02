import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, Brackets, DataSource, In } from 'typeorm';
import { Gacha } from './entities/gacha.entity';
import { GachaItem, RarityType } from './entities/gacha-item.entity';
import { CreateGachaDto } from './dto/gacha.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
import { GachaPullHistory } from './entities/gacha-pull-history.entity';
import { Favorite } from './entities/favorite.entity';
@Injectable()
export class GachaService {
  private readonly RARITY_LEVELS = ['D', 'C', 'B', 'A', 'S'];

  constructor(
    @InjectRepository(Gacha)
    private gachaRepository: Repository<Gacha>,
    @InjectRepository(GachaItem)
    private gachaItemRepository: Repository<GachaItem>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(GachaPullHistory)
    private pullHistoryRepository: Repository<GachaPullHistory>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private dataSource: DataSource,
  ) {}

  async getGachaById(id: string): Promise<Gacha> {
    const gacha = await this.gachaRepository.findOne({
      where: { id },
      relations: ['items', 'category'], // Added 'category' to relations
    });

    if (!gacha) {
      throw new NotFoundException(`Gacha with ID ${id} not found`);
    }

    return gacha;
  }

  async createGacha(createGachaDto: CreateGachaDto): Promise<Gacha> {
    const gacha = this.gachaRepository.create({
      translations: createGachaDto.translations,
      type: createGachaDto.type,
      price: createGachaDto.price,
      period: createGachaDto.period,
      dailyLimit: createGachaDto.dailyLimit,
      thumbnail: createGachaDto.thumbnailUrl,
      category: { id: createGachaDto.category } as any, // Fix category relation
      isActive: createGachaDto.isActive ?? true,
      lastOnePrizeId: createGachaDto.lastOnePrize?.id
    } as DeepPartial<Gacha>);

    const savedGacha = await this.gachaRepository.save(gacha);

    // Create gacha items
    const gachaItems = createGachaDto.items.map(item => {
      const newItem = this.gachaItemRepository.create({
        name: item.name,
        rarity: RarityType[item.rarity as keyof typeof RarityType],
        probability: item.probability,
        stock: item.stock,
        exchangeRate: item.exchangeRate || 1.00,
        imageUrl: item.imageUrl,
        gacha: savedGacha
      });

      return newItem;
    });

    // Save all gacha items
    await this.gachaItemRepository.save(gachaItems);

    // Return the gacha with its items
    return this.gachaRepository.findOne({
      where: { id: savedGacha.id },
      relations: ['items'],
    });
  }

  async updateGacha(
    id: string,
    updateGachaDto: CreateGachaDto,
    thumbnailFilename?: string,
    itemImages?: Express.Multer.File[]
  ): Promise<Gacha> {
    const gacha = await this.gachaRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!gacha) {
      throw new Error('Gacha not found');
    }

    // Update gacha entity
    Object.assign(gacha, {
      translations: updateGachaDto.translations,
      type: updateGachaDto.type,
      price: updateGachaDto.price,
      period: updateGachaDto.period,
      dailyLimit: updateGachaDto.dailyLimit,
      thumbnail: updateGachaDto.thumbnailUrl || gacha.thumbnail,
      category: { id: updateGachaDto.category },
      isActive: updateGachaDto.isActive,
      lastOnePrizeId: updateGachaDto.lastOnePrize?.id
    });

    await this.gachaRepository.save(gacha);

    // Create a Map of uploaded images
    const uploadedImages = new Map<number, Express.Multer.File>();
    itemImages?.forEach((file, index) => {
      uploadedImages.set(index, file);
    });

    const updatedItemIds = new Set<string>();

    // Update gacha items
    const gachaItems = await Promise.all(updateGachaDto.items.map(async item => {
      const existingItem = gacha.items.find(i => i.id === item.id);


      if (existingItem) {
        Object.assign(existingItem, {
          name: item.name,
          rarity: item.rarity,
          probability: item.probability,
          stock: item.stock,
          exchangeRate: item.exchangeRate || existingItem.exchangeRate,
          imageUrl: item.hasNewImage && typeof item.imageIndex === 'number'
            ? `/uploads/gacha/${uploadedImages.get(item.imageIndex)?.filename}`
            : existingItem.imageUrl,
          isLastOnePrize: item.id === gacha.lastOnePrizeId
        });

        updatedItemIds.add(existingItem.id);
        return existingItem;
      } else {
        const newItem = this.gachaItemRepository.create({
          name: item.name,
          rarity: RarityType[item.rarity as keyof typeof RarityType],
          probability: item.probability,
          stock: item.stock,
          gacha: gacha,
          imageUrl: item.hasNewImage && typeof item.imageIndex === 'number'
            ? `/uploads/gacha/${uploadedImages.get(item.imageIndex)?.filename}`
            : undefined,
          isLastOnePrize: item.id === gacha.lastOnePrizeId
        } as DeepPartial<GachaItem>);

        const savedItem = await this.gachaItemRepository.save(newItem);
        updatedItemIds.add(savedItem.id);
        return newItem;
      }

      // After the map operation, delete items that weren't updated
     
    }));

    const itemsToDelete = gacha.items.filter(item => !updatedItemIds.has(item.id));
      if (itemsToDelete.length > 0) {
        try {
          // Update inventory status to 'locked' for these items
          await this.dataSource.createQueryBuilder()
            .update('inventory')
            .set({ status: 'locked' })
            .where('itemId IN (:...itemIds)', { itemIds: itemsToDelete.map(item => item.id) })
            .execute();

          // Then soft delete the gacha items
          await this.gachaItemRepository.update(
            itemsToDelete.map(item => item.id),
            { deletedAt: new Date() }
          );
        } catch (error) {
          throw new BadRequestException(
            'Failed to update gacha items status. Please try again later.'
          );
        }
      }

    // Save all items
    await this.gachaItemRepository.save(gachaItems);

    // Return updated gacha with items
    return this.gachaRepository.findOne({
      where: { id: gacha.id },
      relations: ['items'],
    });
  }

  async getGachasAll({ 
    page = 1, 
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  }) {
    const queryBuilder = this.gachaRepository
      .createQueryBuilder('gacha')
      .leftJoinAndSelect('gacha.items', 'items')
      .leftJoinAndSelect('gacha.category', 'category');


    // Only filter by isActive if not admin
    const total = await queryBuilder.getCount();

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('gacha.createdAt', 'DESC')
      .getMany();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
  }

  async getGachas(filters?: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    ratings?: number[];
    sortBy?: string;
    filter?: string;
    isAdmin?: boolean;
  }): Promise<Gacha[]> {
    const queryBuilder = this.gachaRepository
      .createQueryBuilder('gacha')
      .leftJoinAndSelect('gacha.items', 'items')
      .leftJoinAndSelect('gacha.category', 'category');


    // Only filter by isActive if not admin
    if (!filters?.isAdmin) {
      queryBuilder.where('gacha.isActive = :isActive', { isActive: true });

      // Add period filter for non-admin users
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('gacha.period IS NULL') // Include gachas with no period (permanent)
            .orWhere(
              'EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM gacha.createdAt) <= gacha.period * 86400'
            );
        })
      );
    }

    if (filters) {
      if (filters.categories?.length) {
        queryBuilder.andWhere('category.id IN (:...categories)', {
          categories: filters.categories,
        });
      }

      if (filters.minPrice !== undefined) {
        queryBuilder.andWhere('gacha.price >= :minPrice', {
          minPrice: filters.minPrice,
        });
      }

      if (filters.maxPrice !== undefined) {
        queryBuilder.andWhere('gacha.price <= :maxPrice', {
          maxPrice: filters.maxPrice,
        });
      }

      if (filters.ratings?.length) {
        queryBuilder.andWhere('gacha.rating IN (:...ratings)', {
          ratings: filters.ratings,
        });
      }

      switch (filters.filter) {
        case 'limited':
          queryBuilder
            .andWhere('gacha.type = :type', { type: 'limited' })
            .andWhere('gacha.period IS NOT NULL')
            .orderBy('gacha.period', 'ASC');
          break;
        
        case 'special':
          queryBuilder
            .andWhere('gacha.type = :type', { type: 'special' });
          break;
          
        case 'normal':
          queryBuilder
            .andWhere('gacha.type = :type', { type: 'normal' });
          break;
      }

      switch (filters.sortBy) {
        case 'price:asc':
          queryBuilder.orderBy('gacha.price', 'ASC');
          break;
        case 'price:desc':
          queryBuilder.orderBy('gacha.price', 'DESC');
          break;
        case 'rating':
          queryBuilder.orderBy('gacha.rating', 'DESC');
          break;
        case 'popularity':
          queryBuilder.orderBy('gacha.likes', 'DESC');
          break;
        default:
          queryBuilder.orderBy('gacha.createdAt', 'DESC');
      }
    }

    return queryBuilder.orderBy('gacha.createdAt', 'DESC').getMany();
  }

  async pullItems(gachaId: string, times: number, userId: string): Promise<GachaItem[]> {
    const gacha = await this.gachaRepository.findOne({
      where: { id: gachaId },
      relations: ['items', 'lastOnePrize'],
    });

    if (!gacha) {
      throw new NotFoundException('Gacha not found');
    }

    const pityThreshold = gacha.pityThreshold;
    let pullHistory = await this.pullHistoryRepository.findOne({
      where: { userId, gachaId }
    });

    if (!pullHistory) {
      pullHistory = this.pullHistoryRepository.create({
        userId,
        gachaId,
        pullCount: 0,
        pullsSinceLastRare: 0
      });
    }

    const items: GachaItem[] = [];
    let availableItems = gacha.items.filter(item => item.stock === null || item.stock > 0);

    // Check for last one prize
    const totalRemainingStock = availableItems.reduce((sum, item) => {
      return sum + (item.stock === null ? Infinity : item.stock);
    }, 0);

    if (gacha.lastOnePrize && totalRemainingStock === 1) {
      const lastItem = availableItems[0];
      if (lastItem.stock) {
        lastItem.stock -= 1;
        await this.gachaItemRepository.save(lastItem);
      }
      return [{ ...lastItem, ...gacha.lastOnePrize }];
    }

    // Group items by rarity
    const itemsByRarity = availableItems.reduce((acc, item) => {
      if (!acc[item.rarity]) {
        acc[item.rarity] = [];
      }
      acc[item.rarity].push(item);
      return acc;
    }, {});

    for (let i = 0; i < times; i++) {
      // Refresh available items for each pull
      availableItems = gacha.items.filter(item => item.stock === null || item.stock > 0);
      
      if (availableItems.length === 0) {
        break; // Stop if no more items available
      }

      pullHistory.pullCount++;
      pullHistory.pullsSinceLastRare++;

      let selectedItem: GachaItem | null = null;

      // Check if pity system should activate
      if (pullHistory.pullsSinceLastRare >= pityThreshold) {
        // Get the index of the current rarity level
        const currentRarityIndex = this.RARITY_LEVELS.indexOf('D'); // Start from lowest rarity 'D'
        // Calculate how many rarity levels we can increase based on pull count
        const rarityIncrease = Math.floor(pullHistory.pullsSinceLastRare / pityThreshold);
        // Limit the maximum rarity based on pull count
        const maximumRarityIndex = Math.max(0, this.RARITY_LEVELS.length - 1 - rarityIncrease);
        
        // Calculate the minimum rarity index based on current rarity and maximum rarity
        const minimumRarityIndex = Math.min(
          currentRarityIndex - rarityIncrease,
          maximumRarityIndex
        );
        
        // Get available rarities from current level up to the calculated maximum
        const availableRarities = this.RARITY_LEVELS
          .slice(minimumRarityIndex, maximumRarityIndex + 1)
          .filter(rarity => itemsByRarity[rarity]?.some(item => item.stock === null || item.stock > 0));

        if (availableRarities.length > 0) {
          // Sort rarities to prefer higher ones (lower letters)
          const sortedRarities = [...availableRarities].sort();
          const rarity = sortedRarities[0]; // Get the highest available rarity
          const rareItems = itemsByRarity[rarity].filter(item => item.stock === null || item.stock > 0);
          
          if (rareItems.length > 0) {
            let rand = Math.random();
            let currentSum = 0;
            
            const shuffledRareItems = [...rareItems];
            
            for (const item of shuffledRareItems) {
              currentSum += item.probability;
              if (rand <= currentSum) {
                selectedItem = { ...item };
                pullHistory.pullsSinceLastRare = 0;
                break;
              }
            }
          }
        }
      }

      // If no pity item selected, do normal probability roll
      if (!selectedItem && availableItems.length > 0) {
        // Calculate total probability of all available items
        const totalProb = availableItems.reduce((sum, item) => sum + item.probability, 0);
        
        // Generate random number between 0 and total probability
        const rand = Math.random() * totalProb;
        
        // Use cumulative probability to select an item (D > C)
        let cumulativeProb = 0;
        for (const item of availableItems) {
          cumulativeProb += item.probability;
          if (rand <= cumulativeProb) {
            selectedItem = { ...item };
            // Reset pity counter if we get a higher rarity item (D > C)
            if (this.RARITY_LEVELS.indexOf(item.rarity) < this.RARITY_LEVELS.indexOf('D')) {
              pullHistory.pullsSinceLastRare = 0;
            }
            break;
          }
        }
      }

      if (selectedItem) {
        // Find original item to update stock
        const originalItem = availableItems.find(item => item.id === selectedItem.id);
        if (originalItem && originalItem.stock !== null) {
          originalItem.stock -= 1;
          await this.gachaItemRepository.save(originalItem);
          
          // Update itemsByRarity
          const rarityArray = itemsByRarity[originalItem.rarity];
          const itemIndex = rarityArray.findIndex(item => item.id === originalItem.id);
          if (itemIndex !== -1) {
            rarityArray[itemIndex] = originalItem;
          }
        }
        
        items.push(selectedItem);
      }
    }

    await this.pullHistoryRepository.save(pullHistory);

    // Before returning items, check if we need to fill with lowest rarity items
    if (items.length < times) {
      const remainingPulls = times - items.length;
      
      // Get lowest rarity level
      const lowestRarity = this.RARITY_LEVELS[0]; // Assuming RARITY_LEVELS is sorted from lowest to highest
      
      // Get all available items of lowest rarity
      const lowestRarityItems = gacha.items.filter(item => 
        item.rarity === lowestRarity && 
        (item.stock === null || item.stock > 0)
      );

      for (let i = 0; i < remainingPulls && lowestRarityItems.length > 0; i++) {
        // Randomly select an item from lowest rarity
        const randomIndex = Math.floor(Math.random() * lowestRarityItems.length);
        const selectedItem = { ...lowestRarityItems[randomIndex] };
        
        // Update stock if needed
        if (lowestRarityItems[randomIndex].stock !== null) {
          lowestRarityItems[randomIndex].stock -= 1;
          await this.gachaItemRepository.save(lowestRarityItems[randomIndex]);
          
          // Remove item from available pool if stock reaches 0
          if (lowestRarityItems[randomIndex].stock === 0) {
            lowestRarityItems.splice(randomIndex, 1);
          }
        }
        
        items.push(selectedItem);
      }
    }

    return items;
  }

  async recordPulls(gachaId: string, userId: string, items: GachaItem[]): Promise<void> {
    // Create a new inventory record for each pulled item
    const inventoryItems = items.map(item => ({
      userId,
      itemId: item.id,
      status: 'available' as 'available' | 'exchanged' | 'locked',
      isTraded: false
    }));

    // Save to inventory
    await this.inventoryRepository.save(inventoryItems as DeepPartial<Inventory>[]);

    // Update item stock if necessary
    for (const item of items) {
      if (item.stock !== null && item.stock !== undefined) {
        item.stock -= 1;
        await this.gachaItemRepository.save(item);
      }
    }
  }

  async getFavoriteStatus(gachaId: string, userId: string): Promise<{ 
    favorited: boolean; 
    disliked: boolean;
    likes: number;
    dislikes: number;
  }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { gachaId, userId }
    });

    const gacha = await this.gachaRepository.findOne({
      where: { id: gachaId }
    });

    if (!gacha) {
      throw new NotFoundException(`Gacha with ID ${gachaId} not found`);
    }

    return {
      favorited: favorite ? favorite.type === 'like' : false,
      disliked: favorite ? favorite.type === 'dislike' : false,
      likes: gacha.likes || 0,
      dislikes: gacha.dislikes || 0
    };
  }

  async toggleReaction(gachaId: string, userId: string, type: 'like' | 'dislike'): Promise<{ 
    favorited: boolean;
    disliked: boolean;
    likes: number;
    dislikes: number;
  }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { gachaId, userId }
    });

    const gacha = await this.gachaRepository.findOne({
      where: { id: gachaId }
    });

    if (!gacha) {
      throw new NotFoundException(`Gacha with ID ${gachaId} not found`);
    }

    if (favorite) {
      console.log("favorite", favorite);
      if (favorite.type === type) {
        // Remove reaction if clicking the same button
        await this.favoriteRepository.remove(favorite);
        if (type === 'like') {
          await this.gachaRepository.decrement({ id: gachaId }, 'likes', 1);
        } else {
          await this.gachaRepository.decrement({ id: gachaId }, 'dislikes', 1);
        }
        return { 
          favorited: false, 
          disliked: false,
          likes: gacha.likes + (type === 'like' ? -1 : 0),
          dislikes: gacha.dislikes + (type === 'dislike' ? -1 : 0)
        };
      } else {
        // Switch reaction type
        favorite.type = type;
        await this.favoriteRepository.save(favorite);
        if (type === 'like') {
          await this.gachaRepository.increment({ id: gachaId }, 'likes', 1);
          await this.gachaRepository.decrement({ id: gachaId }, 'dislikes', 1);
        } else {
          await this.gachaRepository.decrement({ id: gachaId }, 'likes', 1);
          await this.gachaRepository.increment({ id: gachaId }, 'dislikes', 1);
        }
        return { 
          favorited: type === 'like', 
          disliked: type === 'dislike',
          likes: gacha.likes + (type === 'like' ? 1 : -1),
          dislikes: gacha.dislikes + (type === 'dislike' ? 1 : -1)
        };
      }
    } else {
      // Create new reaction
      const newFavorite = this.favoriteRepository.create({ 
        gachaId, 
        userId, 
        type 
      });
      await this.favoriteRepository.save(newFavorite);
      if (type === 'like') {
        await this.gachaRepository.increment({ id: gachaId }, 'likes', 1);
      } else {
        await this.gachaRepository.increment({ id: gachaId }, 'dislikes', 1);
      }
      return { 
        favorited: type === 'like', 
        disliked: type === 'dislike',
        likes: gacha.likes + (type === 'like' ? 1 : 0),
        dislikes: gacha.dislikes + (type === 'dislike' ? 1 : 0)
      };
    }
  }

  async toggleFavorite(gachaId: string, userId: string, type: 'like' | 'dislike'): Promise<{ favorited: boolean }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { gachaId, userId }
    });

    if (favorite) {
      favorite.type = type;
      await this.favoriteRepository.save(favorite);
      return { favorited: false };
      // if (type === 'like') {
      //   await this.gachaRepository.increment({ id: gachaId }, 'likes', 1);
      //   await this.gachaRepository.decrement({ id: gachaId }, 'dislikes', 1);
      //   return { favorited: true };
      // } else {
      //   await this.gachaRepository.decrement({ id: gachaId }, 'likes', 1);
      //   await this.gachaRepository.increment({ id: gachaId }, 'dislikes', 1);
      //   
      // }
    } else {
      const newFavorite = this.favoriteRepository.create({ gachaId, userId, type });
      await this.favoriteRepository.save(newFavorite);
      // if (type === 'like') {
      //   await this.gachaRepository.increment({ id: gachaId }, 'likes', 1);
      // } else {
      //   await this.gachaRepository.increment({ id: gachaId }, 'dislikes', 1);
      // }
      return { favorited: type === 'like' };
    }
  }

  async deleteGacha(id: string) {
    const gacha = await this.gachaRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!gacha) {
      throw new NotFoundException('Gacha not found');
    }

    // Start a transaction to ensure all operations succeed or fail together
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete all related records in the correct order to avoid FK constraint violations
      
      // 1. Delete favorites related to this gacha
      await queryRunner.manager.delete('favorites', { gachaId: id });
      
      // 2. Delete pull history related to this gacha
      await queryRunner.manager.delete('gacha_pull_history', { gachaId: id });
      
      // 3. Handle inventory and gacha items
      if (gacha.items && gacha.items.length > 0) {
        // Delete inventory records referencing these items
        await queryRunner.manager.delete('inventory', {
          itemId: In(gacha.items.map(item => item.id))
        });
        
        // Delete all gacha items
        for (const item of gacha.items) {
          await queryRunner.manager.remove(item);
        }
      }

      // 4. Finally delete the gacha itself
      await queryRunner.manager.remove(gacha);

      // Commit the transaction
      await queryRunner.commitTransaction();
      
      return { success: true, message: 'Gacha deleted successfully' };
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      
      console.error('Error deleting gacha:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(
        'Failed to delete gacha: ' + (error.message || 'Unknown error')
      );
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}

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
      lastOnePrizeId: createGachaDto.lastOnePrize?.id,
      rating: 0, // 初期評価値を0に設定
      likes: 0,
      dislikes: 0,
      reviews: 0
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
        // 最低の評価基準を取得（例：[3,4,5] なら 3 = 3.0以上を表示）
        const minRating = Math.min(...filters.ratings);
        console.log('Applying rating filter:', { originalRatings: filters.ratings, minRating });
        
        if (minRating <= 0) {
          // 0以下の場合は全てのガチャを表示（フィルターなし）
          console.log('Rating filter: showing all gachas (minRating <= 0)');
          // フィルター条件を追加しない
        } else {
          console.log('Rating filter: applying WHERE gacha.rating >=', minRating);
          queryBuilder.andWhere('gacha.rating >= :minRating', {
            minRating: minRating,
          });
        }
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
        case 'createdAt:desc':
        case 'newest':
          queryBuilder.orderBy('gacha.createdAt', 'DESC');
          break;
        case 'createdAt:asc':
          queryBuilder.orderBy('gacha.createdAt', 'ASC');
          break;
        case 'rating':
        case 'rating-desc':
          queryBuilder.orderBy('gacha.rating', 'DESC');
          break;
        case 'popularity':
        case 'recommended':
          queryBuilder.orderBy('gacha.likes', 'DESC');
          break;
        default:
          // デフォルトは人気順（いいね数順）
          queryBuilder.orderBy('gacha.likes', 'DESC');
      }
    } else {
      // フィルターが指定されていない場合も人気順
      queryBuilder.orderBy('gacha.likes', 'DESC');
    }

    return queryBuilder.getMany();
  }

  async pullItems(gachaId: string, times: number, userId: string): Promise<GachaItem[]> {
    console.log(`[pullItems] gachaId=${gachaId}, times=${times}, userId=${userId}`);
    const gacha = await this.gachaRepository.findOne({
      where: { id: gachaId },
      relations: ['items', 'lastOnePrize'],
    });

    if (!gacha) {
      console.error(`[pullItems] Gacha not found: ${gachaId}`);
      throw new NotFoundException('Gacha not found');
    }

    if (!gacha.items || gacha.items.length === 0) {
      console.error(`[pullItems] Gacha items not found or empty: gachaId=${gachaId}`);
      throw new NotFoundException('Gacha items not found');
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
    console.log(`[pullItems] availableItems:`, availableItems.map(i => ({id: i.id, rarity: i.rarity, prob: i.probability, stock: i.stock})));

    if (availableItems.length === 0) {
      console.error(`[pullItems] No available items for gachaId=${gachaId}`);
      throw new BadRequestException('No available items');
    }

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
      console.log(`[pullItems] lastOnePrize triggered, item:`, lastItem);
      return [{ ...lastItem, ...gacha.lastOnePrize }];
    }

    // Group items by rarity
    const itemsByRarity = availableItems.reduce((acc, item) => {
      if (!acc[item.rarity]) {
        acc[item.rarity] = [];
      }
      acc[item.rarity].push(item);
      return acc;
    }, {} as Record<string, GachaItem[]>);

    for (let i = 0; i < times; i++) {
      availableItems = gacha.items.filter(item => item.stock === null || item.stock > 0);
      if (availableItems.length === 0) {
        console.warn(`[pullItems] No more available items at draw ${i}, gachaId=${gachaId}`);
        break;
      }
      pullHistory.pullCount++;
      pullHistory.pullsSinceLastRare++;
      let selectedItem: GachaItem | null = null;
      // pity発動
      if (pityThreshold && pullHistory.pullsSinceLastRare >= pityThreshold) {
        const currentRarityIndex = this.RARITY_LEVELS.indexOf('D');
        const rarityIncrease = Math.floor(pullHistory.pullsSinceLastRare / pityThreshold);
        const maximumRarityIndex = Math.max(0, this.RARITY_LEVELS.length - 1 - rarityIncrease);
        const minimumRarityIndex = Math.min(currentRarityIndex - rarityIncrease, maximumRarityIndex);
        const availableRarities = this.RARITY_LEVELS
          .slice(minimumRarityIndex, maximumRarityIndex + 1)
          .filter(rarity => itemsByRarity[rarity]?.some(item => item.stock === null || item.stock > 0));
        console.log(`[pullItems] pity check: pullsSinceLastRare=${pullHistory.pullsSinceLastRare}, availableRarities=`, availableRarities);
        if (availableRarities.length > 0) {
          const sortedRarities = [...availableRarities].sort();
          const rarity = sortedRarities[0];
          const rareItems = itemsByRarity[rarity].filter(item => item.stock === null || item.stock > 0);
          if (rareItems.length > 0) {
            let rand = Math.random() * rareItems.reduce((sum, item) => sum + Number(item.probability), 0);
            let currentSum = 0;
            const shuffledRareItems = [...rareItems];
            for (const item of shuffledRareItems) {
              currentSum += Number(item.probability);
              if (rand <= currentSum) {
                selectedItem = { ...item };
                pullHistory.pullsSinceLastRare = 0;
                console.log(`[pullItems] pity抽選: rarity=${rarity}, rand=${rand}, currentSum=${currentSum}, selectedItem=`, selectedItem);
                break;
              }
            }
          }
        }
      }
      // 通常確率抽選
      if (!selectedItem && availableItems.length > 0) {
        const totalProb = availableItems.reduce((sum, item) => sum + Number(item.probability), 0);
        const rand = Math.random() * totalProb;
        let cumulativeProb = 0;
        for (const item of availableItems) {
          cumulativeProb += Number(item.probability);
          if (rand <= cumulativeProb) {
            selectedItem = { ...item };
            if (this.RARITY_LEVELS.indexOf(item.rarity) < this.RARITY_LEVELS.indexOf('D')) {
              pullHistory.pullsSinceLastRare = 0;
            }
            console.log(`[pullItems] 通常抽選: rand=${rand}, cumulativeProb=${cumulativeProb}, selectedItem=`, selectedItem);
            break;
          }
        }
        if (!selectedItem) {
          console.warn(`[pullItems] selectedItemがnull: draw=${i}, gachaId=${gachaId}, availableItems=`, availableItems);
        }
      }
      if (selectedItem) {
        const originalItem = availableItems.find(item => item.id === selectedItem.id);
        if (originalItem && originalItem.stock !== null) {
          originalItem.stock -= 1;
          await this.gachaItemRepository.save(originalItem);
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
    // D埋め処理
    if (items.length < times) {
      const remainingPulls = times - items.length;
      const lowestRarity = this.RARITY_LEVELS[0];
      const lowestRarityItems = gacha.items.filter(item => 
        item.rarity === lowestRarity && 
        (item.stock === null || item.stock > 0)
      );
      console.warn(`[pullItems] D埋め処理: remainingPulls=${remainingPulls}, lowestRarityItems=`, lowestRarityItems.map(i => ({id: i.id, prob: i.probability, stock: i.stock})), `gachaId=${gachaId}`);
      for (let i = 0; i < remainingPulls && lowestRarityItems.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * lowestRarityItems.length);
        const selectedItem = { ...lowestRarityItems[randomIndex] };
        if (lowestRarityItems[randomIndex].stock !== null) {
          lowestRarityItems[randomIndex].stock -= 1;
          await this.gachaItemRepository.save(lowestRarityItems[randomIndex]);
          if (lowestRarityItems[randomIndex].stock === 0) {
            lowestRarityItems.splice(randomIndex, 1);
          }
        }
        items.push(selectedItem);
        console.log(`[pullItems] D埋め: i=${i}, selectedItem=`, selectedItem, `gachaId=${gachaId}`);
      }
    }
    console.log(`[pullItems] 結果: items=`, items.map(i => ({id: i.id, rarity: i.rarity, prob: i.probability, stock: i.stock})), `gachaId=${gachaId}`);
    return items;
  }

  // ユーザーのお気に入り・ディスライク状態を取得する
  async getFavoriteStatus(gachaId: string, userId: string) {
    const favorite = await this.favoriteRepository.findOne({ where: { gachaId, userId } });
    return {
      favorited: !!favorite && favorite.type === 'like',
      disliked: !!favorite && favorite.type === 'dislike',
    };
  }

  /**
   * ガチャを引いた履歴を保存する
   */
  async recordPulls(id: string, userId: string, items: any[]) {
    // pullHistoryRepositoryのpullCountをitems.length分インクリメント
    await this.pullHistoryRepository.increment(
      { userId, gachaId: id },
      'pullCount',
      items.length,
    );
    // 必要に応じて追加のロジック（pityリセット等）をここに
  }

  /**
   * イイね・バットのトグル処理
   */
  async toggleReaction(gachaId: string, userId: string, type: 'like' | 'dislike') {
    const gacha = await this.gachaRepository.findOne({ where: { id: gachaId } });
    if (!gacha) throw new NotFoundException('Gacha not found');

    let favorite = await this.favoriteRepository.findOne({ where: { gachaId, userId } });

    if (!favorite) {
      favorite = this.favoriteRepository.create({ gachaId, userId, type });
      await this.favoriteRepository.save(favorite);
    } else {
      // 既に同じリアクションなら削除（トグル動作）
      if (favorite.type === type) {
        await this.favoriteRepository.remove(favorite);
      } else {
        favorite.type = type;
        await this.favoriteRepository.save(favorite);
      }
    }

    // 最新のlike/dislike数を集計
    const likes = await this.favoriteRepository.count({ where: { gachaId, type: 'like' } });
    const dislikes = await this.favoriteRepository.count({ where: { gachaId, type: 'dislike' } });

    gacha.likes = likes;
    gacha.dislikes = dislikes;
    
    // rating を計算（likes + dislikes が合計反応数、likesの割合から5段階評価を計算）
    const totalReactions = likes + dislikes;
    if (totalReactions > 0) {
      const likeRatio = likes / totalReactions;
      gacha.rating = Math.round((likeRatio * 4 + 1) * 10) / 10; // 1.0-5.0の範囲で計算
    } else {
      gacha.rating = 0; // 反応がない場合は0
    }
    
    await this.gachaRepository.save(gacha);

    return {
      likes,
      dislikes,
      favorited: !!(await this.favoriteRepository.findOne({ where: { gachaId, userId, type: 'like' } })),
      disliked: !!(await this.favoriteRepository.findOne({ where: { gachaId, userId, type: 'dislike' } })),
    };
  }

  /**
   * 既存のガチャでratingがnullのものを0に初期化する
   */
  async initializeRatings() {
    // まず、likes/dislikesがあるガチャのratingを計算
    const gachasWithReactions = await this.gachaRepository.find({
      where: [
        { rating: null },
        { rating: 0 }
      ]
    });

    for (const gacha of gachasWithReactions) {
      const totalReactions = (gacha.likes || 0) + (gacha.dislikes || 0);
      if (totalReactions > 0) {
        const likeRatio = (gacha.likes || 0) / totalReactions;
        gacha.rating = Math.round((likeRatio * 4 + 1) * 10) / 10; // 1.0-5.0の範囲で計算
      } else {
        gacha.rating = 0; // 反応がない場合は0
      }
      
      // likes, dislikesがnullの場合は0で初期化
      if (gacha.likes === null) gacha.likes = 0;
      if (gacha.dislikes === null) gacha.dislikes = 0;
      if (gacha.reviews === null) gacha.reviews = 0;
    }

    // 一括更新
    await this.gachaRepository.save(gachasWithReactions);
    
    console.log(`Initialized ratings for ${gachasWithReactions.length} gachas`);
    gachasWithReactions.forEach(g => {
      console.log(`Gacha ${g.translations?.ja?.name}: likes=${g.likes}, dislikes=${g.dislikes}, rating=${g.rating}`);
    });
  }

  /**
   * ガチャを削除する
   */
  async deleteGacha(id: string): Promise<void> {
    const gacha = await this.gachaRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!gacha) {
      throw new NotFoundException(`Gacha with ID ${id} not found`);
    }

    // ガチャアイテムも削除
    if (gacha.items && gacha.items.length > 0) {
      await this.gachaItemRepository.remove(gacha.items);
    }

    // ガチャ自体を削除
    await this.gachaRepository.remove(gacha);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GachaService } from './gacha.service';
import { CreateGachaDto } from './dto/create-gacha.dto';
import { AuthGuard } from '../../common/auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User, User as UserEntity } from '../user/entities/user.entity';
import { CoinService } from '../coin/services/coin.service';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { RarityType } from './entities/gacha-item.entity';
import { CurrentUser } from 'src/common/current-user.decorator';

@Controller('admin/gacha')
export class GachaController {
  constructor(private readonly gachaService: GachaService, private readonly coinService: CoinService) {}

  @Get(':id')
  async getGachaById(
    @Param('id') id: string,
  ) {
    return this.gachaService.getGachaById(id);
  }


  @Get('/fetch/all')
  async getGachasAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user?: User, // Add this decorator to get the current user
  ) {
    // Process categories
   

    return this.gachaService.getGachasAll({
      page: Number(page),
      limit: Number(limit),
    });
  }
  
  @Get()
  async getGachas(
    @Query('categories') categories?: string | string[],
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('ratings') ratings?: string | string[],
    @Query('sortBy') sortBy?: string,
    @Query('filter') filter?: string,
    @CurrentUser() user?: User, // Add this decorator to get the current user
  ) {
    // Process categories
    const processedCategories = categories 
      ? Array.isArray(categories) 
        ? categories 
        : [categories]
      : undefined;

    // Process ratings
    const processedRatings = ratings
      ? Array.isArray(ratings)
        ? ratings.map(Number)
        : [Number(ratings)]
      : undefined;

    console.log(user);

    return this.gachaService.getGachas({
      categories: processedCategories,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      ratings: processedRatings,
      sortBy,
      filter,
      isAdmin: user?.roles?.includes(UserRole.ADMIN) 
    });
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'itemImages', maxCount: 50 },
    { name: 'lastOnePrizeImage', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: './uploads/gacha',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        const ext = extname(file.originalname).toLowerCase();
        const filename = `${randomName}${ext}`;
        return cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'itemImages' || file.fieldname === 'thumbnail' || file.fieldname === 'lastOnePrizeImage') {
        if (file.originalname === 'empty.png') {
          return cb(null, true);
        }
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024 // Increase from 10MB to 50MB
    }
  }))
  async createGacha(
    @Body('data') gachaData: string,
    @UploadedFiles() files: { 
      thumbnail?: Express.Multer.File[], 
      itemImages?: Express.Multer.File[],
      lastOnePrizeImage?: Express.Multer.File[]
    }
  ) {
    const parsedData: CreateGachaDto = JSON.parse(gachaData);
    const thumbnailUrl = files.thumbnail?.[0] ? `/uploads/gacha/${files.thumbnail[0].filename}` : undefined;
    const itemImageUrls = files.itemImages?.map(file => `/uploads/gacha/${file.filename}`);
    const lastOnePrizeImageUrl = files.lastOnePrizeImage?.[0] 
      ? `/uploads/gacha/${files.lastOnePrizeImage[0].filename}` 
      : undefined;

    return this.gachaService.createGacha(
      {
        translations: {
          ja: {
            name: parsedData.translations.ja.name,
            description: parsedData.translations.ja.description,
          },
          en: {
            name: parsedData.translations.en.name,
            description: parsedData.translations.en.description,
          },
          zh: {
            name: parsedData.translations.zh.name,
            description: parsedData.translations.zh.description,
          }
        },
        type: parsedData.type as 'normal' | 'limited' | 'special',
        thumbnailUrl,
        category: parsedData.categoryId,
        price: parsedData.price,
        period: parsedData.period,
        dailyLimit: parsedData.dailyLimit,
        isLimitless: parsedData.isLimitless,
        isOneTimeFreeEnabled: parsedData.isOneTimeFreeEnabled,
        isActive: parsedData.isActive,
        items: (parsedData.items || []).map((item, index) => ({
          ...item,
          imageUrl: itemImageUrls?.[index],
          rarity: item.rarity as RarityType,
          probability: Number(item.probability),
          hasNewImage: !!itemImageUrls?.[index],
          imageIndex: index,
          isLastOnePrize: item.id === parsedData.lastOnePrize?.id,
          exchangeRate: Number(item.exchangeRate), // Added exchangeRate with default value
        })),
        lastOnePrize: parsedData.lastOnePrize ? {
          ...parsedData.lastOnePrize,
          imageUrl: lastOnePrizeImageUrl
        } : undefined,
        pityThreshold: parsedData.pityThreshold
      }
    );
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'itemImages', maxCount: 50 },
    { name: 'lastOnePrizeImage', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: './uploads/gacha',
      filename: (req, file, cb) => {
        const randomName = Array(32)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        const ext = extname(file.originalname).toLowerCase();
        const filename = `${randomName}${ext}`;
        return cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'itemImages' || file.fieldname === 'thumbnail' || file.fieldname === 'lastOnePrizeImage') {
        if (file.originalname === 'empty.png') {
          return cb(null, true);
        }
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024 // Increase from 10MB to 50MB
    }
  }))
  async updateGacha(
    @Param('id') id: string,
    @Body('data') gachaData: string,
    @UploadedFiles() files: { 
      thumbnail?: Express.Multer.File[], 
      itemImages?: Express.Multer.File[],
      lastOnePrizeImage?: Express.Multer.File[]
    }
  ) {
    const parsedData: CreateGachaDto = JSON.parse(gachaData);
    const thumbnailUrl = files.thumbnail?.[0] ? `/uploads/gacha/${files.thumbnail[0].filename}` : undefined;
    const lastOnePrizeImageUrl = files.lastOnePrizeImage?.[0] 
      ? `/uploads/gacha/${files.lastOnePrizeImage[0].filename}` 
      : undefined;

    return this.gachaService.updateGacha(
      id,
      {
        translations: parsedData.translations,
        type: parsedData.type as 'normal' | 'limited' | 'special',
        thumbnailUrl,
        category: parsedData.categoryId,
        price: parsedData.price,
        period: parsedData.period,
        dailyLimit: parsedData.dailyLimit,
        isLimitless: parsedData.isLimitless,
        isOneTimeFreeEnabled: parsedData.isOneTimeFreeEnabled,
        isActive: parsedData.isActive,
        items: (parsedData.items || []).map(item => ({
          ...item,
          rarity: item.rarity as RarityType,
          probability: Number(item.probability),
          hasNewImage: item.hasNewImage,
          imageIndex: item.imageIndex,
          exchangeRate: item.exchangeRate,
          isLastOnePrize: item.id === parsedData.lastOnePrize?.id
        })),
        lastOnePrize: parsedData.lastOnePrize ? {
          ...parsedData.lastOnePrize,
          imageUrl: lastOnePrizeImageUrl
        } : undefined,
        pityThreshold: parsedData.pityThreshold
      },
      files.thumbnail?.[0]?.filename,
      files.itemImages
    );
  }

  @UseGuards(AuthGuard)
  @Post(':id/pull')
  @UseGuards(AuthGuard) // Add specific guard for this endpoint
  async pullGacha(
    @Param('id') id: string,
    @Body() pullDto: { times: number; isFree: boolean },
    @CurrentUser() user: UserEntity
  ) {
    if (!user) {
      throw new BadRequestException('User not authenticated');
    }

    // Check if user has enough balance if not free
    if (!pullDto.isFree) {
      const gacha = await this.gachaService.getGachaById(id);
      let totalCost = gacha.price * pullDto.times;
      if (pullDto.times == 10)
        totalCost = totalCost * 0.9;
      if (pullDto.times == 100)
        totalCost = totalCost * 0.8;
      
      if (user.coinBalance < totalCost) {
        throw new BadRequestException('Insufficient balance');
      }
      
      // Deduct coins
      await this.coinService.removeCoins(user.id, totalCost);
    }

    // Pull items based on probability
    const items = await this.gachaService.pullItems(id, pullDto.times, user.id);

    // Record the pulls in transaction history
    await this.gachaService.recordPulls(id, user.id, items);

    return { items };
  }

  @Get(':id/favorite')
  @UseGuards(AuthGuard)
  async getFavoriteStatus(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ) {
    const favorite = await this.gachaService.getFavoriteStatus(id, user.id);
    return { favorited: favorite };
  }

  @Post(':id/favorite')
  @UseGuards(AuthGuard)
  async toggleFavorite(
    @Param('id') id: string,
    @Body('type') type: "like" | "dislike",
    @CurrentUser() user: UserEntity
  ) {
    console.log(type);
    const favoriteStatus = await this.gachaService.getFavoriteStatus(id, user.id);
    return this.gachaService.toggleReaction(id, user.id, type);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteGacha(@Param('id') id: string) {
    return this.gachaService.deleteGacha(id);
  }
}

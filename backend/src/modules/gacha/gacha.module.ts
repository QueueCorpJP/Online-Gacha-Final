import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GachaController } from './gacha.controller';
import { GachaService } from './gacha.service';
import { Gacha } from './entities/gacha.entity';
import { GachaItem } from './entities/gacha-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { GachaPullHistory } from './entities/gacha-pull-history.entity';
import { Favorite } from './entities/favorite.entity';
import { AuthModule } from '../auth/auth.module';
import { CoinModule } from '../coin/coin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gacha, GachaItem, Inventory, GachaPullHistory, Favorite]),
    AuthModule,
    CoinModule,
  ],
  controllers: [GachaController],
  providers: [GachaService],
  exports: [GachaService],
})
export class GachaModule {}

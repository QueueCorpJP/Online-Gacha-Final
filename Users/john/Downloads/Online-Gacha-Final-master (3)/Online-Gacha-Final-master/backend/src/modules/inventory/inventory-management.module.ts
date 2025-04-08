import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LineModule } from '../line/line.module';
import { InventoryManagementService } from './inventory-management.service';
import { InventorySettings } from './inventory-settings.entity';
import { GachaItem } from '../gacha/entities/gacha-item.entity';
import { BlacklistedToken } from '../auth/entities/blacklisted-token.entity';
import { InventoryController } from './inventory.controller';
import { InventorySettingsController } from './inventory-settings.controller';
import { InventoryService } from './inventory.service';
import { InventorySettingsService } from './inventory-settings.service';
import { InventoryStatusService } from './inventory-status.service';
import { InventoryStatusController } from './inventory-status.controller';
import { Inventory } from './entities/inventory.entity';
import { User } from '../user/entities/user.entity';
import { CoinTransaction } from '../coin/entities/coin-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GachaItem, 
      InventorySettings, 
      BlacklistedToken,
      Inventory,
      User,
      CoinTransaction
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    LineModule,
  ],
  controllers: [
    InventoryController, 
    InventorySettingsController, 
    InventoryStatusController
  ],
  providers: [
    InventoryManagementService, 
    InventoryService, 
    InventorySettingsService, 
    InventoryStatusService
  ],
  exports: [InventoryManagementService],
})
export class InventoryManagementModule {}

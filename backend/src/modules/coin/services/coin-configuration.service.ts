import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CoinConfigurationService {
  private minCoinsForShipping = 0;

  configureSettings(minCoins: number) {
    if (minCoins < 0) {
      throw new BadRequestException('Minimum coins must be zero or greater');
    }

    this.minCoinsForShipping = minCoins;
    return { message: 'Configuration updated', minCoinsForShipping: this.minCoinsForShipping };
  }
}

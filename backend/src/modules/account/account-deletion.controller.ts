import { Controller, Delete, UseGuards } from '@nestjs/common';
import { AccountDeletionService } from './account-deletion.service';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('account')
@UseGuards(AuthGuard)
export class AccountDeletionController {
  constructor(private readonly accountDeletionService: AccountDeletionService) {}

  @Delete()
  async deleteAccount(@CurrentUser() user: User) {
    return this.accountDeletionService.deleteAccount(user.id);
  }
}

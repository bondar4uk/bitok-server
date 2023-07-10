import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtStrategy } from '../services/session/session.strategy';
import { MONGOOSE_MODULE_FEATURES } from '../constants/server';
import { DbmanagerService } from '../services/dbmanager/dbmanager.service';

@Module({
  imports: [MONGOOSE_MODULE_FEATURES],
  providers: [AccountService, JwtStrategy, DbmanagerService],
  controllers: [AccountController],
})
export class AccountModule {}

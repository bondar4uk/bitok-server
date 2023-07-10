import { Module } from '@nestjs/common';
import { ClientModule as BybitClientModule } from './bybit/client/client.module';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { DbmanagerService } from '../../services/dbmanager/dbmanager.service';
import { MONGOOSE_MODULE_FEATURES } from '../../constants/server';

@Module({
  imports: [BybitClientModule, MONGOOSE_MODULE_FEATURES],
  providers: [ExchangeService, DbmanagerService],
  controllers: [ExchangeController],
})
export class ExchangeModule {}

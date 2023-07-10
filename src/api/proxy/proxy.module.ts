import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import {
  MONGOOSE_MODULE_FEATURES,
  SERVER_PROVIDERS,
} from '../../constants/server';
import { ProxyService } from './proxy.service';

@Module({
  imports: [MONGOOSE_MODULE_FEATURES],
  providers: [ProxyService, ...SERVER_PROVIDERS],
  controllers: [ProxyController],
})
export class ProxyModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbmanagerModule } from './services/dbmanager/dbmanager.module';
import { AuthModule } from './auth/auth.module';
import { SessionService } from './services/session/session.service';
import { SessionModule } from './services/session/session.module';
import { KeyGeneratorService } from './services/key-generator/key-generator.service';
import { AccountModule } from './account/account.module';
import { ExchangeModule } from './api/exchange/exchange.module';
import { RequestDataManager } from './services/requestDataManager/requestDataManager';
import { SmtpModule } from './services/smtp/smtp.module';
import { ProxyModule } from './api/proxy/proxy.module';
import { ProxyManagerService } from './services/proxy-manager/proxy-manager.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DBBackupService } from './services/dbmanager/backup.service';
import { MONGOOSE_MODULE_FEATURES } from './constants/server';
import { ExchangeService } from './api/exchange/exchange.service';
import { DbmanagerService } from './services/dbmanager/dbmanager.service';
import { ProxyService } from './api/proxy/proxy.service';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    DbmanagerModule,
    AuthModule,
    SessionModule,
    AccountModule,
    ExchangeModule,
    SmtpModule,
    ProxyModule,
    MONGOOSE_MODULE_FEATURES,
  ],
  providers: [
    AppService,
    DBBackupService,
    SessionService,
    KeyGeneratorService,
    RequestDataManager,
    ProxyManagerService,
    ExchangeService,
    DbmanagerService,
    ProxyService,
  ],
})
export class AppModule {}

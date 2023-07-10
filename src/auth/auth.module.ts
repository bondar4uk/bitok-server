import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSchema } from '../models/user.model';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Models } from '../constants/models';
import { DbmanagerService } from '../services/dbmanager/dbmanager.service';
import { ExchangeHolderSchema } from '../models/exchange-holder.model';
import { Model } from 'mongoose';
import { LoggerService } from '../services/logger/logger.service';
import { OUTPUT_STREAM } from '../services/logger/logger.interface';
import { ProxyModelSchema } from '../models/proxy.model';
import { MONGOOSE_MODULE_FEATURES } from '../constants/server';
import { SmtpService } from '../services/smtp/smtp.service';

@Module({
  imports: [MONGOOSE_MODULE_FEATURES],
  controllers: [AuthController],
  providers: [
    AuthService,
    DbmanagerService,
    LoggerService,
    String,
    Object,
    Boolean,
    SmtpService,
  ],
})
export class AuthModule {}

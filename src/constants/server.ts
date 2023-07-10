import { MongooseModule } from '@nestjs/mongoose';
import { Models } from './models';
import { UserSchema } from '../models/user.model';
import { ExchangeHolderSchema } from '../models/exchange-holder.model';
import { ProxyModelSchema } from '../models/proxy.model';
import { DbmanagerService } from '../services/dbmanager/dbmanager.service';
import { FREQUENCIES } from '../modules/db_backup/types/interfaces';
import { LoggingModulesConfig } from '../services/logger/logger.interface';
import loggingModulesConfig from '../services/logger/modules.config.json';

export const MONGOOSE_URL = `${process.env.MONGO_PROTOCOL}${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
export const MONGOOSE_MODULE_FEATURES = MongooseModule.forFeature([
  { name: Models.USER, schema: UserSchema },
  { name: Models.EXCHANGE_HOLDER, schema: ExchangeHolderSchema },
  { name: Models.PROXY, schema: ProxyModelSchema },
]);

export const SERVER_PROVIDERS = [DbmanagerService];
export const SERVER_GUARD_PROVIDERS = [];

export const SERVER_PROXY_VALIDATION_URL_BASIC = 'https://www.google.com';

export const DB_BACKUP_FREQUENCY = (process.env.DB_BACKUP_FREQUENCY ||
  'daily') as FREQUENCIES;
export const DB_BACKUP_FOLDER = process.env.DB_BACKUP_PATH || './Logs/Dumps';

export const DB_BACKUP_LIMIT = Number(process.env.DB_BACKUP_LIMIT || 10);

export const LOGGER_MODULES_PARAMS: LoggingModulesConfig = loggingModulesConfig;

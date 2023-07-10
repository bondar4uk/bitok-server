import { Global, Module } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGOOSE_MODULE_FEATURES, MONGOOSE_URL } from '../../constants/server';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(MONGOOSE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    MONGOOSE_MODULE_FEATURES,
  ],
  providers: [DbmanagerService],
})
export class DbmanagerModule {}

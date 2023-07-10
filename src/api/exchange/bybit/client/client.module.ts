import { Module } from '@nestjs/common';
import { Credentials } from '../../exchange.interface';

@Module({
  imports: [],
  providers: [Credentials, Boolean],
})
export class ClientModule {}

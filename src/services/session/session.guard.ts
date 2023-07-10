import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SessionGuard extends AuthGuard(process.env.SESSION_GUARD_TYPE) {}

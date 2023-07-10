import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { SessionService } from './session.service';
import { Request } from 'express';
import { RequestDataManager } from '../requestDataManager/requestDataManager';
import { RESPONSE_MESSAGE } from '../../constants/responses';
import * as jwt from 'jsonwebtoken';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: SessionService.KEYS.public,
    });
  }

  async validate(payload: any) {
    return payload;
  }

  async authenticate(req: Request, options?: any) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) as string;
      const payload = jwt.verify(token, SessionService.KEYS.public) as any;
      const storage_token = await this.cacheManager.get(payload.email);
      if (token !== storage_token || payload.ip !== req.ip) {
        this.handleInvalidToken(req);
        return;
      }
    } catch (e) {
      this.handleInvalidToken(req);
      return;
    }

    super.authenticate(req, options);
  }

  private handleInvalidToken(req: Request) {
    const response = req.res;
    if (response) {
      const Unauthorized = RequestDataManager.unauthorized(
        RESPONSE_MESSAGE.ERROR_INVALID_TOKEN(),
      );
      response.status(Unauthorized.CODE).json(Unauthorized.DATA);
    }
  }
}

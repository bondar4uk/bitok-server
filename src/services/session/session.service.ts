import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { KeyGeneratorService } from '../key-generator/key-generator.service';
import { RESPONSE } from '../../types/controllerTypes';
import { RequestDataManager } from '../requestDataManager/requestDataManager';
import { RESPONSE_MESSAGE } from '../../constants/responses';

@Injectable()
export class SessionService {
  static ALG = 'RS512' as const;
  static HEADER_NAME = 'Authorization';
  static key: string = KeyGeneratorService.Create(256);
  static KEYS = KeyGeneratorService.CreatePair();

  static create(data: any) {
    return jwt.sign(data, SessionService.KEYS.private, {
      algorithm: SessionService.ALG,
      // TODO: change timestamp precision
      noTimestamp: false,
    });
  }

  static verify(token: string): RESPONSE {
    const tokenConverted = token.split(' ')[1];
    try {
      return RequestDataManager.ok(
        jwt.verify(tokenConverted, SessionService.KEYS.public),
      );
    } catch (e: any) {
      return RequestDataManager.unauthorized(
        RESPONSE_MESSAGE.ERROR_INVALID_TOKEN(),
      );
    }
  }

  static async generateSecret(email: string) {
    const secret = speakeasy.generateSecret({ length: 50 });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: email,
      issuer: 'CRYPPUSH',
      algorithm: 'sha512',
      digits: 8,
    });
    const svg = await qrcode.toString(otpauthUrl, {
      type: 'svg',
      errorCorrectionLevel: 'L',
      margin: 0,
      scale: 1,
    });
    const svgBase64 = Buffer.from(svg).toString('base64');
    return {
      secret: secret.base32,
      qrCodeBase64: `data:image/svg+xml;base64,${svgBase64}`,
    };
  }

  static verifyCode(code: string, secret: any) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      algorithm: 'sha512',
      digits: 8,
    });
  }
}

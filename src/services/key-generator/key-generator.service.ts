import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class KeyGeneratorService {
  static ALPHABET =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  static CreatePair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    return {
      public: publicKey.export({ type: 'pkcs1', format: 'pem' }),
      private: privateKey.export({ type: 'pkcs1', format: 'pem' }),
    };
  }

  static Create(length = 8): string {
    const MIN_LENGTH = 8;
    const MAX_LENGTH = 50;
    length = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, length));

    let res = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.ALPHABET.length);
      res += this.ALPHABET[randomIndex];
    }
    return res;
  }

  static async HashCreate(data: string) {
    const saltAmount = process.env.SECURITY_HASK_ITERATIONS;
    if (!saltAmount) {
      return '';
    }
    const saltNum = Number(saltAmount);
    return await bcrypt.hash(data, saltNum);
  }

  static async HashValidate(data: string, toCompare: string) {
    return await bcrypt.compare(data, toCompare);
  }
}

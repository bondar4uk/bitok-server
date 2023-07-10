import { Injectable } from '@nestjs/common';
import { REGISTER_BODY } from '../../auth/auth.interface';
import { KeyGeneratorService } from '../key-generator/key-generator.service';
import { InjectModel } from '@nestjs/mongoose';
import { Models } from '../../constants/models';
import { Model } from 'mongoose';
import { User } from '../../models/user.model';
import { ExchangeHolder } from '../../models/exchange-holder.model';
import { EXCHANGE } from '../../constants/paths';
import { Credentials } from '../../api/exchange/exchange.interface';
import { ProxyModel } from '../../models/proxy.model';

@Injectable()
export class DbmanagerService {
  constructor(
    @InjectModel(Models.USER) private readonly userModel: Model<User>,
    @InjectModel(Models.EXCHANGE_HOLDER)
    private readonly exchangeHolderModel: Model<ExchangeHolder>,
    @InjectModel(Models.PROXY)
    private readonly proxyModel: Model<ProxyModel>,
  ) {}

  async getUser(email?: string, fields?: string[]) {
    if (!email) {
      return null;
    }
    const selector = this.userModel.findOne({ email });
    if (!fields) {
      return selector;
    }
    const selectFields = fields.join(' ');
    return selector.select(selectFields).exec();
  }

  async addUser(data: REGISTER_BODY) {
    const { email, password, name } = REGISTER_BODY.VALIDATOR.parse(data);
    const hashedPassword = await KeyGeneratorService.HashCreate(password);
    const user = new this.userModel({ email, password: hashedPassword, name });
    return await user.save();
  }

  async updateUser(email: any, updatedUserData: any) {
    await this.userModel.updateOne({ email }, { $set: { ...updatedUserData } });
  }

  async removeUser(email: string) {
    await this.userModel.deleteOne({ email });
  }

  async getKeys(email: string, exchangeType: EXCHANGE, isLiveNet: boolean) {
    const checkUser = await this.getUser(email);
    if (!checkUser) {
      return null;
    }
    const usersToCheck = await this.exchangeHolderModel.find({
      enum_exchange: exchangeType,
      isLiveNet: isLiveNet,
    });
    let isFound = false;
    let ind = 0;
    while (!isFound && ind < usersToCheck.length) {
      const client = usersToCheck[ind];
      if (await KeyGeneratorService.HashValidate(email, client.key_hash)) {
        isFound = true;
      }
      ind++;
    }
    ind--;
    if (!isFound) {
      return null;
    }
    return usersToCheck[ind];
  }

  async addKeys(
    email: string,
    apiKey: string,
    secretKey: string,
    exchangeType: EXCHANGE,
    isLiveNet: boolean,
  ) {
    const checkUser = await this.getUser(email);
    if (!checkUser) {
      return null;
    }
    const holder = new this.exchangeHolderModel({
      key_hash: await KeyGeneratorService.HashCreate(email),
      api_key: apiKey,
      secret_key: secretKey,
      enum_exchange: exchangeType,
      isLiveNet,
    });
    await holder.save();
    return email;
  }

  async updateKeys(
    email: string,
    apiKey: string,
    secretKey: string,
    exchangeType: EXCHANGE,
    isLiveNet: boolean,
  ) {
    const user = await this.getUser(email);
    if (!user) {
      return;
    }
    const keys = await this.getKeys(email, exchangeType, isLiveNet);
    if (!keys) {
      await this.addKeys(email, apiKey, secretKey, exchangeType, isLiveNet);
      return;
    }
    keys.api_key = apiKey;
    keys.secret_key = secretKey;
    keys.trading_status = false;
    await keys.save();
  }

  async removeKeys(email: string, exchangeType: EXCHANGE, isLiveNet: boolean) {
    const user = await this.getUser(email);
    if (!user) {
      return;
    }
    await this.exchangeHolderModel.deleteOne({
      email,
      enum_exchange: exchangeType,
      isLiveNet,
    });
  }

  async getCredentials(
    email: string,
    exchangeType: EXCHANGE,
    isLiveNet: boolean,
  ) {
    const holder = await this.getKeys(email, exchangeType, isLiveNet);
    if (!holder) {
      return null;
    }
    return new Credentials(
      holder.api_key,
      holder.secret_key,
      isLiveNet,
      exchangeType,
    );
  }

  async getProxy(ip: string, port: string) {
    return this.proxyModel.findOne({ host: ip, port });
  }

  async getProxies() {
    return this.proxyModel.find();
  }

  async addProxy(proxy: ProxyModel) {
    const commit = new this.proxyModel(proxy);
    return await commit.save();
  }

  async removeProxy(ip: string, port: string) {
    return this.proxyModel.deleteOne({ host: ip, port });
  }
}

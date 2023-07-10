import { Injectable } from '@nestjs/common';
import { IEvents, MongooseBackup } from '../../modules/db_backup/index';
import {
  DB_BACKUP_FOLDER,
  DB_BACKUP_FREQUENCY,
  MONGOOSE_URL,
} from '../../constants/server';
import { LoggerService } from '../logger/logger.service';
import { InjectModel } from '@nestjs/mongoose';
import { Models } from '../../constants/models';
import { Model } from 'mongoose';
import { User } from '../../models/user.model';
import { ExchangeHolder } from '../../models/exchange-holder.model';
import { ProxyModel } from '../../models/proxy.model';
import path from 'path';
import fs, { readdirSync } from 'fs';
import { ExchangeService } from '../../api/exchange/exchange.service';
import { ProxyService } from '../../api/proxy/proxy.service';

@Injectable()
export class DBBackupService {
  static LOG = LoggerService.loadCustomConfiguration(
    LoggerService.moduleNameValidate('DbBackup'),
  );
  constructor(
    private exchangeService: ExchangeService,
    private proxyService: ProxyService,
    @InjectModel(Models.USER) private readonly userModel: Model<User>,
    @InjectModel(Models.EXCHANGE_HOLDER)
    private readonly exchangeHolderModel: Model<ExchangeHolder>,
    @InjectModel(Models.PROXY)
    private readonly proxyModel: Model<ProxyModel>,
  ) {
    const Backup = new MongooseBackup({
      url: MONGOOSE_URL,
    });

    Backup.on('connected', (data: IEvents) => {
      DBBackupService.LOG.information(`Connected to ${data.url}`);

      if (process.env.DB_RESTORE_ENABLED === 'true') {
        if (
          this.checkFilesInDirectory(
            `${DB_BACKUP_FOLDER}/${process.env.DB_RESTORE_FOLDER}`,
          )
        ) {
          Backup.deleteDB()
            .then((deleteResult: any) => {
              DBBackupService.LOG.information(deleteResult);
              return this.restoreDatabase();
            })
            .then((restoreResult: any) => {
              DBBackupService.LOG.information(restoreResult);
              return Promise.all([
                this.exchangeService.checkDefaultUsers(),
                this.proxyService.checkDefaultProxy(),
              ]);
            })
            .then(() => {
              DBBackupService.LOG.information(
                `Successfully completed the check for default users.`,
              );
              DBBackupService.LOG.information(
                `Successfully completed the check for default proxy.`,
              );
              return Backup.Localize({ per: DB_BACKUP_FREQUENCY });
            })
            .then(() => {
              DBBackupService.LOG.information(
                `The backup service has been successfully initiated.`,
              );
            });
        } else {
          DBBackupService.LOG.error(
            `An error occurred while checking backup files in the directory: ${DB_BACKUP_FOLDER}/${process.env.DB_RESTORE_FOLDER}.`,
          );
        }
      } else {
        Backup.Localize({
          per: DB_BACKUP_FREQUENCY,
        }).then(() => {
          DBBackupService.LOG.information(
            `The backup service has been successfully initiated.`,
          );
        });
        return Promise.all([
          this.exchangeService.checkDefaultUsers(),
          this.proxyService.checkDefaultProxy(),
        ]);
      }
    });

    Backup.on('backupError', (message: string) => {
      DBBackupService.LOG.error(message);
    });

    Backup.on('localizeBackup', (data: IEvents) => {
      DBBackupService.LOG.information(
        `Total ${data.total} documents backed up. Path: ${data.path}. TotalSize: ${data.totalsize}`,
      );
    });
  }

  checkFilesInDirectory(directoryPath: string): boolean {
    try {
      const files = readdirSync(directoryPath);
      return files.length > 0;
    } catch {
      return false;
    }
  }

  async restoreDatabase() {
    return new Promise((resolve, reject) => {
      try {
        const backupFolder = `${DB_BACKUP_FOLDER}/${process.env.DB_RESTORE_FOLDER}`;
        const files = fs.readdirSync(backupFolder);

        const modelMap: { [key: string]: any } = {
          users: this.userModel,
          proxies: this.proxyModel,
          'exchange-holders': this.exchangeHolderModel,
        };

        const promises: Promise<any>[] = [];

        for (const file of files) {
          const filePath = path.join(backupFolder, file);

          const collectionName = path.basename(file, '.json');

          const fileData = fs.readFileSync(filePath, 'utf8');
          const collectionData = JSON.parse(fileData);

          const model = modelMap[collectionName];
          if (model) {
            const promise = model.create(collectionData);
            promises.push(promise);
          }
        }

        Promise.all(promises)
          .then(() => {
            fs.readFile('./.env', 'utf8', (err, data) => {
              if (err) {
                console.error(err);
                reject(err);
                return;
              }

              const updatedData = data.replace(
                /DB_RESTORE_ENABLED=.*/,
                `DB_RESTORE_ENABLED=${false}`,
              );

              fs.writeFile('./.env', updatedData, 'utf8', (err) => {
                if (err) {
                  console.error(err);
                  reject(err);
                  return;
                }
                resolve(
                  `Database successfully restored from backup {${DB_BACKUP_FOLDER}/${process.env.DB_RESTORE_FOLDER}}.`,
                );
              });
            });
          })
          .catch((error) => {
            reject(error.message);
          });
      } catch (e) {
        console.log(e.message);
        reject(e.message);
      }
    });
  }
}

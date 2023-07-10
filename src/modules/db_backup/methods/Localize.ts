import { ILocalize } from '../types/interfaces';
import { CronJob } from 'cron';
import fs from 'fs';
import config from '../config.json';
import path from 'path';
import { DB_BACKUP_FOLDER, DB_BACKUP_LIMIT } from '../../../constants/server';

export async function MethodLocalize(this: any, { per }: ILocalize) {
  if (
    per !== 'minutes' &&
    per !== 'hours' &&
    per !== 'daily' &&
    per !== 'weekly' &&
    per !== 'monthly' &&
    per !== 'yearly'
  )
    throw new Error('Period is not defined or not a string!');
  try {
    if (this.connected) {
      const documents = await this.getDocuments();
      let totalsize = 0;
      const job = new CronJob(
        config.timesForCronJob[per],
        async () => {
          for (const document of documents) {
            const index: number = documents.indexOf(document);
            const doc = await this.getDocument(document.name);
            const fileName = `${new Date()
              .toLocaleDateString()
              .replace(/\//g, '-')}-${new Date()
              .toLocaleTimeString()
              .replace(/:/g, '-')}`;

            if (!fs.existsSync(DB_BACKUP_FOLDER)) {
              fs.mkdirSync(DB_BACKUP_FOLDER);
            }

            if (!fs.existsSync(`${DB_BACKUP_FOLDER}/${fileName}`)) {
              fs.mkdirSync(`${DB_BACKUP_FOLDER}/${fileName}`);
            }

            const folders = fs.readdirSync(DB_BACKUP_FOLDER).map((folder) => {
              const folderPath = path.join(DB_BACKUP_FOLDER, folder);
              return {
                path: folderPath,
                ctime: fs.statSync(folderPath).ctimeMs,
              };
            });

            const maxRecords = DB_BACKUP_LIMIT;

            if (folders.length > maxRecords) {
              const sortedFolders = folders.sort((a, b) => a.ctime - b.ctime);
              const foldersToRemove = sortedFolders.slice(
                0,
                folders.length - maxRecords,
              );

              foldersToRemove.forEach((folder) => {
                fs.rm(folder.path, { recursive: true }, (err) => {
                  if (err) {
                    console.error(err.message);
                    return;
                  }
                });
              });
            }

            fs.writeFileSync(
              `${DB_BACKUP_FOLDER}/${fileName}/${document.name}.json`,
              JSON.stringify(doc, null, 4),
            );

            const stat = fs.statSync(
              `${DB_BACKUP_FOLDER}/${fileName}/${document.name}.json`,
            );
            totalsize += stat.size / (1024 * 1024);

            if (index === documents.length - 1) {
              this.emit('localizeBackup', {
                message: `Localize Backup is done.`,
                path: `${DB_BACKUP_FOLDER}/${fileName}`,
                totalsize: `${totalsize.toFixed(4)} MB`,
                time: new Date(),
                total: documents.length,
              });

              fs.readFile('./.env', 'utf8', (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }

                const updatedData = data.replace(
                  /DB_RESTORE_FOLDER=.*/,
                  `DB_RESTORE_FOLDER=${fileName}`,
                );

                fs.writeFile('./.env', updatedData, 'utf8', (err) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                });
              });
              totalsize = 0;
            }
          }
        },
        null,
        true,
      );

      job.start();
    } else {
      this.emit('backupError', 'You must connect to database first!');
    }
  } catch (err) {
    throw new Error(err);
  }
}

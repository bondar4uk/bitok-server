import { MethodLocalize } from '../methods/Localize';
import { EventEmitter } from 'events';
import { IConstructor, ILocalize } from '../types/interfaces';
import mongoose from 'mongoose';

export class Backuper extends EventEmitter {
  connected: boolean;
  url: string;
  getDocuments: any;
  getDocument: any;
  deleteDB: any;

  constructor({ url }: IConstructor) {
    super();

    if (!url) throw new Error('URL is not defined or not a string!');
    if (!url) return;

    this.connected = false;
    this.url = url;

    mongoose.connect(url).catch((err) => {
      throw new Error(err);
    });

    mongoose.connection.on('error', (err) => {
      this.connected = false;
      throw new Error(err);
    });

    mongoose.connection.on('connected', () => {
      this.emit('connected', { url });
      setInterval(() => {
        this.emit('ping', {
          message: 'Mongoose Backup is alive.',
          url: this.url || 'Empty',
          time: new Date(),
        });
      }, 60000);
    });

    this.on('connected', () => {
      this.connected = true;
    });

    this.deleteDB = () => {
      return new Promise((resolve) => {
        mongoose.connection.db.dropDatabase().then(() => {
          resolve('Database successfully deleted.');
        });
      });
    };
    this.getDocuments = () => {
      return mongoose.connection.db.listCollections().toArray();
    };
    this.getDocument = (name: string) => {
      return mongoose.connection.db.collection(name).find().toArray();
    };
    return this;
  }

  async Localize({ per }: ILocalize) {
    if (!per) throw new Error('Period is not defined or not a string!');
    if (!per) return;

    return MethodLocalize.call(this, { per });
  }
}

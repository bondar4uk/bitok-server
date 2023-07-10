import mongoose from 'mongoose';
import { EXCHANGES } from '../constants/DBTypes';

export const ExchangeHolderSchema = new mongoose.Schema(
  {
    key_hash: { type: String, required: true },
    api_key: { type: String, required: true },
    secret_key: { type: String, required: true },
    enum_exchange: { type: String, enum: EXCHANGES, required: true },
    trading_status: { type: Boolean, required: false, default: false },
    isLiveNet: { type: Boolean, required: true },
  },
  { timestamps: true },
);

export interface ExchangeHolder extends mongoose.Document {
  key_hash: string;
  api_key: string;
  secret_key: string;
  enum_exchange: string;
  trading_status: boolean;
  isLiveNet: boolean;
}

import mongoose from 'mongoose';

export const ProxyModelSchema = new mongoose.Schema(
  {
    host: { type: String, required: true },
    port: { type: String, required: true },
    user: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export interface ProxyModel extends mongoose.Document {
  host: string;
  port: string;
  user: string;
  password: string;
}

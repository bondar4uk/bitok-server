import * as mongoose from 'mongoose';
export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    two_factor_secret: { type: String || null, required: false, default: null },
  },
  { timestamps: true },
);

export interface User extends mongoose.Document {
  _id: string;
  email: string;
  name: string;
  two_factor_secret: string | null;
  password: string;
}

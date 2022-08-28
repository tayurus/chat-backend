import mongoose from 'mongoose';

export type UserType = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dialogs: mongoose.Schema.Types.Array;
  token: string;
};

const userSchema = new mongoose.Schema<UserType>({
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  dialogs: { type: Array, default: [] },
  token: { type: String },
});

userSchema.index({ last_name: 'text', first_name: 'text', email: 'text' });

export const User = mongoose.model('user', userSchema);

import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  portfolioUrl?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  lastLogin?: Date;
  isActive: boolean;
  usage: {
    resumesCreated: number;
    aiGenerations: number;
    coverLettersCreated: number;
    portfoliosCreated: number;
    downloadsCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true, maxlength: 100 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    password: { type: String, minlength: 8, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatar:   { type: String },
    phone:    { type: String, maxlength: 20 },
    address:  { type: String, maxlength: 200 },
    linkedin: { type: String, maxlength: 200 },
    github:   { type: String, maxlength: 200 },
    portfolioUrl: { type: String, maxlength: 200 },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified:        { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken:     { type: String, select: false },
    passwordResetExpires:   { type: Date, select: false },
    refreshToken:           { type: String, select: false },
    lastLogin:              { type: Date },
    isActive:               { type: Boolean, default: true },
    usage: {
      resumesCreated:      { type: Number, default: 0 },
      aiGenerations:       { type: Number, default: 0 },
      coverLettersCreated: { type: Number, default: 0 },
      portfoliosCreated:   { type: Number, default: 0 },
      downloadsCount:      { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r.password;
        delete r.refreshToken;
        delete r.emailVerificationToken;
        delete r.passwordResetToken;
        delete r.__v;
        return r;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;

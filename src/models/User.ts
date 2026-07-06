import mongoose, { Schema, Document, Model } from "mongoose";
import { ROLES, DEPARTMENTS } from "@/lib/constants";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: (typeof ROLES)[number];
  department?: string;
  rollNo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "student" },
    department: { type: String, enum: DEPARTMENTS },
    rollNo: { type: String, trim: true },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { FEEDBACK_CATEGORIES } from "@/lib/constants";

export interface IFeedback extends Document {
  user?: Types.ObjectId;
  category: string;
  rating: number;
  comments?: string;
  anonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    // Not required: anonymous feedback stores no user reference.
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    category: { type: String, enum: FEEDBACK_CATEGORIES, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, trim: true },
    anonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;

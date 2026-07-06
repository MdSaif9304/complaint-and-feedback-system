import mongoose, { Schema, Document, Model, Types } from "mongoose";
// Ensure the referenced User model is registered in every bundle that uses
// Complaint, so `.populate("user")` works in Vercel's serverless functions.
import "./User";
import { COMPLAINT_STATUSES, DEPARTMENTS, PRIORITIES } from "@/lib/constants";

export interface IComplaintUpdate {
  status: string;
  note?: string;
  by: string;
  at: Date;
}

export interface IComplaint extends Document {
  ticketId: string;
  user: Types.ObjectId;
  title: string;
  category: string;
  department: string;
  description: string;
  priority: string;
  status: string;
  assignedTo?: string;
  updates: IComplaintUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const UpdateSchema = new Schema<IComplaintUpdate>(
  {
    status: { type: String, required: true },
    note: { type: String },
    by: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ComplaintSchema = new Schema<IComplaint>(
  {
    ticketId: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    // Stored as the category name; validated against the Category collection.
    category: { type: String, required: true },
    department: { type: String, enum: DEPARTMENTS, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: PRIORITIES, default: "medium" },
    status: { type: String, enum: COMPLAINT_STATUSES, default: "pending", index: true },
    assignedTo: { type: String, trim: true },
    updates: { type: [UpdateSchema], default: [] },
  },
  { timestamps: true }
);

// Generate a human-friendly ticket id like CMP-7F3A9C before saving.
ComplaintSchema.pre("validate", function (next) {
  if (!this.ticketId) {
    const rand = Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase();
    this.ticketId = `CMP-${rand}`;
  }
  next();
});

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;

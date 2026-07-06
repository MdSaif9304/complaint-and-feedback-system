import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import Feedback from "@/models/Feedback";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/apiHelpers";

// GET /api/admin/stats — aggregated analytics for the admin dashboard.
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Not authenticated", 401);
  if (session.role !== "admin") return jsonError("Admins only", 403);

  await connectDB();

  const [
    totalComplaints,
    byStatus,
    byCategory,
    byRole,
    totalUsers,
    totalFeedback,
    ratingAgg,
    ratingDist,
    monthlyAgg,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
      { $unwind: "$u" },
      { $group: { _id: "$u.role", count: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: { $ne: "admin" } }),
    Feedback.countDocuments(),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
    Feedback.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]),
    Complaint.aggregate([
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
  ]);

  const statusMap: Record<string, number> = {};
  byStatus.forEach((s) => (statusMap[s._id] = s.count));

  const resolved = (statusMap["resolved"] || 0) + (statusMap["closed"] || 0);
  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return jsonOk({
    stats: {
      totalComplaints,
      totalUsers,
      totalFeedback,
      resolutionRate,
      pending: statusMap["pending"] || 0,
      avgRating: ratingAgg[0]?.avg ? Number(ratingAgg[0].avg.toFixed(2)) : 0,
      byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
      byCategory: byCategory.map((c) => ({ name: c._id, value: c.count })),
      byRole: byRole.map((r) => ({ name: r._id, value: r.count })),
      ratingDistribution: [1, 2, 3, 4, 5].map((star) => ({
        name: `${star}★`,
        value: ratingDist.find((r) => r._id === star)?.count || 0,
      })),
      monthly: monthlyAgg.map((m) => ({
        name: monthNames[m._id.m - 1],
        value: m.count,
      })),
    },
  });
}

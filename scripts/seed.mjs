// Seeds the database with an admin account, a few users, sample complaints and
// feedback so you can demo the app immediately.
//
// Run with:  npm run seed
// (uses Node's --env-file to load .env.local)

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes("your-mongodb-connection-string")) {
  console.error("❌ Set a real MONGODB_URI in .env.local before seeding.");
  process.exit(1);
}

const CATEGORY_DEFS = [
  { name: "Academic", description: "Teaching, courses, or curriculum issues." },
  { name: "Administrative", description: "Admissions, fees, documents, office processes." },
  { name: "Infrastructure", description: "Classrooms, labs, water, electricity, facilities." },
  { name: "Hostel", description: "Hostel accommodation, mess, and warden matters." },
  { name: "Library", description: "Books, resources, and library services." },
  { name: "Examination", description: "Exams, results, and admit cards." },
  { name: "Transport", description: "College bus and transport services." },
  { name: "Harassment", description: "Any form of harassment by students or staff.", sensitive: true },
  { name: "Sexual Harassment / Abuse", description: "Handled confidentially as per college policy (ICC).", sensitive: true },
  { name: "Ragging / Bullying", description: "Ragging or bullying incidents — zero tolerance.", sensitive: true },
  { name: "Discrimination", description: "Discrimination based on caste, gender, religion, disability, etc.", sensitive: true },
  { name: "Other", description: "Anything not covered by the categories above." },
];
// Categories used when generating sample complaints below.
const CATEGORIES = ["Academic", "Infrastructure", "Hostel", "Library", "Examination", "Administrative"];
const DEPARTMENTS = ["Information Technology", "Library", "Hostel Management", "Examinations", "General Administration"];
const STATUSES = ["pending", "under-review", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high"];
const FEEDBACK_CATS = ["Teaching Quality", "Infrastructure", "Library", "Canteen", "Overall Experience"];

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    department: String,
    rollNo: String,
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    category: String,
    department: String,
    description: String,
    priority: String,
    status: String,
    assignedTo: String,
    updates: [{ status: String, note: String, by: String, at: Date }],
  },
  { timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: String,
    rating: Number,
    comments: String,
    anonymous: Boolean,
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    description: String,
    sensitive: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ticket = () =>
  "CMP-" + Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase();

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
  const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
  const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

  await Promise.all([
    User.deleteMany({}),
    Complaint.deleteMany({}),
    Feedback.deleteMany({}),
    Category.deleteMany({}),
  ]);
  console.log("🧹 Cleared existing data");

  await Category.insertMany(
    CATEGORY_DEFS.map((c) => ({ active: true, sensitive: false, ...c }))
  );
  console.log(`🏷️  Created ${CATEGORY_DEFS.length} categories`);

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@college.edu",
    password: hash("admin123"),
    role: "admin",
  });

  const sampleUsers = await User.create([
    { name: "Ada Wasim", email: "ada@college.edu", password: hash("password123"), role: "student", department: "Information Technology", rollNo: "2060223007" },
    { name: "Aariz Kalim", email: "aariz@college.edu", password: hash("password123"), role: "student", department: "Information Technology", rollNo: "2060223005" },
    { name: "Mohammad Saif Ansari", email: "saif@college.edu", password: hash("password123"), role: "student", department: "Information Technology", rollNo: "20600223027" },
    { name: "Prof. Sharmistha Gayen", email: "sharmistha@college.edu", password: hash("password123"), role: "faculty", department: "Information Technology" },
  ]);
  console.log(`👥 Created ${sampleUsers.length + 1} users (incl. admin)`);

  const titles = [
    "Wi-Fi not working in Block B",
    "Water cooler out of order near library",
    "Delay in issuing exam admit card",
    "Insufficient books in the library",
    "Hostel mess food quality is poor",
    "Projector broken in Room 204",
    "Fee receipt not generated online",
    "Lab computers are very slow",
    "Unclean washrooms in academic block",
    "Class timetable clashes reported",
  ];

  const complaints = [];
  for (let i = 0; i < titles.length; i++) {
    const owner = pick(sampleUsers);
    const status = pick(STATUSES);
    const createdAt = new Date(2026, i % 12, 1 + (i % 27));
    complaints.push({
      ticketId: ticket(),
      user: owner._id,
      title: titles[i],
      category: pick(CATEGORIES),
      department: pick(DEPARTMENTS),
      description: `${titles[i]}. This issue has been ongoing and needs attention from the concerned department.`,
      priority: pick(PRIORITIES),
      status,
      assignedTo: status === "pending" ? undefined : "Maintenance Dept",
      createdAt,
      updatedAt: createdAt,
      updates: [
        { status: "pending", note: "Complaint submitted", by: owner.name, at: createdAt },
        ...(status !== "pending"
          ? [{ status, note: `Status changed to ${status}`, by: "Admin User", at: new Date(createdAt.getTime() + 86400000) }]
          : []),
      ],
    });
  }
  await Complaint.insertMany(complaints);
  console.log(`📝 Created ${complaints.length} complaints`);

  const feedback = [];
  for (let i = 0; i < 15; i++) {
    const anon = Math.random() < 0.4;
    const owner = pick(sampleUsers);
    feedback.push({
      user: anon ? undefined : owner._id,
      category: pick(FEEDBACK_CATS),
      rating: 1 + Math.floor(Math.random() * 5),
      comments: pick([
        "Great improvement this semester.",
        "Needs better facilities.",
        "Very responsive administration.",
        "Could be faster.",
        "",
      ]),
      anonymous: anon,
    });
  }
  await Feedback.insertMany(feedback);
  console.log(`⭐ Created ${feedback.length} feedback entries`);

  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin   → admin@college.edu / admin123");
  console.log("  Student → saif@college.edu / password123");
  console.log("  Faculty → sharmistha@college.edu / password123\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

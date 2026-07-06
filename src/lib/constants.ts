export const ROLES = ["student", "faculty", "admin"] as const;

export const COMPLAINT_CATEGORIES = [
  "Academic",
  "Administrative",
  "Infrastructure",
  "Hostel",
  "Library",
  "Examination",
  "Transport",
  "Other",
] as const;

export const DEPARTMENTS = [
  "Information Technology",
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Examinations",
  "Library",
  "Hostel Management",
  "General Administration",
] as const;

export const COMPLAINT_STATUSES = [
  "pending",
  "under-review",
  "resolved",
  "closed",
] as const;

export const PRIORITIES = ["low", "medium", "high"] as const;

export const FEEDBACK_CATEGORIES = [
  "Teaching Quality",
  "Infrastructure",
  "Administrative Services",
  "Library",
  "Canteen",
  "Overall Experience",
  "Other",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  "under-review": "Under Review",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  "under-review": "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

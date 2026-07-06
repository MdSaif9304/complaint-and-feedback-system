# Complaint & Feedback System in College

A web-based platform for grievance redressal and feedback management, built as a
final year B.Tech (IT) project. Students and faculty can submit complaints, track
their status, and share feedback (optionally anonymous). Administrators manage
complaints and view analytics.

## Tech Stack

- **Next.js 15** (App Router) — frontend + API routes
- **MongoDB + Mongoose** — database
- **Zod** — request/form validation
- **JWT** (`jose`) + **bcryptjs** — authentication (httpOnly cookies)
- **Tailwind CSS** — styling
- **Recharts** — analytics charts

## Features

- Role-based access: **student**, **faculty**, **admin**
- Secure registration & login (hashed passwords, JWT session cookie)
- Submit complaints with category, department, priority → auto-generated tracking ID
- Track complaint status with a full timeline (pending → under review → resolved → closed)
- Submit feedback with star ratings and optional anonymity
- Admin dashboard: view/filter/assign/update complaints, respond with notes
- Admin analytics: KPIs + charts (by status, category, monthly trend, rating distribution)
- Route protection via Next.js middleware

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env.local` and set your values:

```
MONGODB_URI="your-mongodb-connection-string"
JWT_SECRET="a-long-random-secret-string"
JWT_EXPIRES_IN="7d"
```

> Paste your MongoDB Atlas / local connection string into `MONGODB_URI`.

### 3. Seed sample data (optional but recommended)

```bash
npm run seed
```

This creates demo accounts:

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Admin   | admin@college.edu        | admin123      |
| Student | saif@college.edu         | password123   |
| Faculty | sharmistha@college.edu   | password123   |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/                # API routes (auth, complaints, feedback, admin stats)
│   ├── admin/              # Admin analytics, complaints, feedback pages
│   ├── dashboard/          # Student/faculty complaint & feedback pages
│   ├── login/ register/    # Auth pages
│   └── page.tsx            # Landing page
├── components/             # Navbar, badges, charts, timeline
├── lib/                    # db, auth (JWT), zod validations, constants
├── models/                 # Mongoose models (User, Complaint, Feedback)
└── middleware.ts           # Role-based route protection
```

## Notes

- The first user with `role: admin` must be created via the seed script (registration
  only allows student/faculty for security).
- Anonymous feedback stores no reference to the submitting user.

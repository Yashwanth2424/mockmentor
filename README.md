# MockMentor

MockMentor is a full-stack web application for scheduling and managing mock interviews between students and mentors.

The platform allows students to book interviews based on mentor availability, while mentors can manage interview requests, provide feedback, and complete interview sessions through a structured workflow.

---

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Protected routes using Next.js Proxy
- Separate flows for Student, Mentor, and Admin users

### Student Features

- Book mock interviews
- Select interview topic
- Choose mentor based on availability
- Time-slot based scheduling
- Prevent double booking
- Cancel interviews
- View interview details and feedback
- Receive booking confirmation emails

### Mentor Features

- Set weekly availability
- Accept or reject interview requests
- Complete interviews
- Submit ratings and structured feedback
- Manage interview dashboard

### Admin Features

- View all users
- Manage user roles
- View all interviews
- Cancel interviews

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React
- SWR
- CSS

### Backend

- Next.js Route Handlers
- Prisma ORM
- JWT Authentication

### Database

- PostgreSQL (Neon)

### Email Service

- Resend

---

## Folder Structure

```text
src/
├── app/
│   ├── admin/
│   ├── api/
│   ├── dashboard/
│   ├── login/
│   ├── mentor/
│   └── signup/
│
├── components/
│   ├── Header/
│   ├── Sidebar/
│   └── skeletons/
│
├── lib/
│   ├── auth.js
│   ├── email.js
│   ├── jwt.js
│   └── prisma.js
│
└── proxy.js
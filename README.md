# 🚀 MockMentor

MockMentor is a full-stack web application that helps users practice interviews through a structured scheduling system.
Users can book mock interviews, manage them, and improve their preparation with realistic time-slot based sessions.

---

## ✨ Features

### 👤 User Features

* 📅 Book mock interviews with time slots (30-minute intervals)
* 🧠 Select interview topic (DSA, React, etc.)
* ⛔ Prevent booking in past dates
* 🔒 Prevent double booking (slot-based system)
* ❌ Cancel interview
* 🔁 Reschedule interview
* 📧 Email confirmation after booking
* 👨‍🏫 Select mentor (in progress)

---

### 🛠 Admin Features

* 📊 View all interviews
* 🔍 Search and filter interviews
* ✅ Mark interviews as completed
* 👥 Manage users
* 📈 Dashboard with stats

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* React
* CSS Modules

### Backend

* Next.js API Routes
* Prisma ORM

### Database

* PostgreSQL (Neon)

### Other

* JWT Authentication
* Nodemailer (Email system)
* SWR (Data fetching)

---

## 📸 Screenshots (optional)

*Add screenshots here later*

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/mockmentor.git
cd mockmentor
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

---

### 4. Run migrations

```bash
npx prisma migrate dev
```

---

### 5. Start the app

```bash
npm run dev
```

---

## 🧠 Project Concept

MockMentor simulates real interview environments by allowing users to:

* Schedule interview sessions
* Practice in structured time slots
* Track and manage their preparation

Future scope includes:

* Mentor-based interviews
* Real-time sessions
* AI feedback system

---

## 📌 Current Status

🟢 MVP Completed
🟡 Mentor system in progress
🔵 Future enhancements planned

---

## 🙌 Author

**Yashwanth (Thalka)**
Master’s Student – Web Engineering (TU Chemnitz)

---

## 📄 License

This project is for learning and portfolio purposes.

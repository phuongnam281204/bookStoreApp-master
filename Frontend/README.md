# bookStoreApp

Full-stack bookstore app with a React (Vite) frontend and Express + MongoDB backend.

## Features

- Storefront browsing, search, and product detail view
- Cart and checkout flow
- Admin management: books, orders, users
- Orders for users with cancel support
- Password reset (email) flow

## Tech Stack

- Frontend: React, Vite, Tailwind, DaisyUI
- Backend: Express, MongoDB, Mongoose
- Auth: JWT (cookie) + role-based access

## Project Structure

- Backend/ - Express API
- Frontend/ - React app

## Prerequisites

- Node.js 18+
- MongoDB running locally or in the cloud

## Setup

### Backend

1) Install dependencies

```
cd Backend
npm install
```

2) Create .env (based on Backend/.env.example)

```
PORT=4001
MongoDBURI="mongodb://localhost:27017/bookStore"
JWT_SECRET="change_me"
CORS_ORIGIN="http://localhost:5173"

ADMIN_EMAIL="admin@example.com"
SESSION_TTL_MINUTES=15
RESET_TTL_MINUTES=15

RESET_PASSWORD_URL="http://localhost:5173/reset-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your_email@gmail.com"
SMTP_PASS="app_password"
SMTP_FROM="BookStore <your_email@gmail.com>"
```

3) Start backend

```
npm run start
```

### Frontend

1) Install dependencies

```
cd Frontend
npm install
```

2) Start frontend

```
npm run dev
```

## Password Reset Flow

- Users request reset from the login dialog
- Backend generates a short-lived token and emails a reset link
- Users set a new password on /reset-password
- All old sessions are invalidated after reset

## Notes

- Admin role is assigned automatically when signing up with ADMIN_EMAIL
- If emails are not sending, verify SMTP settings and App Passwords (Gmail)

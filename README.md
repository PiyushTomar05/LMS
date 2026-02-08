# University Learning Management System (LMS)

A comprehensive, multi-tenant Learning Management System designed for universities and colleges.

## Features

*   **Multi-Tenancy**: Supports multiple universities/schools within a single deployment.
*   **Role-Based Access Control**:
    *   **Super Admin**: Manages universities and global settings.
    *   **School Admin**: Manages their specific university, faculty, and students.
    *   **Faculty**: Manages courses, attendance, assignments, and grades.
    *   **Student**: Accesses courses, views attendance, submits assignments, and checks grades.
*   **Academic Management**:
    *   Attendance Tracking
    *   Assignment Submission & Grading
    *   Timetable Management
    *   Announcement System
*   **Modern UI**: Built with React and Tailwind CSS for a responsive and intuitive user experience.

## Technology Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: JWT (JSON Web Tokens)

## Getting Started

1.  Clone the repository.
2.  Install dependencies for backend: `cd backend && npm install`
3.  Install dependencies for frontend: `cd frontend && npm install`
4.  Set up your `.env` file in the `backend` directory.
5.  Run database migrations: `npx prisma migrate dev`
6.  Start the backend: `npm run dev`
7.  Start the frontend: `npm run dev`

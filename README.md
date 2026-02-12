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
*   **Transport Module**:
    *   Manage bus routes, stops, and schedules.
    *   Track driver details and vehicle information.
*   **Course Management**:
    *   Professors can create and manage courses.
    *   Schedule classes with weekly timetables.
    *   Enroll students in courses.
*   **Modern UI**: Built with React and Tailwind CSS for a responsive and intuitive user experience.

## Technology Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB
*   **ODM**: Mongoose
*   **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before getting started, ensure you have the following installed:

*   **Node.js** (v14 or higher)
*   **npm** (Node Package Manager)
*   **MongoDB** (Local instance or Atlas connection string)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/PiyushTomar05/LMS.git
cd LMS
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with your configuration (`MONGO_URI`, `JWT_SECRET`, etc.).

Seed the database with initial data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

## Project Structure

*   `backend/`: Contains the Node.js/Express application, API routes, and database models.
*   `frontend/`: Contains the React application, components, and pages.

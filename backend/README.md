# Backend Documentation

This directory contains the backend source code for the University LMS, built with Node.js, Express, and PostgreSQL.

## Project Structure

*   `src/`: Source code
    *   `config/`: Configuration files context
    *   `controllers/`: Request handlers
    *   `middleware/`: Express middleware (auth, etc.)
    *   `models/`: Database models (Prisma client usage)
    *   `routes/`: API route definitions
    *   `utils/`: Utility functions
    *   `app.js`: Express app setup
    *   `server.js`: Entry point

## API Endpoints

The API is organized into the following modules:

*   **Auth**: `/api/auth` - Authentication (Register, Login)
*   **Users**: `/api/users` - User management
*   **University**: `/api/university` - University management (Super Admin)
*   **Academic**: `/api/academic` - Academic structure (Programs, Departments)
*   **Courses**: `/api/courses` - Course management
*   **Attendance**: `/api/attendance` - Attendance tracking
*   **Assignments**: `/api/assignments` - Assignment submission and grading
*   **Grades**: `/api/grades` - Grade management
*   **Fees**: `/api/fees` - Fee management
*   **Timetable**: `/api/timetable` - Class scheduling
*   **Announcements**: `/api/announcement` - System announcements
*   **Resources**: `/api/resources` - Educational resources

## Setup

See the main [README.md](../README.md) for setup instructions.

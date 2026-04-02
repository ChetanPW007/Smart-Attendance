# Smart Attendance System

A full-stack MERN web application for capturing attendance.

## Local Setup

### 1. Database
Make sure you have MongoDB running locally on `mongodb://localhost:27017` or update the `MONGO_URI` inside `backend/.env`.

### 2. Run the Backend
```bash
cd backend
npm install   # If not already installed
node server.js
```
The server will run on `http://localhost:5000`.

### 3. Run the Frontend
Open a new terminal session:
```bash
cd frontend
npm install
npm run dev
```
The web app will run on `http://localhost:5173`.

## Features
- **Modern UI**: Clean and dynamic presentation built with Tailwind and Lucide Icons.
- **Bulk Upload**: Easily ingest classes into the database via an `.xlsx` file containing "Name" and "USN" columns.
- **Session History**: Visually tracks submitted classes and drill down to view specific attendances.

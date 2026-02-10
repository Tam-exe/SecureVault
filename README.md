# Secure File Storage & Access Platform

A secure, enterprise-like file storage system with Role-Based Access Control (RBAC), secure file handling, and comprehensive audit logging.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js, Express, Sequelize, MySQL
- **Security**: JWT Authentication, RBAC, Multer (Secure Uploads), Bcrypt, Helmet, Rate Limiting

## Features

- **Authentication**: User secure Login and Signup.
- **RBAC**: 
  - **Admin**: Full access, manage users, view audit logs.
  - **Uploader**: Upload files, manage own files, share files.
  - **Viewer**: View/Download shared files only.
- **File Management**: Upload, Download, Share (Read/Download permissions), Delete.
- **Security**:
  - Files stored outside public web root with randomized names.
  - SHA-256 hash calculation for integrity.
  - Strict permission checks for every action.
- **Audit Logging**: Tracks Login, Upload, Download, Share, Delete actions.

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL installed and running

### Database Setup
1. Create a MySQL database (default: `secure_file_storage`).
2. Update `server/.env` with your DB credentials.

### Backend Setup
1. Navigate to `server/`:
   ```bash
   cd server
   npm install
   ```
2. Setup Database:
   ```bash
   node setup_db.js
   node sync.js
   ```
3. Start Server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

### Frontend Setup
1. Navigate to `client/`:
   ```bash
   cd client
   npm install
   ```
2. Start Client:
   ```bash
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

## Security Considerations

- **Secure Storage**: Uploads are saved in `server/uploads` (not `public/`), accessible only via authenticated API endpoints.
- **Input Validation**: Multer limits file types and sizes.
- **IDOR Protection**: Every file access checks `User.id` vs `File.owner_id` or `Permission` table.
- **Rate Limiting**: Applied to API routes to prevent abuse.

## Folder Structure

```
root/
├── client/           # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth Context
│   │   ├── pages/      # Route pages
│   │   └── ...
├── server/           # Node.js Backend
│   ├── config/       # DB and Upload config
│   ├── controllers/  # Logic for Auth, Files, Admin
│   ├── middleware/   # Auth and RBAC middleware
│   ├── models/       # Sequelize models
│   ├── routes/       # API routes
│   └── uploads/      # Secure file storage
```

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


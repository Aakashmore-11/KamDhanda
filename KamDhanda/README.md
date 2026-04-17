# KamDhanda - Freelance Job Portal

KamDhanda is a modern freelance platform built with the MERN stack (MongoDB, Express, React, Node.js). It connects Clients with Job Seekers, featuring real-time messaging, project management, and automated notifications.

## 🚀 Features

- **Dual-Role Support**: Switch between Client and Seeker experiences.
- **Project Management**: Create, browse, and apply for freelance projects.
- **Rich Chat Interface**: WhatsApp-style messaging with support for:
    - Text messages
    - Image attachments (JPEG, PNG, etc.)
    - PDF documents
- **Real-time Notifications**: Instant alerts for new messages and project updates.
- **Google Authentication**: Seamless login using Google accounts.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Redux Toolkit, Tailwind CSS, Lucide React.
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **Storage**: Cloudinary (for images and PDFs).
- **Authentication**: JWT & Google OAuth 2.0.

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js installed on your machine.
- A MongoDB instance (local or Atlas).
- A Cloudinary account for file storage.

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
GOOGLE_CLIENT_ID=your_google_id
CLOUD_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

### 3. Installation
**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## 📂 Project Structure

- `/client`: React frontend with Vite.
- `/server`: Express backend with Mongoose models and controllers.
- `/UpcomingUpdates`: Pre-designed UI components and layouts for future integration.

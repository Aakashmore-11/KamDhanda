# KamDhanda API Documentation

This document outlines the primary API endpoints for the KamDhanda platform.

## ✉️ Notifications & Chat

### 1. Send Message
**Endpoint:** `POST /notification/send`
**Content-Type:** `multipart/form-data` (if attachments) or `application/json`

**Request Body:**
- `recipientId` (String, Required): ID of the user receiving the message.
- `message` (String, Optional): Text content.
- `projectId` (String, Optional): ID of the project being discussed.
- `attachments` (File[], Optional): Up to 5 image or PDF files.

**Response (201 Created):**
```json
{
  "message": "Message sent successfully!",
  "notification": {
    "_id": "60d...",
    "sender_id": { "fullName": "John Doe", "profilePic": "...", "role": "Client" },
    "recipient_id": "60e...",
    "message": "Hello!",
    "attachments": [ { "url": "...", "fileType": "image", "fileName": "image.jpg" } ],
    "createdAt": "2026-03-01T..."
  }
}
```

### 2. Get Conversations
**Endpoint:** `GET /notification/conversations`
**Description:** Returns a list of unique users the current user has chatted with.

### 3. Get Chat History
**Endpoint:** `GET /notification/history/:otherUserId`
**Description:** Returns all messages between the current user and the specified `otherUserId`.

---

## 📁 Projects

### 1. Post New Project
**Endpoint:** `POST /freelancerProject/create-newProject`
**Required Fields:** `title`, `description`, `budget`, `skills`.

---

## 👤 Users

### 1. Get Current User
**Endpoint:** `GET /user/getCurrentUser`
**Description:** Returns the authenticated user's session data.

### 2. Google Authentication
**Endpoint:** `POST /user/google-auth`
**Body:** `{ "token": "G_ID_TOKEN", "role": "Seeker|Client" }`

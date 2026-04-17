# Project "KamDhanda" - Structured Hiring Workflow Implementation Plan

## 🎯 Objective
Implement a 2-phase hiring system (Mock Test + Virtual Interview) for the KamDhanda freelancing platform.

## 🏗️ Architecture Overview
- **Database**: MongoDB (Mongoose)
- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Tailwind CSS
- **Notifications**: Automated triggers via existing Notification system.

## 💾 Database Schema Changes

### 1. Application Model (`server/models/applications_model.js`)
- Update `status` enum: `["Applied", "Accepted", "MockTest", "Interview", "Hired", "Rejected"]`.

### 2. Interview Model (`server/models/interview_model.js`) - NEW
```javascript
{
  jobId: ObjectId,
  applicationId: ObjectId,
  clientId: ObjectId,
  seekerId: ObjectId,
  title: String,
  date: Date,
  time: String,
  duration: Number,
  meetingLink: String,
  status: ["Scheduled", "Completed", "Cancelled"],
  notes: String
}
```

### 3. MockTest & Question Models (Existing)
- Ensure they are linked correctly to `JobId`.
- Add auto-evaluation logic in controller.

## 🚀 API Routes & Controllers

### 1. Application Controller
- `acceptApplication`: Sets status to `Accepted` and informs seeker.
- `updateStatus`: Enhanced to handle specific transitions.

### 2. Mock Test Controller
- `handleSubmitTest`: After scoring, if passed (> passingScore), update application status to `Interview`. If failed, move to `Rejected`.

### 3. Interview Controller - NEW
- `scheduleInterview`: For clients to set date/time/link.
- `getInterviews`: For both seeker and client.
- `updateInterviewStatus`: Completed/Cancelled.

### 4. Final Decision Controller
- `hireApplicant`: Sets status to `Hired`.
- `rejectApplicant`: Sets status to `Rejected`.

## 🎨 Frontend UI/UX

### 1. Client Dashboard
- Test Management: Create/Edit Mock Tests for jobs.
- Interview Scheduling: Form to set Zoom/Meet links.
- Applicant Tracking: Visual progress bar for each applicant.

### 2. Seeker Dashboard
- Active Invitations: "Take Test" or "Join Interview" buttons.
- Test Interface: Timer, fullscreen mode (anti-cheat), question navigation.
- Result View: Instant feedback for MCQ tests.

## 🛠️ Implementation Phasing

### Phase 1: Backend Foundations
- Update Models and Controllers.
- Implement auto-grading and status progression logic.

### Phase 2: Frontend Client Side
- Test creation forms.
- Interview scheduling modal.

### Phase 3: Frontend Seeker Side
- Test taking interface with timer.
- Interview list and join links.

### Phase 4: Notifications & Polish
- Set up notification triggers.
- Responsive design and animations.

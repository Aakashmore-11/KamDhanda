# KamDhanda: The Complete Documentation

KamDhanda is an enterprise-grade freelance ecosystem and job portal, engineered to bridge the gap between businesses and talent through a structured, automated, and secure workflow.

---

## 🏗️ 1. Technical Architecture & Tech Stack

### Backend (Node.js & Express)
*   **API Model**: RESTful API architecture.
*   **Database**: MongoDB (Mongoose ODM) for scalable data management.
*   **Real-time Interaction**: Socket.io integration across messaging and global notifications.
*   **Cloud Storage**: Cloudinary for high-performance delivery of user uploads (Images, PDFs).
*   **Payments**: Razorpay API for secure, multi-currency milestone transactions.
*   **Security Suite**:
    *   JWT for session persistence.
    *   OTP-based verification for critical actions.
    *   Crypto-grade encryption for private communications.

### Frontend (React & Vite)
*   **State Management**: Redux Toolkit for consistent global state across seeker/client flows.
*   **Styling**: Tailwind CSS with custom premium utility classes for a state-of-the-art UI/UX.
*   **Animations**: Framer Motion for smooth route transitions and micro-interactions.
*   **Routing**: React Router with protected route archetypes.

---

## 👥 2. User Roles & Ecosystem

### The Client (Employer/Project Owner)
Focuses on hiring efficiency and project oversight.
*   **Hiring Funnel**: Control over applications, mock test screening, and interview scheduling.
*   **Financial Control**: Lock and release funds based on milestone gratification.
*   **Admin Dashboard**: Statistical overview of active projects and spending.

### The Seeker (Freelancer/Candidate)
Focuses on career growth and secure earnings.
*   **Professional Dashboard**: Real-time tracking of applications and active project tasks.
*   **Skill Verification**: Showcase talent via integrated assessment tests.
*   **Wallet**: Transparency into held funds and completed earnings.

---

## 🚀 3. Core Features in Detail

### 📋 A. Structured Hiring Pipeline
KamDhanda replaces simple bidding with a high-fidelity recruitment funnel:
1.  **Application**: Seekers apply with custom cover letters and resume uploads.
2.  **Mock Test (Automated Screening)**: Success triggers an invitation to a timed MCQ test. The system auto-grades and filters candidates based on custom "Passing Scores".
3.  **Virtual Interview**: Automated scheduling for live video/audio calls with meeting link integration.
4.  **Hiring**: One-click transition from "Candidate" to "Hired Employee/Freelancer".

### 🏗️ B. Milestone-Based Project Workspace
Post-hire collaboration happens in a dedicated workspace:
*   **Modules**: Projects are segmented into clear milestones.
*   **Visual Tracking**: Progress bars (circular/linear) update dynamically as tasks are submitted.
*   **Deliverables**: Secure file sharing (PDF/Images) directly linked to project modules.

### 💳 C. Secure Financial Engine
*   **Escrow Mechanism**: Funds are securely processed via Razorpay and held until milestone verification.
*   **Milestone Payments**: Support for partial releases upon task completion.
*   **Transaction Logs**: Comprehensive history for compliance and accountability.

### 💬 D. Next-Gen Messaging Suite
A WhatsApp-style communication hub featuring:
*   **Real-time Socket Delivery**: Zero-latency message exchange.
*   **Media Support**: High-res image and document attachments.
*   **Threaded Chats**: Reply to specific messages and navigate complex threads.
*   **Reactions & Edits**: Expressive emoji reactions and an "Edit Message" feature (1-hour window).
*   **Privacy**: Optional end-to-end encryption for sensitive IP protection.

### 🤖 E. AI Integration (Gemini Core)
*   **KamDhanda AI**: A role-aware professional assistant.
*   **Features**: Automated job description drafting, proposal templates, and platform navigation help.

---

## 📂 4. Project Structure

### Backend (`/server`)
*   `controllers/`: Core business logic for all features.
*   `models/`: Mongoose schemas (User, Project, Application, MockTest, etc.).
*   `routes/`: API endpoint definitions with role-based middleware.
*   `config/`: Database, Mail, and Cloud service configurations.

### Frontend (`/client/src`)
*   `pages/Admin/`: Management dashboards.
*   `pages/Seeker/`: Candidate and freelancer workflows.
*   `pages/Clieent/`: Project owner and employer workflows.
*   `pages/JobPortal/`: Full-time employment discovery.
*   `store/`: Redux slices for auth, notifications, and UI state.
*   `components/`: Reusable high-fidelity UI elements.

---

## 📈 5. Platform Maturity & Security
KamDhanda is designed for scale with built-in:
*   **Global Notifications**: Integrated browser alerts and in-app red dots.
*   **OTP Verification**: Multi-factor safety for withdrawals and sensitive account changes.
*   **Premium Aesthetic**: Dark-themed, high-contrast UI designed for long-form professional use.

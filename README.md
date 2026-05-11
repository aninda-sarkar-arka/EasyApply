<p align="center">
  <img src="assets/logo.png" alt="EasyApply Logo" width="200" />
</p>

<h1 align="center">EasyApply</h1>

<p align="center">
  <strong>Your AI-Powered Career Assistant for Seamless Job Application Tracking</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintained" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/MERN-Stack-orange.svg" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-brightgreen.svg" alt="AI Gemini" />
</p>

---

## 🚀 Overview

**EasyApply** is a comprehensive job application management system built with the MERN stack. It goes beyond simple tracking by integrating cutting-edge AI features powered by Google Gemini to help job seekers optimize their resumes, generate cover letters, and prepare for interviews.

Managing multiple job applications can be overwhelming. EasyApply centralizes your search, provides visual insights into your progress, and gives you the tools to stand out in a competitive market.

## ✨ Key Features

### 🧠 AI-Powered Career Tools
- **Resume Review:** Get instant AI feedback on your resume's strengths and areas for improvement.
- **Job-Resume Matching:** Check how well your resume aligns with specific job descriptions.
- **Bullet Point Optimizer:** Transform weak experience points into high-impact, results-oriented bullets.
- **Cover Letter Generator:** Create tailored cover letters based on the job title and your profile.
- **Interview Prep:** Generate potential interview questions based on the job description you're applying for.

### 📊 Dashboard & Analytics
- **Visual Insights:** View your application trends and status distribution through interactive charts.
- **Activity Log:** Keep track of every update and change in your application journey.
- **Success Rate Tracking:** Monitor your progress from application to offer.

### 📁 Application Management
- **Centralized Tracking:** Store all job details, links, and documents in one place.
- **Status Workflow:** Update statuses (Applied, Interviewing, Offer, etc.) with ease.
- **Resume Versioning:** Manage multiple versions of your resume for different roles.
- **Note Management:** Document your interview experiences and key takeaways.

### 🛠️ Utilities
- **Data Export:** Export your application data to CSV for external use.
- **Deadlines:** Set and track application deadlines to never miss an opportunity.

## 💻 Tech Stack

- **Frontend:** React.js, React Router, Recharts, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **AI Integration:** Google Generative AI (Gemini Pro)
- **Authentication:** JSON Web Tokens (JWT) & BcryptJS
- **File Handling:** Multer (for resume uploads)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB account (Atlas or local)
- Google AI (Gemini) API Key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/EasyApply.git
cd EasyApply
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

## 📂 Project Structure

```text
EasyApply/
├── assets/             # Branding and static assets
├── backend/            # Express.js server
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers (Logic)
│   ├── middleware/     # Auth and error middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions (AI, CSV)
│   └── server.js       # Entry point
└── frontend/           # React application
    ├── public/         # Static files
    └── src/            # Source code
        ├── components/ # Reusable UI components
        ├── context/    # State management
        ├── pages/      # View components
        └── services/   # API communication
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

---

<p align="center">Made with ❤️ for Job Seekers</p>

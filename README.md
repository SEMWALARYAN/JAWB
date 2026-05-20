# JAWB - Job Portal

JAWB is a full-stack job portal web application that features a unique, vibrant aesthetic. It provides a complete workflow for both **Applicants** and **Recruiters** with dedicated dashboards, real-time application tracking, chat functionalities, and engaging animations.

## Tech Stack (MERN)

The application is built using the MERN stack:

- **M**ongoDB: NoSQL database used to store users, jobs, and applications.
- **E**xpress.js: Web application framework for Node.js used to build the REST API.
- **R**eact: Frontend library used to build the user interface (bootstrapped with Vite).
- **N**ode.js: JavaScript runtime environment for the backend server.

### Frontend Details
- **Framework**: React (via Vite)
- **Styling**: Tailwind CSS (with a custom configuration for pop-manga colors, borders, and shadows)
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend Details
- **Framework**: Express.js on Node.js
- **Database**: MongoDB (connected via Mongoose)
- **File Uploads**: Multer (for handling resume uploads)
- **CORS & Middleware**: Configured to accept requests from the frontend with proper JSON parsing.

---

## Architecture & Data Flow

The project is split into two main directories: `frontend` and `backend`.

1. **Frontend (`/frontend`)**: 
   - Hosts the React application.
   - Contains components like `DashboardLayout`, `ApplicantDashboard`, and `RecruiterDashboard`.
   - Makes REST API calls to the backend to fetch job listings, submit applications, and update application statuses.
   - Saves user authentication/session state in `localStorage`.

2. **Backend (`/backend`)**: 
   - Hosts the Node.js/Express server.
   - Provides API routes (`/api/users`, `/api/jobs`, `/api/applications`).
   - Controllers handle the business logic (e.g., `jobController.js`, `applicationController.js`).
   - Configures the database connection in `config/db.js`.

---

## Database Schema (MongoDB / Mongoose)

The application relies on three primary data models:

### 1. User
Stores authentication and role information.
- `_id`: ObjectId
- `name`: String (User's full name)
- `email`: String (Unique email address)
- `password`: String (Hashed password for security)
- `role`: String (Enum: `'applicant'`, `'recruiter'`)
- `createdAt` / `updatedAt`: Timestamps

### 2. Job
Stores job postings created by recruiters.
- `_id`: ObjectId
- `title`: String (Job title)
- `description`: String (Detailed job description)
- `companyName`: String (Name of the hiring company)
- `location`: String (Job location)
- `salaryRange`: Object (`min`: Number, `max`: Number)
- `employmentType`: String (e.g., Full-time, Part-time)
- `recruiterId`: ObjectId (References the `User` who created the job)
- `createdAt` / `updatedAt`: Timestamps

### 3. Application
Links an Applicant to a Job and tracks the hiring pipeline.
- `_id`: ObjectId
- `jobId`: ObjectId (References the `Job` being applied to)
- `applicantId`: ObjectId (References the `User` applying)
- `resumeUrl`: String (Path to the uploaded resume file)
- `coverLetter`: String (Optional text)
- `status`: String (Enum: `'Applied'`, `'Shortlisted'`, `'Interview Scheduled'`, `'Hired'`, `'Rejected'`)
- `messages`: Array of Objects (Stores chat messages between the recruiter and the applicant)
  - `sender`: ObjectId
  - `text`: String
  - `timestamp`: Date
- `interview`: Object (Optional)
  - `date`: Date
  - `time`: String
  - `link`: String (Meeting link)
- `createdAt` / `updatedAt`: Timestamps

---

## Application Workflows

### Recruiter Workflow
1. Log in to the platform as a Recruiter.
2. View the **Recruiter Dashboard** to see all active job postings and the total number of new applications.
3. Review applications for specific jobs.
4. Update application statuses (`Shortlisted`, `Interview Scheduled`, `Hired`, `Rejected`).
5. Chat with shortlisted applicants to coordinate next steps.

### Applicant Workflow
1. Log in to the platform as an Applicant.
2. Browse available job postings on the **Applicant Dashboard**.
3. Apply to a job by uploading a resume (triggers an animated success overlay).
4. Track application history in the "My Applications" tab.
5. Receive dynamic visual feedback (cat GIFs and banners) based on the application status:
   - **Applied**: Success confirmation modal.
   - **Shortlisted**: Floating notification banner and the ability to chat with the recruiter.
   - **Interview Scheduled**: Dedicated card with interview date, time, and meeting link.
   - **Hired/Rejected**: Status-specific animated components celebrating the hire or encouraging the applicant for their next journey.

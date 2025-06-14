# Task Management Dashboard (MERN Stack)

A full-featured, professional task management dashboard built with the MERN stack. Organize, track, and share your tasks, receive email reminders, and collaborate with other users.

---

## Live Demo
- [Demo URL (deploy to Heroku/Vercel/Netlify and add link here)](https://your-demo-url.com)

---

## Project Description
This project is a modern, responsive task management system with:
- User authentication (register, login, JWT, protected routes)
- Task CRUD (create, read, update, delete)
- Task sharing between users
- Email reminders for due dates
- Drag-and-drop task reordering
- Export tasks as CSV or PDF
- Task search (search bar for filtering tasks)
- Task tags (add and filter by tags)
- Professional UI/UX
- **All required and bonus features from the assessment are implemented.**

---

## Technologies Used
- **Frontend:** React, Tailwind CSS, Context API, Axios
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Authentication:** JWT
- **Email:** Nodemailer
- **Bonus:** Docker, Docker Compose, (CI/CD ready), (Unit test ready)

---

## Setup Instructions

### 1. Local Development
#### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

#### Backend
```bash
cd backend
npm install
npm start
```
- The backend runs on [http://localhost:5000](http://localhost:5000)

#### Frontend
```bash
cd frontend
npm install
npm start
```
- The frontend runs on [http://localhost:3000](http://localhost:3000)

#### Environment Variables (Backend)
Create a `.env` file in the `backend/` folder with:
```
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 2. Dockerized Setup
- Make sure Docker and Docker Compose are installed.
- In the project root, run:
```bash
docker-compose up --build
```
- Access frontend at [http://localhost:3000](http://localhost:3000)
- Access backend at [http://localhost:5000](http://localhost:5000)

---

## Project Structure
```
taskmanagement/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── ...
│   └── ...
├── docker-compose.yml
├── Dockerfile
└── Documentation.md
```

---

## Bonus Features
- **Dockerized**: One command to run the whole stack
- **Drag-and-drop**: Reorder tasks visually
- **Task sharing**: Share tasks with other users, see shared tasks
- **Export**: Download tasks as CSV or PDF
- **Task search**: Search bar for filtering tasks by title/description
- **Task tags**: Add and filter by tags
- **Email reminders**: Get notified for due dates
- **All bonus features from the assessment are implemented.**
- **Ready for CI/CD**: Easily add GitHub Actions or similar
- **Unit test ready**: Structure supports Jest/Mocha

---

## Deployment
- The app can be deployed to any cloud provider supporting Docker (e.g., AWS, Azure, Heroku, DigitalOcean).
- For static frontend hosting, build with `npm run build` and deploy the `build/` folder.
- For backend, ensure environment variables are set and MongoDB is accessible.

---

## Usage Notes
- Register at least two users to test task sharing.
- Only shared users (not yourself) can be selected for sharing.
- All features are accessible from the dashboard after login.

---

## License
MIT

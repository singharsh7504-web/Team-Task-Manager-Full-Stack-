# TaskFlow — Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control (Team Lead / Member).

**Live URL**: _Add after Railway deployment_  
**GitHub Repo**: _Add your repo URL here_

---

## Features

- 🔐 **Role-Based Auth** — JWT-based Signup/Login with Team Lead and Member roles
- 📁 **Project Management** — Leads can create, edit, and delete projects
- ✅ **Task Management** — Create, assign, update, and delete tasks with status tracking
- 🗑️ **Deletion History** — All deleted tasks are logged for Team Lead audit
- 🔔 **Notifications** — Team Lead is notified with a task count summary when a member completes a task
- 📊 **Dashboard** — Stats overview: total, pending, in-progress, completed, and overdue tasks
- 👥 **Role Views** — Team Leads see all; Members only see their assigned tasks

---

## Tech Stack

| Layer    | Technology                        |
|----------|------------------------------------|
| Frontend | React (Vite), Vanilla CSS          |
| Backend  | Node.js, Express.js                |
| Database | MongoDB (Mongoose ODM)             |
| Auth     | JWT + bcryptjs                     |
| Deploy   | Railway                            |

---

## Local Development

### Prerequisites
- Node.js v18+
- MongoDB Atlas URI (or local MongoDB)

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd team-task-manager

# 2. Install root dependencies (backend)
npm install

# 3. Install frontend dependencies
npm install --prefix frontend

# 4. Configure environment
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# 5. Run both servers concurrently
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the root:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## API Endpoints

### Auth
| Method | Endpoint              | Role   | Description        |
|--------|-----------------------|--------|--------------------|
| POST   | /api/auth/register    | Public | Register user      |
| POST   | /api/auth/login       | Public | Login user         |
| GET    | /api/auth/members     | Auth   | Get all members    |

### Projects
| Method | Endpoint             | Role      | Description        |
|--------|----------------------|-----------|--------------------|
| GET    | /api/projects        | Auth      | Get all projects   |
| POST   | /api/projects        | Team Lead | Create project     |
| PUT    | /api/projects/:id    | Team Lead | Update project     |
| DELETE | /api/projects/:id    | Team Lead | Delete project     |

### Tasks
| Method | Endpoint             | Role      | Description           |
|--------|----------------------|-----------|-----------------------|
| GET    | /api/tasks           | Auth      | Get tasks             |
| POST   | /api/tasks           | Team Lead | Create task           |
| PUT    | /api/tasks/:id       | Auth      | Update task/status    |
| DELETE | /api/tasks/:id       | Team Lead | Delete task + history |
| GET    | /api/tasks/history   | Team Lead | View deletion history |
| GET    | /api/tasks/stats     | Auth      | Dashboard stats       |

### Notifications
| Method | Endpoint                        | Role      | Description           |
|--------|---------------------------------|-----------|-----------------------|
| GET    | /api/notifications              | Team Lead | Get notifications     |
| PUT    | /api/notifications/:id/read     | Team Lead | Mark one as read      |
| PUT    | /api/notifications/read-all     | Team Lead | Mark all as read      |

---

## Railway Deployment

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project from your GitHub repo
3. Add environment variables in Railway dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Railway will run `npm start` → `node server.js`
5. The Express server serves the pre-built React frontend from `frontend/dist/`

> **Before deploying**, run `npm run build` locally to verify the frontend builds without errors.

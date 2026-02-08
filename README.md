# SVP International Clone

A full-stack clone of the SVP International Professional Accreditation website.

## 🚀 Quick Start

### Backend (SQL Server + Node.js)

```bash
cd svp-backend

# Install dependencies
npm install

# Initialize database (creates tables + sample data)
npm run db:init

# Add applicants table
npm run db:migrate

# Start development server
npm run dev
```

**Server runs on:** `http://localhost:5000`

### Frontend (React + Vite)

```bash
cd svp-clone

# Install dependencies
npm install

# Start development server
npm run dev
```

**App runs on:** `http://localhost:5173`

---

## 📚 API Documentation

Access full API docs at: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificates` | Get all certificates |
| GET | `/api/certificates/verify` | Verify certificate (public) |
| GET | `/api/certificates/:id` | Get single certificate |
| POST | `/api/certificates` | Create certificate |
| PUT | `/api/certificates/:id` | Update certificate |
| DELETE | `/api/certificates/:id` | Delete certificate |

### Labor Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/labor-results` | Get all results |
| GET | `/api/labor-results/check` | Check result (public) |
| POST | `/api/labor-results` | Create result |
| PUT | `/api/labor-results/:id` | Update result |
| DELETE | `/api/labor-results/:id` | Delete result |

### Support Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support` | Get all tickets |
| GET | `/api/support/:id` | Get single ticket |
| POST | `/api/support` | Submit ticket (public) |
| PUT | `/api/support/:id` | Update ticket status |
| DELETE | `/api/support/:id` | Delete ticket |

### Applicants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applicants` | Get all applicants |
| GET | `/api/applicants/:id` | Get single applicant |
| POST | `/api/applicants` | Create applicant |
| PUT | `/api/applicants/:id/status` | Update status |
| PUT | `/api/applicants/:id/verification` | Update verification |
| DELETE | `/api/applicants/:id` | Delete applicant |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| PUT | `/api/users/:id/password` | Update password |
| DELETE | `/api/users/:id` | Delete user |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/passport` | Upload passport image |
| POST | `/api/upload/certificate` | Upload certificate |
| POST | `/api/upload/document` | Upload general document |
| DELETE | `/api/upload/:filename` | Delete uploaded file |

---

## 🔐 Admin Panel

Access admin panel at: `http://localhost:5173/admin/login`

**Demo Credentials:**
- Email: `admin@svp.com`
- Password: `admin123`

### Features:
- 📜 **Certificates** - Full CRUD management
- 👷 **Labor Results** - Full CRUD management
- 🎫 **Support Tickets** - View & update status
- 📋 **Applicants** - Review sign-up applications
- 👤 **Users** - User management

---

## 🗄️ Database Schema

### Tables:
- `users` - Admin/user accounts
- `certificates` - Certificate records
- `labor_results` - Labor test results
- `support_tickets` - Support requests
- `applicants` - Sign-up applications

---

## 📁 Project Structure

```
A-main/
├── svp-clone/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard
│   │   │   └── auth/       # Login/Signup
│   │   └── App.tsx         # Main app routes
│   └── package.json
│
├── svp-backend/            # Backend (Node.js + Express)
│   ├── database/           # DB connection & scripts
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── certificates.js
│   │   ├── laborResults.js
│   │   ├── support.js
│   │   ├── applicants.js
│   │   ├── users.js
│   │   └── upload.js
│   ├── uploads/            # Uploaded files
│   ├── server.js           # Main server
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

Create `.env` in `svp-backend/`:

```env
DB_SERVER=(localdb)\MSSQLLocalDB
DB_NAME=svp_database
PORT=5000
JWT_SECRET=your-secret-key-here
```

---

## 🛠️ Technologies

### Frontend:
- React 18
- Vite
- TypeScript
- TailwindCSS
- Framer Motion
- React Router

### Backend:
- Node.js
- Express.js
- SQL Server (LocalDB)
- JWT Authentication
- Multer (file uploads)
- bcryptjs (password hashing)
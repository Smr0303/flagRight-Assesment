<p align='center'>
<img src='.frontend/src/assets/logo.svg'  width='25%'>
</p>

<p align='center'>
<b>Transaction Management CRUD API</b>
</p>

---

## 🧾 Project Description

A comprehensive Transaction Management API that enables companies to manage, track, and analyze their transactions efficiently. The system supports role-based access control with different levels of permissions for administrators, CEOs, and employees.

## 🧾 Key Assumptions

- The system is designed for a single company with multiple user roles (Admin, CEO, Employee, etc.)
- Only company administrators have access to user registration and CRON job management
- All other features are accessible to all authenticated users within the company
- Transaction data follows the Flagright Docs Transaction schema with an additional description field

## ✨ Features

### Core Features

- [x] Complete CRUD operations for transactions
- [x] Role-based access control
- [x] Automated transaction generation via CRON job
- [x] Advanced search and filtering capabilities
- [x] Transaction reporting and analytics
- [x] Paginated responses for optimal performance
- [x] Dashboard for transaction management

### User Roles & Permissions

**Admin**
- Full system access
- User registration management
- CRON job control (start/stop)
- All transaction operations

**Other Roles (CEO, Employees)**
- View transactions
- Create transactions
- Search and filter transactions
- Generate reports
- Access dashboard

### Transaction Management

- [x] Create new transactions with custom details
- [x] Retrieve transactions by ID
- [x] Search transactions by multiple criteria:
  - User ID (mandatory)
  - Date range (mandatory)
  - Description (mandatory)
  - Tags (mandatory)
  - Amount
  - Country
  
### Dashboard Features

- [x] Real-time transaction monitoring
- [x] Advanced filtering system
- [x] Sorting capabilities:
  - Amount (mandatory)
  - Timestamp (mandatory)
- [x] CRON job control panel (admin only)
- [x] Transaction analytics and reporting

## ⚙ Technical Stack

### Backend
- Node.js
- Express.js
- MongoDB (with proper indexing)
- JWT Authentication
- Docker

### Frontend
- React.js
- Material UI/Chakra UI
- Redux for state management
<!-- 
## 🛠 Installation and Setup

1. Clone the repository:
```javascript
git clone [repository-url]
```

2. Install dependencies:

```javascript
npm install
```3.

Set up environment variables:

Create .env file
cp .env.example .env

# Configure your variables in .env file
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

Start the development server:

bashCopy# Start in development mode
npm run dev

# Start in production mode
npm start

For Docker deployment:

bashCopy# Build and run using Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d
The server should be running on http://localhost:5000 (or the port you specified in .env) -->

<<<<<<< HEAD
# MIT & MU Laptop Registration and Verification System

A modern, secure, and efficient web application designed to track and verify student laptops within the university campus. This system helps prevent theft and ensures that only authorized devices are moved in and out of the campus.

## 🚀 Features

### For Students
- **Account Management**: Register with a unique University ID and multi-part name (First, Father's, and Grandfather's names).
- **Device Registration**: Register multiple laptops with serial numbers, MAC addresses, and color descriptions.
- **Secure Access**: Update passwords securely using a dedicated verification flow.

### For Security Guards
- **Real-time Verification**: Search for devices by Serial Number, MAC Address, or Student ID.
- **Location Tracking**: Mark devices as "In Campus" or "Out of Campus" at checkpoints.
- **Owner Validation**: Instantly view student details to confirm ownership.

### For Administrators
- **System Overview**: Monitor real-time campus activity and statistics.
- **Identity Management**: Correct student identification records and manage user accounts.
- **Activity Feed**: Track all check-in/check-out events across the campus.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JSON Web Tokens (JWT) with Bcrypt password hashing.

## 🏁 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB running locally or on a cluster

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd laptop_registration_app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file with JWT_SECRET and MONGODB_URI
   node server.js
   ```

3. **Setup Frontend**
   ```bash
   cd ..
   npm install
   npm run dev
   ```

## 📂 Project Structure

- `/src/pages`: Individual dashboard and auth pages.
- `/src/components`: Reusable UI components (like the ChangePasswordModal).
- `/src/context`: Auth context for session management.
- `/backend/models`: Mongoose schemas for Users, Laptops, and Activity.
- `/backend/routes`: Express API endpoints.
- `/backend/middleware`: Authentication and authorization logic.

## 📄 License

This project is developed for the Laptop Registration and Verification System.
=======
# MIT-security
a web based laptop verification app
>>>>>>> 5f296111c22c8e19abe14a68eeb4aba3cf26fffc

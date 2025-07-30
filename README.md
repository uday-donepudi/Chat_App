# Real-Time Chat Application

A modern, full-stack real-time chat application built with React.js, Node.js, Express, MongoDB, and Socket.IO.


## Tech Stack

### Frontend

- **React.js** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Vite** - Fast development server and build tool

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm package manager

### Backend Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd chat_app/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Variables**
   Create a `.env` file in the backend directory:

```env
PORT=YOUR_BACKEND_PORT
MONGODB_URI=MONGODB_ATLAS_URL
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=http://localhost:5173
```

4. **Start the backend server**

```bash
npm start
```

The backend server will run on `http://localhost:PORT`

### Frontend Setup

1. **Navigate to frontend directory**

```bash
cd ../frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Contact

For support or questions, please contact with Email address.

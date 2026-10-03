# ChatApp

A full-stack real-time chat application with user authentication, live messaging, online presence, unread messages, and media uploads.

This project was originally working in production and was restored to support deployment across:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media storage: Cloudinary

## Tech Stack

### Frontend
- React
- Vite
- Axios
- Socket.IO client
- Zustand
- Tailwind-inspired CSS styling

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Cloudinary integration

## Features
- User signup and login
- Secure JWT-based authentication
- Real-time messaging
- Online/offline participant tracking
- Unread message states
- File and image upload support
- MongoDB-backed persistence
- Deployment-friendly environment configuration

## Project Structure

```bash
chat-app/
├── chat-frontend/        # React + Vite frontend
├── chat-backend/         # Node.js + Express API + Socket.IO server
├── README.md             # Project documentation
├── ChatApp_Interview_Guide.pdf
├── ChatApp_Interview_Guide.html
└── package-lock.json
```

## Local Development

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Chat-App
```

### 2. Setup backend

```bash
cd chat-backend
npm install
```

Create a `.env` file in `chat-backend` with values like:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/chatapp
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then start:

```bash
npm run dev
```

### 3. Setup frontend

```bash
cd ../chat-frontend
npm install
```

Create a `.env` file in `chat-frontend` with:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Then start:

```bash
npm run dev
```

## Production Deployment

### Frontend (Vercel)
Set environment variables in Vercel:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

### Backend (Render)
Set environment variables in Render:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/chatapp
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Important Deployment Notes

- Do not use `localhost` in production frontend or socket URLs.
- Use the public Render backend URL in `VITE_API_URL` and `VITE_SOCKET_URL`.
- MongoDB Atlas must have a valid cluster and proper network access.
- Cloudinary stores files/images, while MongoDB stores metadata and the file URL.
- The backend should be deployed to Render and the frontend to Vercel as separate services.

## File Storage Architecture

This app follows a common media-storage pattern:
- Cloudinary stores the actual file/image
- MongoDB stores metadata such as the file URL, filename, and related message information

This allows the app to quickly reference uploaded media while keeping storage efficient.

## Production Behavior Notes

This project was updated to handle common deployment issues:
- use environment-based API URLs instead of localhost defaults
- avoid blocking app startup when Cloudinary is not configured
- maintain real-time online user status more reliably
- improve login and registration UI styling

## Common Production Issues Fixed
- Frontend pointing to localhost instead of deployed backend
- MongoDB cluster being deleted or not reachable
- Wrong production URLs in frontend env values
- Cloudinary misconfiguration blocking backend startup
- Online participant state not syncing correctly

## Run Commands

### Backend
```bash
cd chat-backend
npm install
npm run dev
```

### Frontend
```bash
cd chat-frontend
npm install
npm run dev
```

## Useful Links
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.onrender.com`
- MongoDB Atlas: `https://cloud.mongodb.com`
- Cloudinary: `https://cloudinary.com`

## Notes

This project is intended to be pushed to GitHub and deployed with environment variables configured in the hosting platform. If the frontend is connected to GitHub, pushing changes will trigger a Vercel redeploy.

## License

This project is for learning and deployment demonstration purposes.

# Sosyal Backend API

A NestJS backend for the Sosyal social media platform, featuring user management, authentication, and real-time messaging.

## Features

- **User Management**: Customer and service provider registration and profiles
- **Authentication**: JWT-based authentication with refresh tokens
- **Real-time Messaging**: Socket.io integration for instant messaging
- **MongoDB Integration**: Mongoose ODM for data persistence
- **Search & Filtering**: Advanced user search with filters
- **File Upload Support**: Profile photo management
- **Online Status**: Real-time user online/offline tracking

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT with Passport
- **Validation**: Class-validator
- **Language**: TypeScript

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd sosyal-be
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/sosyal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Testing
```bash
npm run test
npm run test:e2e
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `POST /api/users` - Create new user
- `GET /api/users` - Get all users
- `GET /api/users/search` - Search users
- `GET /api/users/service-providers` - Get service providers
- `GET /api/users/customers` - Get customers
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/conversations/:id` - Get conversation messages
- `PATCH /api/messages/:id/read` - Mark message as read
- `PATCH /api/messages/conversations/:id/read` - Mark conversation as read
- `DELETE /api/messages/:id` - Delete message
- `PATCH /api/messages/:id` - Edit message
- `GET /api/messages/unread-count` - Get unread message count

## WebSocket Events

### Client to Server
- `message:send` - Send a message
- `message:read` - Mark message as read
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `user:typing` - User typing status

### Server to Client
- `message:receive` - Receive a message
- `message:sent` - Message sent confirmation
- `message:read` - Message read confirmation
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## Database Schema

### User
- Basic info (name, email, phone, city, birth date)
- User type (customer/service provider)
- Business info (for service providers)
- Profile photos
- Online status and last seen
- Rating and review count

### Message
- Sender and receiver IDs
- Content and type
- Status (sent, delivered, read)
- Timestamps
- File attachments support

### Conversation
- Participants
- Last message info
- Unread counts
- Group chat support

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:5173` |

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # JWT guards
│   ├── strategies/      # Passport strategies
│   └── auth.module.ts   # Auth module
├── users/               # User management module
│   ├── dto/             # User DTOs
│   ├── schemas/         # User schemas
│   └── users.module.ts  # Users module
├── messages/            # Messaging module
│   ├── schemas/         # Message schemas
│   └── messages.module.ts # Messages module
├── chat/                # Real-time chat module
│   ├── guards/          # WebSocket guards
│   └── chat.module.ts   # Chat module
├── app.module.ts        # Main application module
├── main.ts              # Application entry point
└── app.controller.ts    # Main app controller
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

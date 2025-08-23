# Sosyal Backend API

A modern NestJS backend for the Sosyal social media platform, featuring user management, authentication, and real-time messaging capabilities.

## 🚀 Features

- **User Management**: Customer and service provider registration and profile management
- **Authentication**: JWT-based authentication with refresh token mechanism
- **Real-time Messaging**: Socket.io integration for instant messaging
- **MongoDB Integration**: Mongoose ODM for robust data persistence
- **Advanced Search**: User search with filters and pagination
- **File Upload Support**: Profile photo management with validation
- **Online Status Tracking**: Real-time user online/offline status
- **Message Management**: Full CRUD operations for conversations and messages

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v10.0.0
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) v7.0.0
- **Real-time**: [Socket.io](https://socket.io/) v4.7.0
- **Authentication**: [JWT](https://jwt.io/) with [Passport](https://www.passportjs.org/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator) v0.14.0
- **Language**: [TypeScript](https://www.typescriptlang.org/) v5.1.3
- **Testing**: [Jest](https://jestjs.io/) v29.5.0

## 📋 Prerequisites

- **Node.js**: v18 or higher (LTS recommended)
- **MongoDB**: Atlas account or local instance
- **Package Manager**: npm or yarn
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd sosyal-be

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Environment Variables
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sosyal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 4. Start the Application
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User authentication |
| `POST` | `/api/auth/refresh` | Refresh JWT token |
| `POST` | `/api/auth/logout` | User logout |
| `GET` | `/api/auth/profile` | Get user profile |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create new user |
| `GET` | `/api/users` | Get all users (paginated) |
| `GET` | `/api/users/search` | Search users with filters |
| `GET` | `/api/users/service-providers` | Get service providers |
| `GET` | `/api/users/customers` | Get customers |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update user profile |
| `DELETE` | `/api/users/:id` | Delete user account |

### Messaging System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/messages` | Send new message |
| `GET` | `/api/messages/conversations` | Get user conversations |
| `GET` | `/api/messages/conversations/:id` | Get conversation messages |
| `PATCH` | `/api/messages/:id/read` | Mark message as read |
| `PATCH` | `/api/messages/conversations/:id/read` | Mark conversation as read |
| `DELETE` | `/api/messages/:id` | Delete message |
| `PATCH` | `/api/messages/:id` | Edit message |
| `GET` | `/api/messages/unread-count` | Get unread message count |

## 🔌 WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ content, receiverId, type }` | Send a message |
| `message:read` | `{ messageId }` | Mark message as read |
| `typing:start` | `{ receiverId }` | Start typing indicator |
| `typing:stop` | `{ receiverId }` | Stop typing indicator |
| `user:typing` | `{ receiverId, isTyping }` | User typing status |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message:receive` | `Message object` | Receive a message |
| `message:sent` | `{ messageId, status }` | Message sent confirmation |
| `message:read` | `{ messageId, readAt }` | Message read confirmation |
| `typing:start` | `{ userId, isTyping }` | User started typing |
| `typing:stop` | `{ userId, isTyping }` | User stopped typing |
| `user:online` | `{ userId, onlineAt }` | User came online |
| `user:offline` | `{ userId, offlineAt }` | User went offline |

## 🗄️ Database Schema

### User Schema
```typescript
{
  name: String,           // User's full name
  email: String,          // Unique email address
  phone: String,          // Phone number
  city: String,           // City of residence
  birthDate: Date,        // Date of birth
  userType: String,       // 'customer' or 'service-provider'
  businessInfo: Object,   // Business details (for service providers)
  profilePhotos: [String], // Array of photo URLs
  onlineStatus: Boolean,  // Current online status
  lastSeen: Date,         // Last activity timestamp
  rating: Number,         // Average rating
  reviewCount: Number     // Total number of reviews
}
```

### Message Schema
```typescript
{
  senderId: ObjectId,     // Reference to sender user
  receiverId: ObjectId,   // Reference to receiver user
  content: String,        // Message content
  type: String,           // 'text', 'image', 'file'
  status: String,         // 'sent', 'delivered', 'read'
  timestamp: Date,        // Message creation time
  attachments: [String]   // Array of file URLs
}
```

### Conversation Schema
```typescript
{
  participants: [ObjectId], // Array of user IDs
  lastMessage: ObjectId,    // Reference to last message
  unreadCounts: Object,    // Unread count per participant
  isGroup: Boolean,         // Group chat flag
  createdAt: Date,          // Conversation creation time
  updatedAt: Date           // Last activity time
}
```

## ⚙️ Configuration

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | - |
| `JWT_SECRET` | JWT signing secret | ✅ | - |
| `JWT_EXPIRES_IN` | JWT expiration time | ❌ | `7d` |
| `PORT` | Server port | ❌ | `3001` |
| `NODE_ENV` | Environment mode | ❌ | `development` |
| `CORS_ORIGIN` | CORS allowed origin | ❌ | `http://localhost:5173` |

## 🏗️ Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data transfer objects
│   │   └── login.dto.ts    # Login request DTO
│   ├── guards/              # JWT authentication guards
│   │   └── jwt-auth.guard.ts
│   ├── strategies/          # Passport strategies
│   │   └── jwt.strategy.ts # JWT strategy implementation
│   ├── auth.controller.ts   # Authentication endpoints
│   ├── auth.service.ts      # Authentication business logic
│   └── auth.module.ts      # Auth module configuration
├── users/                   # User management module
│   ├── dto/                 # User DTOs
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── schemas/             # Mongoose schemas
│   │   └── user.schema.ts   # User data model
│   ├── users.controller.ts  # User endpoints
│   ├── users.service.ts     # User business logic
│   └── users.module.ts     # Users module configuration
├── messages/                # Messaging module
│   ├── schemas/             # Message schemas
│   │   ├── message.schema.ts
│   │   └── conversation.schema.ts
│   ├── messages.controller.ts # Message endpoints
│   ├── messages.service.ts   # Message business logic
│   └── messages.module.ts    # Messages module configuration
├── chat/                    # Real-time chat module
│   ├── guards/              # WebSocket guards
│   │   └── ws-jwt.guard.ts # WebSocket JWT guard
│   ├── chat.gateway.ts      # Socket.io gateway
│   └── chat.module.ts       # Chat module configuration
├── app.controller.ts         # Main application controller
├── app.service.ts            # Main application service
├── app.module.ts             # Root application module
└── main.ts                   # Application entry point
```

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |

### Code Quality

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Jest**: Comprehensive testing framework

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB URI in `.env` file
   - Check network connectivity
   - Ensure MongoDB service is running

2. **JWT Authentication Errors**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings
   - Ensure proper token format in requests

3. **WebSocket Connection Issues**
   - Verify CORS configuration
   - Check JWT token validity
   - Ensure proper authentication headers

4. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process on port 3001
   - Use `netstat -ano | findstr :3001` (Windows) or `lsof -i :3001` (Unix)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow NestJS best practices
- Write comprehensive tests
- Update documentation as needed
- Use conventional commit messages
- Ensure code passes linting

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [NestJS Docs](https://docs.nestjs.com/)
- **Community**: [NestJS Discord](https://discord.gg/nestjs)

---

**Built with ❤️ using NestJS**

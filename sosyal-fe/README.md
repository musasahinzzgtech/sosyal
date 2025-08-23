# Sosyal Frontend

A React-based frontend for the Sosyal social media platform, featuring user registration, authentication, and real-time messaging.

## Features

- **User Registration**: Customer and service provider registration forms
- **Authentication**: JWT-based login/logout system
- **Real-time Messaging**: WebSocket integration for instant messaging
- **Responsive Design**: Modern UI built with Tailwind CSS
- **State Management**: Redux for global state, Context for auth

## Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + React Context
- **Routing**: React Router DOM
- **Real-time**: Socket.io Client
- **Build Tool**: Vite

## Backend Integration

This frontend is designed to work with the Sosyal NestJS backend:

- **API Base URL**: `http://localhost:3001/api`
- **WebSocket URL**: `http://localhost:3001/chat`
- **Authentication**: JWT tokens with refresh mechanism

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Sosyal backend running on port 3001
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## API Services

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

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/conversations/:id` - Get conversation messages

## WebSocket Events

### Client to Server
- `message:send` - Send a message
- `message:read` - Mark message as read
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server to Client
- `message:receive` - Receive a message
- `message:sent` - Message sent confirmation
- `message:read` - Message read confirmation
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx      # Main layout component
├── contexts/            # React contexts
│   └── AuthContext.jsx # Authentication context
├── pages/               # Page components
│   ├── Home.jsx        # Home page
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Messages.jsx    # Messaging page
│   └── ...             # Other pages
├── services/            # API and WebSocket services
│   ├── api.js          # REST API service
│   └── socket.js       # WebSocket service
├── store/               # Redux store
│   ├── index.js        # Store configuration
│   └── slices/         # Redux slices
├── App.jsx              # Main app component
└── main.jsx            # App entry point
```

## Environment Configuration

The frontend automatically connects to the backend at:
- **API**: `http://localhost:3001/api`
- **WebSocket**: `http://localhost:3001/chat`

To change these URLs, update the constants in:
- `src/services/api.js` - API_BASE_URL
- `src/services/socket.js` - WebSocket URL

## Authentication Flow

1. **Registration**: User fills out registration form → Backend creates user account
2. **Login**: User provides credentials → Backend validates and returns JWT tokens
3. **Token Storage**: Frontend stores access and refresh tokens in localStorage
4. **WebSocket Connection**: Frontend connects to WebSocket server with JWT token
5. **API Requests**: All subsequent API requests include JWT token in Authorization header
6. **Token Refresh**: When access token expires, frontend automatically refreshes using refresh token
7. **Logout**: User logs out → Frontend clears tokens and disconnects WebSocket

## Real-time Messaging

The messaging system uses both REST API and WebSocket:

- **REST API**: For message persistence and conversation management
- **WebSocket**: For real-time message delivery and typing indicators

### Message Flow
1. User types message and sends
2. Frontend sends message via WebSocket for immediate delivery
3. Frontend also sends message via REST API for persistence
4. Backend stores message in database
5. Backend broadcasts message to recipient via WebSocket
6. Recipient receives message in real-time

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend
   - Verify MongoDB connection

2. **WebSocket Connection Failed**
   - Check if backend WebSocket server is running
   - Verify JWT token is valid
   - Check browser console for errors

3. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check JWT token expiration
   - Verify backend JWT secret configuration

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Test with both frontend and backend
4. Update documentation as needed

## License

This project is licensed under the ISC License.

# Sosyal Frontend

A modern React-based frontend for the Sosyal social media platform, featuring user registration, authentication, and real-time messaging with a beautiful, responsive design.

## 🚀 Features

- **User Registration**: Customer and service provider registration forms with validation
- **Authentication**: JWT-based login/logout system with secure token management
- **Real-time Messaging**: WebSocket integration for instant messaging and typing indicators
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS v4
- **State Management**: Redux Toolkit for global state, React Context for authentication
- **Modern React**: Built with React 19 and latest hooks patterns
- **Real-time Updates**: Live user status, message notifications, and typing indicators

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) v19.1.1
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4.1.12
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) v2.8.2 + React Context
- **Routing**: [React Router DOM](https://reactrouter.com/) v7.8.2
- **Real-time**: [Socket.io Client](https://socket.io/docs/v4/client-api/) v4.8.1
- **Build Tool**: [Vite](https://vitejs.dev/) v7.1.2
- **Package Manager**: npm

## 🔗 Backend Integration

This frontend is designed to work seamlessly with the Sosyal NestJS backend:

- **API Base URL**: `http://localhost:3001/api`
- **WebSocket URL**: `http://localhost:3001/chat`
- **Authentication**: JWT tokens with automatic refresh mechanism
- **CORS**: Configured for local development

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18 or higher (LTS recommended)
- **Sosyal Backend**: Running on port 3001
- **Package Manager**: npm or yarn
- **Git**: For version control

### Installation

1. **Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd sosyal-fe

# Install dependencies
npm install
```

2. **Start Development Server**
```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:5173
```

3. **Build for Production**
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📚 API Services

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
| `POST` | `/api/users` | Create new user account |
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
| `DELETE` | `/api/messages/:id` | Delete message |

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

## 🏗️ Project Structure

```
src/
├── components/              # Reusable UI components
│   └── Layout.jsx          # Main layout component with navigation
├── contexts/                # React contexts for state management
│   └── AuthContext.jsx     # Authentication context provider
├── pages/                   # Page components
│   ├── Home.jsx            # Home page with featured content
│   ├── Login.jsx           # User login form
│   ├── Register.jsx        # User registration form
│   ├── Messages.jsx        # Real-time messaging interface
│   ├── Profile.jsx         # User profile management
│   ├── About.jsx           # About page
│   └── Contact.jsx         # Contact information
├── services/                # External service integrations
│   ├── api.js              # REST API service with interceptors
│   └── socket.js           # WebSocket service for real-time features
├── store/                   # Redux store configuration
│   ├── index.js            # Store setup and configuration
│   └── slices/             # Redux slices for state management
│       └── userSlice.js    # User state management
├── assets/                  # Static assets
│   └── react.svg           # React logo
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
└── index.css                # Global styles and Tailwind imports
```

## ⚙️ Configuration

### Environment Configuration

The frontend automatically connects to the backend at:
- **API**: `http://localhost:3001/api`
- **WebSocket**: `http://localhost:3001/chat`

To change these URLs, update the constants in:
- `src/services/api.js` - `API_BASE_URL`
- `src/services/socket.js` - WebSocket URL

### Build Configuration

- **Development Port**: 5173 (configurable in `vite.config.js`)
- **Build Output**: `dist/` directory
- **Hot Reload**: Enabled in development mode
- **Source Maps**: Available for debugging

## 🔐 Authentication Flow

1. **Registration**: User fills out registration form → Backend creates user account
2. **Login**: User provides credentials → Backend validates and returns JWT tokens
3. **Token Storage**: Frontend stores access and refresh tokens in localStorage
4. **WebSocket Connection**: Frontend connects to WebSocket server with JWT token
5. **API Requests**: All subsequent API requests include JWT token in Authorization header
6. **Token Refresh**: When access token expires, frontend automatically refreshes using refresh token
7. **Logout**: User logs out → Frontend clears tokens and disconnects WebSocket

## 💬 Real-time Messaging

The messaging system uses both REST API and WebSocket for optimal performance:

- **REST API**: For message persistence and conversation management
- **WebSocket**: For real-time message delivery and typing indicators

### Message Flow
1. User types message and sends
2. Frontend sends message via WebSocket for immediate delivery
3. Frontend also sends message via REST API for persistence
4. Backend stores message in database
5. Backend broadcasts message to recipient via WebSocket
6. Recipient receives message in real-time

### Features
- **Typing Indicators**: Real-time typing status
- **Online Status**: Live user online/offline tracking
- **Message Status**: Sent, delivered, and read confirmations
- **Unread Counts**: Track unread messages per conversation

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Clean, accessible UI components
- **Loading States**: Smooth loading indicators for async operations
- **Error Handling**: User-friendly error messages and fallbacks
- **Dark Mode Ready**: Prepared for future dark mode implementation
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

### Code Style Guidelines

- **Components**: Use functional components with hooks
- **State**: Redux for global state, Context for auth, local state for UI
- **Styling**: Tailwind CSS utility classes
- **Error Handling**: Implement proper error boundaries and user feedback
- **Loading States**: Add loading indicators for all async operations
- **TypeScript**: Consider migrating to TypeScript for better type safety

### Development Tools

- **ESLint**: Code linting and style enforcement
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **React DevTools**: Browser extension for debugging

## 🚨 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend
   - Verify MongoDB connection
   - Check browser console for network errors

2. **WebSocket Connection Failed**
   - Check if backend WebSocket server is running
   - Verify JWT token is valid and not expired
   - Check browser console for WebSocket errors
   - Ensure proper authentication headers

3. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check JWT token expiration
   - Verify backend JWT secret configuration
   - Check browser console for auth errors

4. **Build Errors**
   - Clear `node_modules` and reinstall dependencies
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Check for syntax errors in components

### Debug Tips

- Use browser DevTools for network and console debugging
- Check Redux DevTools for state management issues
- Verify WebSocket connection status in Network tab
- Use React DevTools for component debugging

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API service testing
- **E2E Tests**: User flow testing with Playwright
- **Accessibility Tests**: Screen reader and keyboard navigation

### Running Tests

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 🚀 Performance

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading for better performance
- **Bundle Optimization**: Vite optimizations for production builds
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Service worker ready for offline support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement proper error handling and loading states
- Add comprehensive tests for new features
- Update documentation as needed
- Ensure responsive design for all screen sizes

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [React Docs](https://react.dev/), [Vite Docs](https://vitejs.dev/)
- **Community**: [React Community](https://reactjs.org/community/support.html)

---

**Built with ❤️ using React 19 + Vite + Tailwind CSS**

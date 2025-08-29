import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketServiceRef = useRef(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          
          // Connect to WebSocket only once
          if (!socketServiceRef.current) {
            const socketService = (await import('../services/socket')).default;
            socketServiceRef.current = socketService;
            
            // Only connect if not already connected
            if (!socketService.getConnectionStatus()) {
              try {
                await socketService.connect(accessToken);
              } catch (error) {
                console.error('Failed to connect socket:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
    
    // Connect to WebSocket after login
    try {
      if (!socketServiceRef.current) {
        const socketService = (await import('../services/socket')).default;
        socketServiceRef.current = socketService;
      }
      
      if (!socketServiceRef.current.getConnectionStatus()) {
        await socketServiceRef.current.connect(tokens.access_token);
      }
    } catch (error) {
      console.error('Failed to connect socket after login:', error);
    }
  };

  const logout = async () => {
    try {
      const apiService = (await import('../services/api')).default;
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Disconnect WebSocket
      if (socketServiceRef.current) {
        socketServiceRef.current.disconnect();
        socketServiceRef.current = null;
      }
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

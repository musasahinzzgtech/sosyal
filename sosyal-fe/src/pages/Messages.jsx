import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  console.log('Messages:', messages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [typingUsers, setTypingUsers] = useState(new Set());
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState({});
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatUser, setNewChatUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);

  // Check if we have a target user from navigation
  useEffect(() => {
    if (location.state?.targetUser) {
      const targetUser = location.state.targetUser;
      setNewChatUser(targetUser);
      setShowNewChatModal(true);

      // Clear the state to prevent showing modal on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced message sending with real-time updates
  const sendMessage = async () => {
    if (messageText.trim() && selectedChat && !sendingMessage) {
      try {
        setSendingMessage(true);

        // Import services dynamically
        const apiService = (await import("../services/api")).default;
        const socketService = (await import("../services/socket")).default;

        // Create optimistic message for immediate UI update
        const tempMessageId = `temp_${Date.now()}`;
        const optimisticMessage = {
          id: tempMessageId,
          content: messageText.trim(),
          sender: "me",
          time: new Date().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sending",
          timestamp: new Date(),
          isOptimistic: true,
        };

        // Add optimistic message to UI
        setMessages((prev) => [...prev, optimisticMessage]);
        setMessageText("");

        // Stop typing indicator
        stopTyping();

        // Get the receiver ID from the selected chat participants
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const receiver = selectedChat.participants.find(p => p._id !== currentUser.id);
        const receiverId = receiver?._id || selectedChat.id;

        // Send message via WebSocket for real-time delivery
        socketService.sendMessage(receiverId, messageText.trim());

        // Also send via REST API for persistence
        const response = await apiService.sendMessage(
          receiverId,
          messageText.trim()
        );

        // Update optimistic message with real data
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  ...msg,
                  id: response._id || response.id,
                  status: "sent",
                  isOptimistic: false,
                }
              : msg
          )
        );

        // Update message status
        setMessageStatus((prev) => ({
          ...prev,
          [response._id || response.id]: "sent",
        }));

        // Update chat's last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  lastMessage: messageText.trim(),
                  time: "Şimdi",
                  unread: 0,
                }
              : chat
          )
        );
      } catch (error) {
        console.error("Failed to send message:", error);

        // Remove failed optimistic message
        setMessages((prev) => prev.filter((msg) => !msg.isOptimistic));

        // Show error to user
        alert("Mesaj gönderilemedi: " + error.message);
      } finally {
        setSendingMessage(false);
      }
    }
  };

  // Enhanced typing indicator
  const handleTyping = useCallback(async () => {
    if (!selectedChat) return;

    const now = Date.now();
    if (now - lastTypingTimeRef.current > 1000) {
      // Throttle typing events
      const socketService = (await import("../services/socket")).default;
      
      // Get the receiver ID from the selected chat participants
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const receiver = selectedChat.participants?.find(p => p._id !== currentUser.id);
      const receiverId = receiver?._id || selectedChat.id;
      
      console.log('Starting typing - receiver:', receiverId, 'socket connected:', socketService.getConnectionStatus());
      
      // Ensure socket is connected before trying to emit
      if (!socketService.getConnectionStatus()) {
        console.log('Socket not connected, attempting to connect...');
        const token = localStorage.getItem("accessToken");
        if (token) {
          socketService.connect(token);
          // Wait a bit for connection to establish
          setTimeout(() => {
            if (socketService.getConnectionStatus()) {
              socketService.startTyping(receiverId);
            }
          }, 1000);
        }
      } else {
        socketService.startTyping(receiverId);
      }
      lastTypingTimeRef.current = now;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(async () => {
      await stopTyping();
    }, 3000);
  }, [selectedChat, user]);

  const stopTyping = useCallback(async () => {
    if (!selectedChat) return;

    const socketService = (await import("../services/socket")).default;
    
    // Get the receiver ID from the selected chat participants
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const receiver = selectedChat.participants?.find(p => p._id !== currentUser.id);
    const receiverId = receiver?._id || selectedChat.id;
    
    // Only try to stop typing if socket is connected
    if (socketService.getConnectionStatus()) {
      socketService.stopTyping(receiverId);
    }
  }, [selectedChat]);

  // Get message status icon
  const getMessageStatusIcon = (messageId) => {
    const status = messageStatus[messageId];
    if (!status) return null;

    switch (status) {
      case "sending":
        return (
          <svg
            className="w-3 h-3 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      case "sent":
        return (
          <svg
            className="w-3 h-3 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "delivered":
        return (
          <svg
            className="w-3 h-3 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "read":
        return (
          <svg
            className="w-3 h-3 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Format typing users display
  const getTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingNames = Array.from(typingUsers).map((userId) => {
      const chat = chats.find((c) => c.id === selectedChat?.id);
      if (!chat || !chat.participants) return "Someone";
      
      const participant = chat.participants.find((p) => p._id === userId);
      return participant
        ? `${participant.firstName} ${participant.lastName}`
        : "Someone";
    });

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 italic">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span>{typingNames.join(", ")} yazıyor...</span>
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Enhanced message loading with pagination
  const loadMessages = async (conversationId, limit = 50, offset = 0) => {
    if (!conversationId) return;
    
    try {
      console.log('Loading messages for conversation:', conversationId);
      const apiService = (await import("../services/api")).default;
      const conversationMessages = await apiService.getConversationMessages(
        conversationId,
        limit,
        offset
      );
      
      console.log('Raw messages from API:', conversationMessages);
      
      // Transform messages to match the expected format
      const transformedMessages = conversationMessages.map((msg) => {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const isCurrentUser = msg.senderId?._id === currentUser.id || msg.senderId === currentUser.id;
        
        console.log('Message:', msg, 'Current user:', currentUser, 'Is current user:', isCurrentUser);
        
        return {
          id: msg._id,
          content: msg.content,
          sender: isCurrentUser ? "me" : "them",
          time: new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: msg.status || "delivered",
          timestamp: new Date(msg.createdAt),
          type: msg.type || "text",
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          replyTo: msg.replyTo,
          reactions: msg.reactions,
          isEdited: msg.isEdited,
          isDeleted: msg.isDeleted,
        };
      });
      
      console.log('Transformed messages:', transformedMessages);
      
      if (offset === 0) {
        setMessages(transformedMessages);
      } else {
        setMessages((prev) => [...transformedMessages, ...prev]);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Mesajlar yüklenemedi");
    }
  };

  const handleChatSelect = async (chat) => {
    console.log('Chat selected:', chat);
    setSelectedChat(chat);
    setMessages([]); // Clear previous messages
    setTypingUsers(new Set()); // Clear typing indicators
    
    console.log('Loading messages for chat:', chat.id);
    await loadMessages(chat.id);
    
    // Mark messages as read
    if (chat.unread > 0) {
      console.log('Marking conversation as read:', chat.id);
      markConversationAsRead(chat.id);
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId) => {
    try {
      const apiService = (await import("../services/api")).default;
      await apiService.markConversationAsRead(conversationId);

      // Update local state
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === conversationId ? { ...chat, unread: 0 } : chat
        )
      );
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  };

  // Enhanced conversation loading
  const loadConversations = async () => {
    try {
      setLoading(true);
      const apiService = (await import("../services/api")).default;
      const conversations = await apiService.getConversations();

      if (conversations && conversations.length > 0) {
        // Transform conversations to match the expected format
        const transformedChats = conversations.map((conv) => {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const otherParticipant = conv.participants.find(
            (p) => p._id !== currentUser.id
          );

          console.log('Other conversations:', conversations, 'Current user:', currentUser);
          
          // Get unread count for current user
          let unreadCount = 0;
          if (conv.unreadCounts && conv.unreadCounts instanceof Map) {
            unreadCount = conv.unreadCounts.get(currentUser.id) || 0;
          } else if (conv.unreadCounts && typeof conv.unreadCounts === 'object') {
            unreadCount = conv.unreadCounts[currentUser.id] || 0;
          }
          
          return {
            id: conv._id,
            name: otherParticipant
              ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
              : "Unknown User",
            lastMessage: conv.lastMessageContent || "No messages yet",
            time: conv.lastMessageTime
              ? new Date(conv.lastMessageTime).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Never",
            unread: unreadCount,
            avatar:
              otherParticipant?.photos?.[0] ||
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            online: otherParticipant?.isOnline || false,
            lastSeen: otherParticipant?.lastSeen,
            participants: conv.participants,
          };
        });

        setChats(transformedChats);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setError("Sohbetler yüklenemedi");
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced WebSocket setup
  const setupWebSocket = useCallback(async () => {
    const socketService = (await import("../services/socket")).default;

    // Connect to socket if not already connected
    const token = localStorage.getItem("accessToken");
    console.log('Socket setup - token:', token ? 'exists' : 'missing', 'connection status:', socketService.getConnectionStatus());
    if (token && !socketService.getConnectionStatus()) {
      console.log('Connecting to socket...');
      socketService.connect(token);
    }

    // Listen for new messages
    socketService.onMessage("message:receive", (message) => {
      console.log("New message received:", message);

      // Get current user ID from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const isCurrentUser = message.senderId?._id === currentUser.id || message.senderId === currentUser.id;

      // If the message is for the currently selected chat, add it to messages
      if (
        selectedChat &&
        (message.conversationId === selectedChat.id ||
          message.receiverId === currentUser.id)
      ) {
        const newMessage = {
          id: message._id || message.id,
          content: message.content,
          sender: isCurrentUser ? "me" : "them",
          time: new Date().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "delivered",
          timestamp: new Date(),
          type: message.type || "text",
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Update the chat's last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? { ...chat, lastMessage: message.content, time: "Şimdi" }
              : chat
          )
        );

        // Mark as read if chat is selected
        if (selectedChat && selectedChat.id === message.conversationId) {
          markConversationAsRead(message.conversationId);
        }
      }

      // Reload conversations to update last message and time
      loadConversations();
    });

    // Listen for message status updates
    socketService.onMessage("message:delivered", (data) => {
      setMessageStatus((prev) => ({
        ...prev,
        [data.messageId]: "delivered",
      }));
    });

    socketService.onMessage("message:read", (data) => {
      setMessageStatus((prev) => ({
        ...prev,
        [data.messageId]: "read",
      }));
    });

    // Listen for typing indicators
    socketService.onTyping("typing:start", (data) => {
      console.log("User started typing:", data);
      if (data.conversationId === selectedChat?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    });

    socketService.onTyping("typing:stop", (data) => {
      console.log("User stopped typing:", data);
      if (data.conversationId === selectedChat?.id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Listen for user online/offline status
    socketService.onOnlineStatus("user:online", (data) => {
      console.log("User online:", data, chats);
      setChats((prev) =>
        prev.map((chat) => {
          if (!chat.participants) return chat;
          
          const hasUser = chat.participants.some((p) => p._id === data.userId);
          return hasUser ? { ...chat, online: true } : chat;
        })
      );
    });

    socketService.onOnlineStatus("user:offline", (data) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (!chat.participants) return chat;
          
          const hasUser = chat.participants.some((p) => p._id === data.userId);
          return hasUser ? { ...chat, online: false, lastSeen: new Date() } : chat;
        })
      );
    });
  }, [selectedChat, user]);

  // Load conversations and set up WebSocket listeners
  useEffect(() => {
    loadConversations();
    setupWebSocket();

    // Cleanup function
    return () => {
      const cleanup = async () => {
        const socketService = (await import("../services/socket")).default;
        socketService.offMessage("message:receive");
        socketService.offMessage("message:delivered");
        socketService.offMessage("message:read");
        socketService.offTyping("typing:start");
        socketService.offTyping("typing:stop");
        socketService.offOnlineStatus("user:online");
        socketService.offOnlineStatus("user:offline");

        // Disconnect socket when component unmounts
        socketService.disconnect();
      };
      cleanup();
    };
  }, [setupWebSocket]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Start new conversation
  const startNewConversation = async (targetUser) => {
    try {
      setLoading(true);
      console.log('Starting new conversation with:', targetUser);
      
      const apiService = (await import("../services/api")).default;

      // Create a new conversation by sending the first message
      console.log('Sending first message...');
      const messageResponse = await apiService.sendMessage(
        targetUser.id,
        "Merhaba! Hizmetleriniz hakkında bilgi almak istiyorum."
      );
      console.log('First message response:', messageResponse);

      // Try to get the conversation directly by participants
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      console.log('Current user:', currentUser);
      
      const conversation = await apiService.getConversationByParticipants([
        currentUser.id,
        targetUser.id,
      ]);
      console.log('Conversation found:', conversation);

      if (conversation) {
        // Transform the conversation to match the expected format
        const transformedChat = {
          id: conversation._id,
          name: targetUser.name,
          lastMessage: "Merhaba! Hizmetleriniz hakkında bilgi almak istiyorum.",
          time: "Şimdi",
          unread: 0,
          avatar:
            targetUser.avatar ||
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          online: false,
          participants: conversation.participants,
        };

        console.log('Transformed chat:', transformedChat);

        // Add to chats if not already present
        if (!chats.find((chat) => chat.id === conversation._id)) {
          setChats((prev) => [transformedChat, ...prev]);
        }

        setSelectedChat(transformedChat);
        
        // Wait a bit for the message to be processed, then load messages
        setTimeout(async () => {
          console.log('Loading messages after delay...');
          await loadMessages(conversation._id);
        }, 1000); // Increased delay to ensure message is processed
      } else {
        console.log('Conversation not found, trying fallback...');
        // Fallback: reload conversations
        await loadConversations();

        // Find the new conversation and select it
        const newConversation = chats.find((chat) =>
          chat.participants.some(
            (p) => p._id === targetUser.id || p.id === targetUser.id
          )
        );

        if (newConversation) {
          console.log('Found conversation in fallback:', newConversation);
          setSelectedChat(newConversation);
          await loadMessages(newConversation.id);
        } else {
          throw new Error("Yeni sohbet bulunamadı");
        }
      }

      setShowNewChatModal(false);
      setNewChatUser(null);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Sohbet başlatılamadı: " + (error.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Sohbetler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
              <p className="text-gray-600">
                Hizmet sağlayıcılar ile iletişime geçin
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Yeni Sohbet
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {newChatUser ? "Yeni Sohbet Başlat" : "Kullanıcı Ara"}
            </h3>

            {newChatUser ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {newChatUser.avatar && (
                    <img
                      src={newChatUser.avatar}
                      alt={newChatUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {newChatUser.name}
                    </h4>
                    <p className="text-sm text-gray-500">Hizmet sağlayıcısı</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => startNewConversation(newChatUser)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    Sohbeti Başlat
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChatModal(false);
                      setNewChatUser(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya email ile ara..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowNewChatModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Left Sidebar - Chat List */}
            <div className="w-80 border-r border-gray-200 bg-gray-50">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Sohbet ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Chat List */}
              <div className="overflow-y-auto h-full">
                {chats.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Henüz Sohbet Yok
                    </h3>
                    <p className="text-gray-500">
                      Hizmet sağlayıcılar ile iletişime geçmek için önce bir
                      hizmet sağlayıcı bulun
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                        selectedChat?.id === chat.id
                          ? "bg-blue-50 border-r-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={`http://localhost:3001/${chat.avatar}`}
                            alt={chat.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {chat.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {chat.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chat.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        </div>

                        {/* Unread Badge */}
                        {chat.unread > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedChat.avatar}
                        alt={selectedChat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedChat.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedChat.online ? "Çevrimiçi" : "Çevrimdışı"}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Henüz Mesaj Yok
                        </h3>
                        <p className="text-gray-500">
                          İlk mesajı göndererek sohbeti başlatın
                        </p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender === "me"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === "me"
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-900 border border-gray-200"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`flex items-center justify-between mt-2 text-xs ${
                                  message.sender === "me"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                <span>{message.time}</span>
                                {message.sender === "me" && (
                                  <div className="flex items-center space-x-1 ml-2">
                                    {getMessageStatusIcon(message.id)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Typing Indicator */}
                        {getTypingIndicator()}

                        {/* Auto-scroll anchor */}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <textarea
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value);
                            handleTyping(); // Trigger typing indicator
                          }}
                          onKeyPress={handleKeyPress}
                          placeholder="Mesajınızı yazın..."
                          rows="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!messageText.trim() || sendingMessage}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {sendingMessage ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sohbet Seçin
                    </h3>
                    <p className="text-gray-500">
                      Mesajlaşmak istediğiniz kişiyi sol taraftan seçin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

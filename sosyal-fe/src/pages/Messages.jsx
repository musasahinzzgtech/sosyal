import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

// Add custom CSS for animations
const customStyles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

// Skeleton Components for better loading UX
const ChatSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const MessageSkeleton = ({ isOwn = false }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
    <div
      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg animate-pulse ${
        isOwn ? "bg-gray-300" : "bg-gray-200"
      }`}
    >
      <div className="h-4 bg-gray-400 rounded w-32 mb-2"></div>
      <div className="h-3 bg-gray-400 rounded w-16"></div>
    </div>
  </div>
);

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChatList, setShowChatList] = useState(true); // Mobile chat list toggle

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
    console.log("Sending message:", messageText, selectedChat, sendingMessage);
    if (messageText.trim() && selectedChat && !sendingMessage) {
      try {
        setSendingMessage(true);

        // Import services dynamically
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
        const receiver = selectedChat.participants.find(
          (p) => (typeof p === "string" ? p : p._id) !== currentUser.id
        );
        const receiverId =
          typeof receiver === "string" ? receiver : receiver._id;

        // Send message via WebSocket for real-time delivery
        socketService.sendMessage(receiverId, messageText.trim());
        console.log("receiverId", receiverId, receiver, selectedChat);
        // Also send via REST API for persistence
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
      const receiver = selectedChat.participants?.find(
        (p) => p._id !== currentUser.id
      );
      const receiverId = receiver?._id || selectedChat.id;

      // Ensure socket is connected before trying to emit
      if (!socketService.getConnectionStatus()) {
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
    const receiver = selectedChat.participants?.find(
      (p) => p._id !== currentUser.id
    );
    const receiverId = receiver?._id || selectedChat.id;

    // Only try to stop typing if socket is connected
    if (socketService.getConnectionStatus()) {
      socketService.stopTyping(receiverId);
    }
  }, [selectedChat]);

  // Get message status icon with modern animations
  const getMessageStatusIcon = (messageId) => {
    const status = messageStatus[messageId];
    if (!status) return null;

    const baseClasses = "w-3 h-3 transition-all duration-300";

    switch (status) {
      case "sending":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className={`${baseClasses} text-gray-400 animate-spin`}
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
            <span className="text-xs text-gray-400">Gönderiliyor...</span>
          </div>
        );
      case "sent":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className={`${baseClasses} text-gray-400`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "delivered":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className={`${baseClasses} text-blue-400`}
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
          </div>
        );
      case "read":
        return (
          <div className="flex items-center space-x-1">
            <svg
              className={`${baseClasses} text-blue-500`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Format typing users display with modern animations
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
      <div className="flex justify-start mb-4">
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-3">
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
            <span className="text-sm text-gray-600 font-medium">
              {typingNames.join(", ")} yazıyor...
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Enhanced message loading with pagination and better loading states
  const loadMessages = async (conversationId, limit = 50, offset = 0) => {
    if (!conversationId) return;

    try {
      setMessagesLoading(true);
      const apiService = (await import("../services/api")).default;
      const conversationMessages = await apiService.getConversationMessages(
        conversationId,
        limit,
        offset
      );

      // Transform messages to match the expected format
      const transformedMessages = conversationMessages.map((msg) => {
        // Get current user ID from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const isCurrentUser =
          msg.senderId?._id === currentUser.id ||
          msg.senderId === currentUser.id;

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

      if (offset === 0) {
        setMessages(transformedMessages);
      } else {
        setMessages((prev) => [...transformedMessages, ...prev]);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Mesajlar yüklenemedi");
    } finally {
      setMessagesLoading(false);
    }
  };
  console.log("selectedChat", selectedChat);
  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    setMessages([]); // Clear previous messages
    setTypingUsers(new Set()); // Clear typing indicators
    setShowChatList(false); // Hide chat list on mobile when chat is selected

    await loadMessages(chat.id);

    // Mark messages as read
    if (chat.unread > 0) {
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

          // Get unread count for current user
          let unreadCount = 0;
          if (conv.unreadCounts && conv.unreadCounts instanceof Map) {
            unreadCount = conv.unreadCounts.get(currentUser.id) || 0;
          } else if (
            conv.unreadCounts &&
            typeof conv.unreadCounts === "object"
          ) {
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

    if (token && !socketService.getConnectionStatus()) {
      socketService.connect(token);
    }

    // Listen for new messages
    socketService.onMessage("message:receive", (message) => {
      console.log("message:receive", message);
      // Get current user ID from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const isCurrentUser =
        message.senderId?._id === currentUser.id ||
        message.senderId === currentUser.id;

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
        console.log("newMessage", newMessage);

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
      if (selectedChat) {
        loadMessages(selectedChat.id);
      } else {
        loadConversations();
      }
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
      if (data.conversationId === selectedChat?.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    });

    socketService.onTyping("typing:stop", (data) => {
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
          return hasUser
            ? { ...chat, online: false, lastSeen: new Date() }
            : chat;
        })
      );
    });
  }, [selectedChat, user]);

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
  // Load conversations and set up WebSocket listeners
  useEffect(() => {
    loadConversations();
    setupWebSocket();

    // Cleanup function
    return () => {
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
    // start new conversation ve duplicate mesaj göndermede sorun kaldı
    try {
      setLoading(true);
      console.log("Starting new conversation with:", targetUser);

      const apiService = (await import("../services/api")).default;

      // Create a new conversation by sending the first message
      const response = await apiService.sendMessage(
        targetUser.id,
        "Merhaba! Hizmetleriniz hakkında bilgi almak istiyorum."
      );

      // Try to get the conversation directly by participants
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      const conversationID = response.conversationId;
      if (conversationID) {
        // Transform the conversation to match the expected format
        const transformedChat = {
          id: conversationID,
          name: targetUser.name,
          lastMessage: "Merhaba! Hizmetleriniz hakkında bilgi almak istiyorum.",
          time: "Şimdi",
          unread: 0,
          avatar:
            targetUser.avatar ||
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          online: false,
          participants: [currentUser.id, targetUser.id],
        };

        console.log("Transformed chat:", transformedChat);

        // Add to chats if not already present
        if (!chats.find((chat) => chat.id === conversationID)) {
          setChats((prev) => [transformedChat, ...prev]);
        }

        setSelectedChat(transformedChat);

        // Wait a bit for the message to be processed, then load messages
        setTimeout(async () => {
          await loadMessages(conversationID);
        }, 1000); // Increased delay to ensure message is processed
      } else {
        // Fallback: reload conversations
        await loadConversations();

        // Find the new conversation and select it
        const newConversation = chats.find((chat) =>
          chat.participants.some(
            (p) => p._id === targetUser.id || p.id === targetUser.id
          )
        );

        if (newConversation) {
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

  if (loading && !selectedChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-48"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>

        {/* Chat Container Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex h-[600px]">
              {/* Left Sidebar Skeleton */}
              <div className="w-80 border-r border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
                <div className="overflow-y-auto h-full">
                  {[...Array(6)].map((_, i) => (
                    <ChatSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Right Side Skeleton */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 p-4">
                  {[...Array(4)].map((_, i) => (
                    <MessageSkeleton key={i} isOwn={i % 2 === 0} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-500"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                loadConversations();
              }}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Mesajlar
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Hizmet sağlayıcılar ile iletişime geçin
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm sm:text-base font-medium"
            >
              Yeni Sohbet
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {newChatUser ? "Yeni Sohbet Başlat" : "Kullanıcı Ara"}
            </h3>

            {newChatUser ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {newChatUser.avatar && (
                    <img
                      src={`http://localhost:3001${newChatUser.avatar}`}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] sm:h-[600px]">
            {/* Left Sidebar - Chat List */}
            <div
              className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex-shrink-0 ${
                !showChatList && selectedChat ? "hidden lg:block" : ""
              }`}
            >
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
                {loading ? (
                  // Show skeleton loaders while loading
                  [...Array(6)].map((_, i) => <ChatSkeleton key={i} />)
                ) : chats.length === 0 ? (
                  <div className="p-4 sm:p-8 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
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
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      Henüz Sohbet Yok
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500">
                      Hizmet sağlayıcılar ile iletişime geçmek için önce bir
                      hizmet sağlayıcı bulun
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                        selectedChat?.id === chat.id
                          ? "bg-blue-50 border-r-2 border-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={`http://localhost:3001${chat.avatar}`}
                            alt={chat.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                          {chat.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
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
                          <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        </div>

                        {/* Unread Badge */}
                        {chat.unread > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
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
                  <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {/* Mobile back button */}
                      <button
                        onClick={() => setShowChatList(true)}
                        className="lg:hidden p-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      <img
                        src={`http://localhost:3001${selectedChat.avatar}`}
                        alt={selectedChat.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {selectedChat.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {selectedChat.online ? "Çevrimiçi" : "Çevrimdışı"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
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
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                    {messagesLoading ? (
                      // Show skeleton loaders while loading messages
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <MessageSkeleton key={i} isOwn={i % 2 === 0} />
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
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
                        {messages.map((message, index) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender === "me"
                                ? "justify-end"
                                : "justify-start"
                            } animate-fade-in`}
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: "both",
                            }}
                          >
                            <div
                              className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                                message.sender === "me"
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                  : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                              <div
                                className={`flex items-center justify-between mt-2 text-xs ${
                                  message.sender === "me"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                <span className="font-medium">
                                  {message.time}
                                </span>
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
                  <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2 sm:space-x-3">
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
                      <div className="flex-1 relative">
                        <textarea
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value);
                            handleTyping(); // Trigger typing indicator
                          }}
                          onKeyPress={handleKeyPress}
                          placeholder="Mesajınızı yazın..."
                          rows="1"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          style={{
                            minHeight: "44px",
                            maxHeight: "120px",
                          }}
                        />
                        {messageText.trim() && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!messageText.trim() || sendingMessage}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          sendingMessage || !messageText.trim()
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-110 active:scale-95"
                        } text-white shadow-md`}
                      >
                        {sendingMessage ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">
                              Gönderiliyor...
                            </span>
                          </div>
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
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center max-w-md mx-auto px-4 sm:px-6">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                      <svg
                        className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500"
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
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                      Sohbet Seçin
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      Mesajlaşmak istediğiniz kişiyi sol taraftan seçin veya
                      yeni bir sohbet başlatın
                    </p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                    >
                      Yeni Sohbet Başlat
                    </button>
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

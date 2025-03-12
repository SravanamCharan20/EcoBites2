import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import io from 'socket.io-client';

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socketError, setSocketError] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  // Initialize socket connection
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const connectSocket = () => {
      if (currentUser?.id) {
        try {
          socketRef.current = io('http://localhost:6001', {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnectionAttempts: maxRetries,
            reconnectionDelay: 1000,
          });

          socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setSocketError(false);
            socketRef.current.emit('join', currentUser.id);
          });

          socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            retryCount++;
            if (retryCount >= maxRetries) {
              setSocketError(true);
            }
          });

          socketRef.current.on('newMessage', ({ chatId, message }) => {
            if (selectedChat && selectedChat._id === chatId) {
              setMessages(prev => [...prev, message]);
              scrollToBottom();
            }
            fetchChats();
          });

          return () => {
            if (socketRef.current) {
              socketRef.current.disconnect();
            }
          };
        } catch (error) {
          console.error('Socket initialization error:', error);
          setSocketError(true);
        }
      }
    };

    connectSocket();
  }, [currentUser, selectedChat]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchChats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chat/user/${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      // Filter out self-chats
      const filteredChats = data.filter(chat => 
        chat.donorId._id !== chat.requesterId._id
      );
      setChats(filteredChats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      console.log('Fetched messages:', data);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const isCurrentUserMessage = (message) => {
    // Check for all possible sender ID locations in the message object
    const senderId = message?.senderId || message?.sender;
    
    if (!senderId || !currentUser?.id) {
      console.log('Message structure:', message);
      return false;
    }
    
    // Convert both IDs to string for comparison
    const senderIdString = typeof senderId === 'object' ? senderId._id.toString() : senderId.toString();
    const currentUserIdString = currentUser.id.toString();
    
    return senderIdString === currentUserIdString;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        senderId: currentUser.id,
        content: newMessage,
        timestamp: new Date().toISOString()
      };

      console.log('Sending message data:', messageData);

      const response = await fetch(`/api/chat/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to send message');
      }

      const newMessageObj = {
        ...responseData.messages[responseData.messages.length - 1],
        senderId: currentUser.id,
        timestamp: new Date().toISOString()
      };
      
      console.log('New message object:', newMessageObj);
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      scrollToBottom();

      if (socketRef.current?.connected) {
        socketRef.current.emit('sendMessage', {
          chatId: selectedChat._id,
          message: newMessageObj
        });
      }
    } catch (error) {
      console.error('Error details:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser?.id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Please sign in to access chats.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl h-[calc(100vh-80px)] flex gap-4 p-6">
        {socketError && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
            Chat connection error. Some features may be limited.
          </div>
        )}
        
        {/* Chat List */}
        <div className="w-1/4 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-2xl text-gray-800 font-semibold">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            {chats.map((chat) => {
              if (!chat?._id || !chat?.donorId?._id || !chat?.requesterId?._id) return null;
              if (chat.donorId._id === chat.requesterId._id) return null;
              
              return (
                <motion.div
                  key={chat._id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {chat.donorId._id === currentUser.id
                          ? chat?.requesterId?.username || 'Unknown User'
                          : chat?.donorId?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.messages?.[chat.messages.length - 1]?.content || 'No messages yet'}
                      </p>
                    </div>
                    {chat.messages?.length > 0 && chat.messages[chat.messages.length - 1]?.timestamp && (
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.messages[chat.messages.length - 1].timestamp)}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 bg-gray-800 text-white">
                <h3 className="text-xl font-semibold">
                  {selectedChat?.donorId?._id === currentUser?.id
                    ? selectedChat?.requesterId?.username || 'Unknown User'
                    : selectedChat?.donorId?.username || 'Unknown User'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    if (!message?.content) return null;
                    const isSentByMe = isCurrentUserMessage(message);
                    console.log('Message:', message, 'isSentByMe:', isSentByMe);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isSentByMe
                              ? 'bg-gray-800 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none border-2 border-gray-600'
                          } shadow-sm`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t-2 border-gray-600">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border-2 border-gray-600 rounded text-black focus:outline-none focus:ring-2"
                  />
                  <button
                    type="submit"
                    className="bg-gray-800 text-white p-3 rounded hover:bg-black transition-colors disabled:opacity-50"
                    disabled={!newMessage.trim()}
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
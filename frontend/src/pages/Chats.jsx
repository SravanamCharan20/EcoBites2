import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';
import { MdFastfood } from 'react-icons/md';
import { FaCouch } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const Chats = () => {
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socketError, setSocketError] = useState(false);
  const [activeTab, setActiveTab] = useState('food'); // 'food' or 'nonfood'
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  // Handle direct chat navigation
  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setSelectedChat(chat);
        // Set the active tab based on the chat type
        setActiveTab(chat.foodItemId?.foodItems ? 'food' : 'nonfood');
      }
    }
  }, [searchParams, chats]);

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
      
      console.log('Chats - Raw chat data:', data);
      
      // Fetch additional details for non-food items
      const enhancedChats = await Promise.all(data.map(async (chat) => {
        // Check if this is a non-food chat (no foodItems array)
        const isNonFoodChat = !chat.foodItemId?.foodItems;
        
        console.log('Chats - Processing chat:', {
          chatId: chat._id,
          isNonFoodChat,
          itemId: chat.foodItemId?._id,
          currentDetails: chat.foodItemId
        });

        if (isNonFoodChat && chat.foodItemId?._id) {
          try {
            const nonFoodResponse = await fetch(`/api/donor/get-nondonor/${chat.foodItemId._id}`);
            if (!nonFoodResponse.ok) {
              throw new Error('Failed to fetch non-food details');
            }
            
            const nonFoodData = await nonFoodResponse.json();
            console.log('Chats - Fetched non-food details:', {
              chatId: chat._id,
              nonFoodData
            });
            
            // Create enhanced chat object with non-food details
            const enhancedChat = {
              ...chat,
              foodItemId: {
                _id: chat.foodItemId._id,
                nonFoodItems: nonFoodData.nonFoodItems || [],
                availableUntil: nonFoodData.availableUntil,
                donationType: nonFoodData.donationType,
                location: nonFoodData.location,
                email: nonFoodData.email,
                contactNumber: nonFoodData.contactNumber,
                name: nonFoodData.name
              }
            };

            console.log('Chats - Enhanced non-food chat:', {
              chatId: chat._id,
              enhancedData: enhancedChat.foodItemId
            });

            return enhancedChat;
          } catch (error) {
            console.error('Chats - Error fetching non-food details:', {
              chatId: chat._id,
              error: error.message
            });
            return chat;
          }
        }
        return chat;
      }));

      // Filter out self-chats
      const filteredChats = enhancedChats.filter(chat => 
        chat.donorId._id !== chat.requesterId._id
      );
      
      console.log('Chats - Final enhanced chats:', 
        filteredChats.map(chat => ({
          chatId: chat._id,
          isFood: !!chat.foodItemId?.foodItems,
          itemDetails: chat.foodItemId?.foodItems?.[0] || chat.foodItemId?.nonFoodItems?.[0],
          donationType: chat.foodItemId?.donationType
        }))
      );
      
      setChats(filteredChats);
      setLoading(false);
    } catch (error) {
      console.error('Chats - Error fetching chats:', error);
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

  // Filter chats based on active tab
  const filteredChats = chats.filter(chat => {
    const isFood = chat.foodItemId?.foodItems !== undefined;
    return activeTab === 'food' ? isFood : !isFood;
  });

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
            <h2 className="text-2xl text-gray-800 font-semibold mb-4">Messages</h2>
            <div className="flex rounded-lg overflow-hidden border-2 border-gray-200">
              <button
                className={`flex-1 py-2 px-4 ${
                  activeTab === 'food'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('food')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MdFastfood />
                  <span>Food</span>
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-4 ${
                  activeTab === 'nonfood'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('nonfood')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FaCouch />
                  <span>Non-Food</span>
                </div>
              </button>
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-280px)]">
            {filteredChats.map((chat) => {
              if (!chat?._id || !chat?.donorId?._id || !chat?.requesterId?._id) return null;
              
              const itemDetails = chat.foodItemId?.foodItems?.[0] || chat.foodItemId?.nonFoodItems?.[0];
              const isFood = chat.foodItemId?.foodItems !== undefined;
              
              return (
                <motion.div
                  key={chat._id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {isFood ? (
                        <MdFastfood className="text-green-500 text-xl" />
                      ) : (
                        <FaCouch className="text-blue-500 text-xl" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800">
                          {chat.donorId._id === currentUser.id
                            ? chat?.requesterId?.username || 'Unknown User'
                            : chat?.donorId?.username || 'Unknown User'}
                        </p>
                        {chat.messages?.length > 0 && chat.messages[chat.messages.length - 1]?.timestamp && (
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.messages[chat.messages.length - 1].timestamp)}
                          </span>
                        )}
                      </div>
                      {itemDetails && (
                        <div className="mt-1 space-y-1">
                          {isFood ? (
                            <>
                              <p className="text-xs text-gray-500">
                                🍽️ Food Item: <span className="font-medium">{itemDetails.name}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Quantity: {itemDetails.quantity} {itemDetails.unit}
                                {itemDetails.expiryDate && 
                                  ` • Expires: ${new Date(itemDetails.expiryDate).toLocaleDateString()}`
                                }
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500">
                                📦 Non-Food Item: <span className="font-medium">{itemDetails.name}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Category: {itemDetails.type} • Condition: {itemDetails.condition}
                              </p>
                              <p className="text-xs text-gray-500">
                                Quantity: {itemDetails.quantity} {itemDetails.unit || 'pieces'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {chat.foodItemId.donationType === 'free' ? '🎁 Free Item' : `💰 Price: ${itemDetails.price}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                Available until: {new Date(chat.foodItemId.availableUntil).toLocaleDateString()}
                              </p>
                              {chat.foodItemId.location && (
                                <p className="text-xs text-gray-500">
                                  📍 Location available
                                </p>
                              )}
                              {chat.foodItemId.contactNumber && (
                                <p className="text-xs text-gray-500">
                                  📞 Contact: {chat.foodItemId.contactNumber}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 truncate mt-2">
                        {chat.messages?.[chat.messages.length - 1]?.content || 'No messages yet'}
                      </p>
                    </div>
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
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {selectedChat.foodItemId?.foodItems ? (
                      <MdFastfood className="text-green-400 text-xl" />
                    ) : (
                      <FaCouch className="text-blue-400 text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {selectedChat?.donorId?._id === currentUser?.id
                        ? selectedChat?.requesterId?.username || 'Unknown User'
                        : selectedChat?.donorId?.username || 'Unknown User'}
                    </h3>
                    {selectedChat.foodItemId && (
                      <div className="space-y-1 mt-1">
                        {(() => {
                          const itemDetails = selectedChat.foodItemId?.foodItems?.[0] || selectedChat.foodItemId?.nonFoodItems?.[0];
                          const isFood = selectedChat.foodItemId?.foodItems !== undefined;
                          
                          return itemDetails ? (
                            <>
                              {isFood ? (
                                <>
                                  <p className="text-sm text-gray-300">
                                    🍽️ Food Item: {itemDetails.name}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    Quantity: {itemDetails.quantity} {itemDetails.unit} • Expires: {new Date(itemDetails.expiryDate).toLocaleDateString()}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-300">
                                    📦 Non-Food Item: {itemDetails.name}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    Quantity: {itemDetails.quantity} • Type: {itemDetails.type} • {itemDetails.condition}
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {selectedChat.foodItemId.donationType === 'free' ? '🎁 Free Item' : `💰 Price: ${itemDetails.price}`}
                                  </p>
                                </>
                              )}
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    if (!message?.content) return null;
                    const isSentByMe = isCurrentUserMessage(message);
                    const itemDetails = selectedChat.foodItemId?.foodItems?.[0] || selectedChat.foodItemId?.nonFoodItems?.[0];
                    const isFood = selectedChat.foodItemId?.foodItems !== undefined;
                    
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
                          <div className="mb-1">
                            {!isSentByMe && (
                              <p className="font-semibold text-sm mb-1">
                                {selectedChat?.donorId?.username || 'Unknown User'}
                              </p>
                            )}
                            {!isSentByMe && itemDetails && (
                              <div className="text-xs text-gray-600 mb-2">
                                {isFood ? (
                                  <>
                                    <p>🍽️ Food Item: {itemDetails.name}</p>
                                    <p>Quantity: {itemDetails.quantity} {itemDetails.unit} • Expires: {new Date(itemDetails.expiryDate).toLocaleDateString()}</p>
                                  </>
                                ) : (
                                  <>
                                    <p>📦 Non-Food Item: {itemDetails.name}</p>
                                    <p>Quantity: {itemDetails.quantity} • Type: {itemDetails.type} • {itemDetails.condition}</p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
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
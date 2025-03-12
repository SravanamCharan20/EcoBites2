import Chat from '../models/chat.model.js';
import User from '../models/user.model.js';

// Initialize a new chat between donor and requester
export const initializeChat = async (req, res) => {
  try {
    const { donorId, requesterId, foodItemId } = req.body;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      donorId,
      requesterId,
      foodItemId
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // Create new chat
    const newChat = new Chat({
      donorId,
      requesterId,
      foodItemId,
      messages: []
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize chat', error: error.message });
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push({
      sender: senderId,
      content,
      timestamp: new Date()
    });
    chat.lastMessage = new Date();

    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Get all chats for a user (either as donor or requester)
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      $or: [
        { donorId: userId },
        { requesterId: userId }
      ]
    })
    .sort({ lastMessage: -1 })
    .populate('donorId', 'username')
    .populate('requesterId', 'username')
    .populate('foodItemId', 'foodItems');

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'username');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
}; 
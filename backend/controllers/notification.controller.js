import Notification from '../models/notification.model.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is attached to req by auth middleware
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    // Format notifications with read status for this user
    const formattedNotifications = notifications.map(notification => ({
      ...notification.toObject(),
      read: notification.readBy.includes(userId)
    }));

    res.json(formattedNotifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, link, type } = req.body;
    const notification = new Notification({
      title,
      message,
      link,
      type,
      readBy: []
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
}; 
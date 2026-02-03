import Item from "../models/itemModel.js";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";

// Get overall stats
export const getStats = async (req, res) => {
  try {
    // Active users - verified users
    const activeUsers = await User.countDocuments({ isVerified: true });
    
    // Total items reported (both lost and found)
    const totalItems = await Item.countDocuments();
    
    // Items recovered - items that have been claimed
    const itemsRecovered = await Item.countDocuments({ status: 'claimed' });
    
    // Books sold - books marked as sold
    const booksSold = await Book.countDocuments({ status: 'sold' });
    
    // Additional stats for dashboard
    const totalBooks = await Book.countDocuments({ status: 'available' });
    const lostItems = await Item.countDocuments({ type: 'lost', status: 'active' });
    const foundItems = await Item.countDocuments({ type: 'found', status: 'active' });

    // Get recent items and books
    const recentItems = await Item.find()
      .populate('reportedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentBooks = await Book.find()
      .populate('seller', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        // Home page stats
        totalItems,
        itemsRecovered,
        booksSold,
        activeUsers,
        // Additional dashboard stats
        totalBooks,
        lostItems,
        foundItems,
        recentItems,
        recentBooks
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Get user stats (for profile/dashboard)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const myItems = await Item.countDocuments({ reportedBy: userId });
    const myBooks = await Book.countDocuments({ seller: userId });
    const myClaimedItems = await Item.countDocuments({ claimedBy: userId });
    const mySoldBooks = await Book.countDocuments({ seller: userId, status: 'sold' });
    
    // Get user's itemsRecovered count
    const user = await User.findById(userId).select('itemsRecovered');
    const itemsRecovered = user?.itemsRecovered || 0;

    res.status(200).json({
      success: true,
      stats: {
        myItems,
        myBooks,
        myClaimedItems,
        mySoldBooks,
        itemsRecovered
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

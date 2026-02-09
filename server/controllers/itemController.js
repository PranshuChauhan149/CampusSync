import Item from "../models/itemModel.js";
import ItemClaim from "../models/itemClaimModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// Get all items with filtering and pagination
export const getItems = async (req, res) => {
  try {
    const {
      type, // 'lost' or 'found'
      category,
      status = 'active',
      location,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status };

    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get items with populated user data
    const items = await Item.find(query)
      .populate('reportedBy', 'username email')
      .populate('claimedBy', 'username email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Item.countDocuments(query);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items'
    });
  }
};

// Get single item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate('reportedBy', 'username email createdAt')
      .populate('claimedBy', 'username email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item'
    });
  }
};

// Increment item view count (unique users only)
export const incrementItemView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user is the owner or has already viewed
    const isOwner = userId && item.reportedBy.toString() === userId.toString();
    const hasViewed = userId && item.viewedBy?.includes(userId);

    if (!isOwner && !hasViewed) {
      // Add user to viewedBy array and increment views
      await Item.findByIdAndUpdate(id, {
        $inc: { views: 1 },
        $addToSet: { viewedBy: userId || null }
      });
    }

    res.status(200).json({
      success: true,
      message: 'View recorded'
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record view'
    });
  }
};

// Create new item (Lost or Found)
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
      contactInfo,
      tags,
      features
    } = req.body;

    console.log('📝 Creating item with data:', { title, description, category, type, location, date });
    console.log('📸 Files received:', req.files?.length || 0);

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type (lost/found) is required'
      });
    }
    
    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    if (!contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'Contact information is required'
      });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, 'items');
          imageUrls.push(result.secure_url);
        }
        console.log('✅ Uploaded images:', imageUrls.length);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images: ' + uploadError.message
        });
      }
    }

    // Parse JSON fields
    let parsedContactInfo = contactInfo;
    let parsedTags = [];
    let parsedFeatures = {};

    try {
      if (typeof contactInfo === 'string') {
        parsedContactInfo = JSON.parse(contactInfo);
      }
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      if (features) {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    // Create the item
    const item = new Item({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      location: location.trim(),
      date: new Date(date),
      images: imageUrls,
      contactInfo: parsedContactInfo,
      tags: parsedTags,
      features: parsedFeatures,
      reportedBy: req.user._id,
      postedBy: req.user._id
    });

    await item.save();
    console.log('✅ Item saved with ID:', item._id);

    // Populate the created item
    await item.populate('reportedBy', 'username email');
    console.log('✅ Item populated');

    // Emit real-time event for new item so clients can show notifications
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new-item', {
          type: 'item_added',
          itemType: item.type, // 'lost' or 'found'
          title: item.title,
          message: `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title} - ${item.location}`,
          itemId: item._id,
          createdAt: item.createdAt,
        });
        console.log('📡 Emitted new-item event for', item._id);
      }
    } catch (emitErr) {
      console.error('Error emitting new-item event:', emitErr);
    }

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully`,
      data: item
    });
  } catch (error) {
    console.error('❌ Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item: ' + error.message
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns the item
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own items'
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const imageUrl of item.images) {
        await deleteFromCloudinary(imageUrl);
      }

      // Upload new images
      const imageUrls = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'items');
        imageUrls.push(result.secure_url);
      }
      updates.images = imageUrls;
    }

    // Parse JSON fields
    if (updates.contactInfo) updates.contactInfo = JSON.parse(updates.contactInfo);
    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (updates.features) updates.features = JSON.parse(updates.features);
    if (updates.date) updates.date = new Date(updates.date);

    const updatedItem = await Item.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('reportedBy', 'username email').populate('claimedBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item'
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns the item
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own items'
      });
    }

    // Delete images from Cloudinary
    for (const imageUrl of item.images) {
      await deleteFromCloudinary(imageUrl);
    }

    await Item.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item'
    });
  }
};

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

const overlapScore = (a, b) => {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  tokensA.forEach((t) => {
    if (tokensB.has(t)) overlap += 1;
  });
  return overlap / Math.max(tokensA.size, tokensB.size);
};

const dateScore = (itemDate, claimDate) => {
  if (!itemDate || !claimDate) return 0;
  const diffDays = Math.abs(new Date(itemDate).getTime() - new Date(claimDate).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 1;
  if (diffDays <= 3) return 0.7;
  if (diffDays <= 7) return 0.4;
  return 0.1;
};

const calculateMatchScore = (item, claim) => {
  const locationScore = overlapScore(item?.location, claim?.details?.location);
  const descriptionScore = overlapScore(item?.description, claim?.details?.description);
  const dateMatchScore = dateScore(item?.date, claim?.details?.date);
  const featuresScore = overlapScore(item?.features?.brand || '', claim?.details?.distinguishingFeatures || '');

  const weighted = (locationScore * 0.35) + (descriptionScore * 0.3) + (dateMatchScore * 0.25) + (featuresScore * 0.1);
  return Math.round(Math.min(1, Math.max(0, weighted)) * 100);
};

// Claim item
export const claimItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      location,
      date,
      description,
      distinguishingFeatures,
      message
    } = req.body;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Item is not available for claiming'
      });
    }

    const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    const normalizedLocation = typeof location === 'string' ? location.trim() : '';
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    const parsedDate = date ? new Date(date) : null;

    if (!normalizedFullName || !normalizedEmail || !normalizedLocation || !normalizedDescription || !parsedDate) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, location, date, and description are required'
      });
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date provided for claim'
      });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, 'item-claims');
          imageUrls.push(result.secure_url);
        }
      } catch (uploadError) {
        console.error('Claim image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload claim images: ' + uploadError.message
        });
      }
    }

    const claimRequest = await ItemClaim.create({
      item: item._id,
      claimant: req.user._id,
      contactInfo: {
        name: normalizedFullName,
        email: normalizedEmail,
        phone: typeof phone === 'string' ? phone.trim() : ''
      },
      details: {
        location: normalizedLocation,
        date: parsedDate,
        description: normalizedDescription,
        distinguishingFeatures: typeof distinguishingFeatures === 'string' ? distinguishingFeatures.trim() : '',
        message: typeof message === 'string' ? message.trim() : ''
      },
      images: imageUrls
    });

    // Do not auto-resolve item on claim request

    // Create notification for the item reporter
    try {
      await Notification.create({
        user: item.reportedBy,
        type: 'item_claimed',
        title: 'New Claim Request',
        message: `New claim request for "${item.title}" from ${normalizedFullName}. Check details in your dashboard.`,
        data: { itemId: item._id, userId: req.user._id }
      });
    } catch (notifyError) {
      console.error('Claim notification error (continuing anyway):', notifyError);
    }

    res.status(200).json({
      success: true,
      message: 'Claim request submitted successfully',
      data: claimRequest
    });
  } catch (error) {
    console.error('Claim item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to claim item'
    });
  }
};

export const getReceivedClaims = async (req, res) => {
  try {
    const claims = await ItemClaim.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'item',
        match: { reportedBy: req.user._id },
        populate: { path: 'reportedBy', select: 'username email' }
      })
      .populate({ path: 'claimant', select: 'username email phone' })
      .lean();

    const filteredClaims = claims
      .filter((claim) => claim.item)
      .map((claim) => ({
        ...claim,
        matchScore: calculateMatchScore(claim.item, claim)
      }));

    res.status(200).json({
      success: true,
      data: filteredClaims
    });
  } catch (error) {
    console.error('Get received claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch claim requests'
    });
  }
};

// Get user's items
export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .populate('claimedBy', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your items'
    });
  }
};

// Get claims sent by current user
export const getSentClaims = async (req, res) => {
  try {
    const userId = req.user._id;

    const claims = await ItemClaim.find({ claimant: userId })
      .populate({
        path: 'item',
        select: 'title description category location date reportedBy images',
        populate: { path: 'reportedBy', select: 'name username email' }
      })
      .populate('claimant', 'name username email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: claims
    });
  } catch (error) {
    console.error('Error fetching sent claims:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sent claims'
    });
  }
};

// Update claim status (Only item owner can do this)
export const updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    if (!['pending', 'approved', 'rejected', 'claimed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: pending, approved, rejected, claimed'
      });
    }

    // Find the claim
    const claim = await ItemClaim.findById(claimId);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // Find the item to check if user is the owner
    const item = await Item.findById(claim.item);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user is the item owner (not the claimant)
    if (item.reportedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can approve or reject claims'
      });
    }

    // Update status
    const oldStatus = claim.status;
    claim.status = status;
    await claim.save();

    // If approved or claimed, update item status to resolved
    if (status === 'approved' || status === 'claimed') {
      await Item.findByIdAndUpdate(claim.item, { status: 'resolved' });
      
      // Increment itemsRecovered counter when approved
      if (oldStatus !== 'approved') {
        await User.findByIdAndUpdate(userId, { $inc: { itemsRecovered: 1 } });
      }
    }

    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}`,
      data: claim
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update claim status'
    });
  }
};
import Comment from '../models/Comment.js';
import StudyMaterial from '../models/StudyMaterial.js';

// @desc    Add a comment/question to a material
// @route   POST /api/comments
// @access  Private (Student)
export const addComment = async (req, res, next) => {
  try {
    const { materialId, content } = req.body;

    if (!materialId || !content) {
      return res.status(400).json({ success: false, message: 'Material ID and content are required' });
    }

    const material = await StudyMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const comment = await Comment.create({
      user: req.user._id,
      material: materialId,
      content,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a specific material
// @route   GET /api/comments/material/:materialId
// @access  Private (Admin)
export const getMaterialComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ material: req.params.materialId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

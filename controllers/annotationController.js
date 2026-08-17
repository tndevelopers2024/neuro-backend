import DocumentAnnotation from '../models/DocumentAnnotation.js';

// @desc    Get annotations for a specific material for the logged-in user
// @route   GET /api/annotations/:materialId
// @access  Private
export const getAnnotations = async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.user._id; // Assuming authMiddleware populates req.user

    const annotation = await DocumentAnnotation.findOne({ user: userId, materialId });

    if (annotation) {
      res.json({ drawings: annotation.drawings });
    } else {
      res.json({ drawings: {} });
    }
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ message: 'Server error fetching annotations' });
  }
};

// @desc    Save or update annotations for a specific material
// @route   POST /api/annotations/:materialId
// @access  Private
export const saveAnnotations = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { drawings } = req.body;
    const userId = req.user._id;
    
    console.log('--- SAVE ANNOTATIONS ---');
    console.log('Material ID:', materialId);
    console.log('Drawings received:', JSON.stringify(drawings).substring(0, 200));

    let annotation = await DocumentAnnotation.findOne({ user: userId, materialId });
    if (!annotation) {
      annotation = new DocumentAnnotation({ user: userId, materialId, drawings });
    } else {
      annotation.drawings = drawings;
      annotation.markModified('drawings');
    }
    await annotation.save();

    res.json({ success: true, annotation });
  } catch (error) {
    console.error('Error saving annotations:', error);
    res.status(500).json({ message: 'Server error saving annotations' });
  }
};

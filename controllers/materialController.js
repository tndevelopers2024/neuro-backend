import StudyMaterial from '../models/StudyMaterial.js';
import Topic from '../models/Topic.js';
import MCQ from '../models/MCQ.js';
import Flashcard from '../models/Flashcard.js';
import { getTopicBreadcrumbs } from '../services/mindMapService.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import LearningProgress from '../models/LearningProgress.js';

// @desc    Get learning materials and next/prev sequential guidance for Screen 4
// @route   GET /api/materials/topic/:topicSlug
export const getTopicMaterials = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.topicSlug }).populate('parentTopic').populate('category');
    if (!topic) return res.status(404).json({ success: false, message: 'Topic lesson not found' });

    // Find all descendant topics (children and grandchildren) to aggregate materials
    const childTopics = await Topic.find({ parentTopic: topic._id });
    const childIds = childTopics.map(t => t._id);
    
    const grandChildTopics = await Topic.find({ parentTopic: { $in: childIds } });
    const grandChildIds = grandChildTopics.map(t => t._id);

    const allTopicIds = [topic._id, ...childIds, ...grandChildIds];

    const materials = await StudyMaterial.find({ topic: { $in: allTopicIds }, status: 'published' }).sort({ displayOrder: 1 });
    const mcqsCount = await MCQ.countDocuments({ topic: { $in: allTopicIds } });
    const flashcardsCount = await Flashcard.countDocuments({ topic: { $in: allTopicIds } });

    // Calculate dynamic Next and Previous topic lessons using displayOrder
    const siblings = await Topic.find({
      parentTopic: topic.parentTopic ? topic.parentTopic._id : null,
      category: topic.category._id,
      status: 'published',
    }).sort({ displayOrder: 1 });

    const currentIndex = siblings.findIndex((t) => t._id.toString() === topic._id.toString());
    const prevTopic = currentIndex > 0 ? { title: siblings[currentIndex - 1].title, slug: siblings[currentIndex - 1].slug } : null;
    const nextTopic = currentIndex !== -1 && currentIndex < siblings.length - 1 ? { title: siblings[currentIndex + 1].title, slug: siblings[currentIndex + 1].slug } : null;

    const breadcrumbs = await getTopicBreadcrumbs(topic.slug);

    // Attach progress if user is authenticated
    const materialsWithProgress = await Promise.all(
      materials.map(async (m) => {
        let progressPercent = 0;
        if (req.user) {
          const progress = await LearningProgress.findOne({ user: req.user._id, material: m._id });
          if (progress) progressPercent = progress.progressPercentage;
        }
        return { ...m.toObject(), progressPercentage: progressPercent };
      })
    );

    res.status(200).json({
      success: true,
      topic: {
        _id: topic._id,
        title: topic.title,
        slug: topic.slug,
        description: topic.description,
        parentTopic: topic.parentTopic,
        category: topic.category,
      },
      childTopics,
      materials: materialsWithProgress,
      counts: {
        mcqs: mcqsCount,
        flashcards: flashcardsCount,
      },
      navigation: {
        prev: prevTopic,
        next: nextTopic,
        parentMapLink: topic.parentTopic ? `/topic/${topic.parentTopic.slug}` : `/learn/${topic.category.slug}`,
        parentMapTitle: topic.parentTopic ? topic.parentTopic.title : topic.category.name,
      },
      breadcrumbs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific material details by ID (for video/note players)
// @route   GET /api/materials/:id
export const getMaterialById = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).populate({
      path: 'topic',
      populate: { path: 'parentTopic' },
    });
    if (!material) return res.status(404).json({ success: false, message: 'Material item not found' });

    const breadcrumbs = await getTopicBreadcrumbs(material.topic.slug);
    res.status(200).json({ success: true, material, breadcrumbs });
  } catch (error) {
    next(error);
  }
};

// --- Admin Material Endpoints ---

export const getAdminMaterials = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type && req.query.type !== 'ALL') filter.type = req.query.type;
    if (req.query.topic) filter.topic = req.query.topic;

    const materials = await StudyMaterial.find(filter)
      .populate('topic', 'title slug')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: materials.length, materials });
  } catch (error) {
    next(error);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    const { topic, title, description, type, videoUrl, fileUrl, richTextContent, thumbnail, duration, allowDownload, displayOrder, status } = req.body;
    
    // Check if file was attached via Multer upload
    let finalFileUrl = fileUrl;
    let finalVideoUrl = videoUrl;
    if (req.file) {
      if (type === 'VIDEO') {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'video',
          folder: 'neuromind_videos'
        });
        finalVideoUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // Delete local file
      } else if (type === 'PDF' || type === 'NOTES') {
        finalFileUrl = `/uploads/pdfs/${req.file.filename}`;
      } else {
        finalFileUrl = `/uploads/resources/${req.file.filename}`;
      }
    }

    const material = await StudyMaterial.create({
      topic,
      title,
      description,
      type,
      videoUrl: finalVideoUrl,
      fileUrl: finalFileUrl,
      richTextContent,
      thumbnail,
      duration,
      allowDownload: allowDownload !== undefined ? allowDownload : true,
      displayOrder: displayOrder || 1,
      status: status || 'published',
    });
    
    res.status(201).json({ success: true, material });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    await material.deleteOne();
    res.status(200).json({ success: true, message: 'Study material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (req.file) {
      const type = req.body.type || material.type;
      if (type === 'VIDEO') {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'video',
          folder: 'neuromind_videos'
        });
        req.body.videoUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // Delete local file
      } else if (type === 'PDF' || type === 'NOTES') {
        req.body.fileUrl = `/uploads/pdfs/${req.file.filename}`;
      } else {
        req.body.fileUrl = `/uploads/resources/${req.file.filename}`;
      }
    }

    const updated = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, material: updated });
  } catch (error) {
    next(error);
  }
};

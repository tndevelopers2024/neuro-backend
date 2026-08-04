import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import { buildTopicMapData, getTopicBreadcrumbs, calculateRadialCoordinates } from '../services/mindMapService.js';
import slugify from 'slugify';

// @desc    Get topic mind map structure (Screen 3)
// @route   GET /api/topics/:slug/map
export const getTopicMindMap = async (req, res, next) => {
  try {
    const mapData = await buildTopicMapData(req.params.slug);
    if (!mapData) return res.status(404).json({ success: false, message: 'Topic hierarchy not found' });
    
    const breadcrumbs = await getTopicBreadcrumbs(req.params.slug);
    res.status(200).json({ success: true, rootTopic: mapData.centerNode, mapData: mapData.childTopics, fullHierarchy: mapData, breadcrumbs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get direct children of a topic or category root topics
// @route   GET /api/topics/children
export const getTopicsByParent = async (req, res, next) => {
  try {
    const filter = { status: 'published' };
    if (req.query.parentTopic) {
      filter.parentTopic = req.query.parentTopic;
    } else if (req.query.category) {
      filter.category = req.query.category;
      filter.parentTopic = null;
    }
    const topics = await Topic.find(filter).sort({ displayOrder: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: topics.length, topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete recursive topic tree for admin hierarchy manager
// @route   GET /api/topics/admin/tree
export const getAdminTopicTree = async (req, res, next) => {
  try {
    const topics = await Topic.find().populate('category', 'name').populate('subject', 'name').sort({ category: 1, level: 1, displayOrder: 1 });
    res.status(200).json({ success: true, count: topics.length, topics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all topics with optional limit and domain filtering
// @route   GET /api/topics
export const getAllTopics = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subject) filter.subject = req.query.subject;

    const limit = parseInt(req.query.limit, 10) || 500;
    const topics = await Topic.find(filter).populate('category', 'name').populate('subject', 'name').limit(limit).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: topics.length, topics });
  } catch (error) {
    next(error);
  }
};

// --- Admin CRUD Endpoints ---

export const createTopic = async (req, res, next) => {
  try {
    const { title, description, parentTopic, level, icon, color, displayOrder, mapPosition, status } = req.body;
    let { subject, category } = req.body;
    let computedLevel = level || 1;

    if (parentTopic) {
      const parent = await Topic.findById(parentTopic);
      if (parent) {
        computedLevel = parent.level + 1;
        if (!subject) subject = parent.subject;
        if (!category) category = parent.category;
      }
    }

    if (!category) {
      const defaultCat = await Category.findOne({});
      if (defaultCat) {
        category = defaultCat._id;
        if (!subject) subject = defaultCat.subject;
      }
    }

    if (!subject) {
      let defaultSubject = await Subject.findOne({ slug: 'psychiatry' }) || await Subject.findOne({});
      if (!defaultSubject) {
        defaultSubject = await Subject.create({
          name: 'Psychiatry',
          slug: 'psychiatry',
          description: 'Comprehensive Clinical Psychiatry, DSM-5 Psychopathology, and Psychopharmacology Mind Maps.',
          themeColor: '#E11D48',
          icon: 'Brain',
          displayOrder: 1,
          status: 'published',
        });
      }
      subject = defaultSubject._id;
    }

    const slug = slugify(title, { lower: true, strict: true });
    
    const topic = await Topic.create({
      title,
      slug,
      description,
      subject,
      category,
      parentTopic: parentTopic || null,
      level: computedLevel,
      icon: icon || 'BookOpen',
      color: color || '#7435D5',
      displayOrder: displayOrder || 1,
      mapPosition: mapPosition || { x: 0, y: 0 },
      status: status || 'published',
    });
    
    res.status(201).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.status(200).json({ success: true, topic });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    // Recursively clean up child topics
    const deleteChildren = async (parentId) => {
      const children = await Topic.find({ parentTopic: parentId });
      for (const child of children) {
        await deleteChildren(child._id);
        await child.deleteOne();
      }
    };
    await deleteChildren(topic._id);
    await topic.deleteOne();

    res.status(200).json({ success: true, message: 'Topic and all hierarchical child topics deleted successfully' });
  } catch (error) {
    next(error);
  }
};

import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import slugify from 'slugify';

export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ status: 'published' }).sort({ displayOrder: 1 });
    res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    next(error);
  }
};

export const getSubjectBySlug = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    // Include categories belonging to this subject, enriched with active database subtopics
    const categories = await Category.find({ subject: subject._id, status: 'published' }).sort({ displayOrder: 1 }).lean();
    const dbTopics = await Topic.find({ subject: subject._id }).sort({ displayOrder: 1 }).lean();

    const categoriesWithSubtopics = categories.map(cat => {
      const matchedTopics = dbTopics.filter(t => t.category && t.category.toString() === cat._id.toString());
      return {
        ...cat,
        subtopics: matchedTopics.length > 0 ? matchedTopics : undefined
      };
    });

    res.status(200).json({ success: true, subject, categories: categoriesWithSubtopics });
  } catch (error) {
    next(error);
  }
};

// --- Admin Endpoints ---

export const createSubject = async (req, res, next) => {
  try {
    const { name, description, icon, themeColor, displayOrder, status } = req.body;
    const subject = await Subject.create({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      icon,
      themeColor,
      displayOrder: displayOrder || 1,
      status: status || 'published',
    });
    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    
    await Category.deleteMany({ subject: subject._id });
    await subject.deleteOne();
    res.status(200).json({ success: true, message: 'Subject and affiliated categories deleted successfully' });
  } catch (error) {
    next(error);
  }
};

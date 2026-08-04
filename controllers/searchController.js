import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import StudyMaterial from '../models/StudyMaterial.js';

// @desc    Global text & keyword search across subjects, categories, topics, and materials
// @route   GET /api/search?q=autism
export const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.status(200).json({ success: true, results: [] });
    }

    const regex = new RegExp(query.trim(), 'i');

    const [subjects, categories, topics, materials] = await Promise.all([
      Subject.find({ name: regex, status: 'published' }).limit(5),
      Category.find({ name: regex, status: 'published' }).populate('subject', 'slug').limit(8),
      Topic.find({ $or: [{ title: regex }, { description: regex }], status: 'published' }).limit(10),
      StudyMaterial.find({ $or: [{ title: regex }, { description: regex }], status: 'published' }).populate('topic', 'title slug').limit(10),
    ]);

    // Group results into dropdown categorized items
    const results = [
      ...subjects.map((s) => ({ id: s._id, title: s.name, type: 'Subject', link: `/learn/${s.slug}`, icon: 'Brain' })),
      ...categories.map((c) => ({ id: c._id, title: c.name, type: 'Category', link: `/learn/${c.subject?.slug || 'psychiatry'}/${c.slug}`, icon: 'Activity' })),
      ...topics.map((t) => ({ id: t._id, title: t.title, type: t.level === 1 ? 'Branch' : 'Topic', link: `/topic/${t.slug}`, icon: 'Compass' })),
      ...materials.map((m) => ({ id: m._id, title: m.title, subtitle: m.topic?.title, type: m.type, link: m.type === 'VIDEO' ? `/video/${m._id}` : `/notes/${m._id}`, icon: m.type === 'VIDEO' ? 'Play' : 'FileText' })),
    ];

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};

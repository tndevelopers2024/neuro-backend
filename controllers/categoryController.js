import Category from '../models/Category.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import { buildCategoryMapData } from '../services/mindMapService.js';
import slugify from 'slugify';

export const getAllCategories = async (req, res, next) => {
  try {
    const filter = { status: 'published' };
    if (req.query.subject) {
      const subj = await Subject.findOne({ slug: req.query.subject });
      if (subj) filter.subject = subj._id;
    }
    const categories = await Category.find(filter).populate('subject', 'name slug themeColor').sort({ displayOrder: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const mapData = await buildCategoryMapData(req.params.categorySlug || req.params.slug);
    if (!mapData) return res.status(404).json({ success: false, message: 'Category branch map not found' });
    res.status(200).json({ success: true, mapData, category: mapData.centerNode, branches: mapData.branches });
  } catch (error) {
    next(error);
  }
};

// --- Admin Endpoints ---

export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate('subject', 'name slug').sort({ subject: 1, displayOrder: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, displayOrder, status } = req.body;
    let { subject } = req.body;

    // Defensively resolve subject if not supplied
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

    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({
      subject,
      name,
      slug,
      description,
      icon: icon || 'Activity',
      color: color || '#13A7B5',
      displayOrder: displayOrder || 1,
      status: status || 'published',
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    
    await Topic.deleteMany({ category: category._id });
    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category and all associated topics deleted successfully' });
  } catch (error) {
    next(error);
  }
};

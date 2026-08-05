import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';

// Calculate radial polar coordinates (x, y) distributed across 360 degrees around a center (0, 0)
export const calculateRadialCoordinates = (index, totalCount, radius = 320) => {
  if (totalCount === 0) return { x: 0, y: 0 };
  // Angle in radians (starting from top -PI/2 to move clockwise)
  const angle = (index / totalCount) * 2 * Math.PI - Math.PI / 2;
  const x = Math.round(radius * Math.cos(angle));
  const y = Math.round(radius * Math.sin(angle));
  return { x, y };
};

// Build complete hierarchical data structure for Screen 2 (Category Branch Map)
export const buildCategoryMapData = async (categorySlug) => {
  const category = await Category.findOne({ slug: categorySlug }).populate('subject');
  if (!category) return null;

  // Find all level-1 branch topics under this category
  const branches = await Topic.find({
    category: category._id,
    parentTopic: null,
  }).sort({ displayOrder: 1, createdAt: 1 });

  // For each branch, find its direct level-2 subtopics (e.g., ASD, ADHD under Neurodevelopmental Disorders)
  const branchNodes = await Promise.all(
    branches.map(async (branch, index) => {
      const children = await Topic.find({
        parentTopic: branch._id,
      }).sort({ displayOrder: 1 });

      // Use stored mapPosition if customized by admin, otherwise auto-calculate radial coordinates
      let position = branch.mapPosition;
      if (!position || (position.x === 0 && position.y === 0)) {
        position = calculateRadialCoordinates(index, branches.length, 380);
      }

      return {
        id: branch._id.toString(),
        _id: branch._id.toString(),
        title: branch.title,
        name: branch.title,
        slug: branch.slug,
        icon: branch.icon || 'Activity',
        color: branch.color || '#126BEE',
        displayOrder: branch.displayOrder,
        position,
        subtopics: children.map((child) => ({
          id: child._id.toString(),
          _id: child._id.toString(),
          title: child.title,
          name: child.title,
          slug: child.slug,
          displayOrder: child.displayOrder,
        })),
      };
    })
  );

  return {
    centerNode: {
      id: category._id.toString(),
      _id: category._id.toString(),
      title: category.name,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      subject: category.subject,
    },
    branches: branchNodes,
  };
};

// Build 360-degree orbital data structure for Screen 3 (Topic Starburst Map)
export const buildTopicMapData = async (topicSlug) => {
  const topic = await Topic.findOne({ slug: topicSlug }).populate('category').populate('subject');
  if (!topic) return null;

  // Find direct child lessons/topics under this topic (e.g., History of ASD, Etiology, etc.)
  const children = await Topic.find({
    parentTopic: topic._id,
    status: 'published',
  }).sort({ displayOrder: 1, createdAt: 1 });

  const childNodes = children.map((child, index) => {
    let position = child.mapPosition;
    if (!position || (position.x === 0 && position.y === 0)) {
      position = calculateRadialCoordinates(index, children.length, 320);
    }
    return {
      id: child._id.toString(),
      _id: child._id.toString(),
      title: child.title,
      name: child.title,
      slug: child.slug,
      icon: child.icon || 'Clock',
      color: child.color || '#7435D5',
      displayOrder: child.displayOrder || index + 1,
      numberBadge: index + 1,
      position,
    };
  });

  return {
    centerNode: {
      id: topic._id.toString(),
      _id: topic._id.toString(),
      title: topic.title,
      name: topic.title,
      slug: topic.slug,
      description: topic.description,
      icon: topic.icon || 'Puzzle',
      color: topic.color || '#126BEE',
      category: topic.category,
      subject: topic.subject,
    },
    childTopics: childNodes,
  };
};

// Construct recursive breadcrumbs from any topic up to root Subject
export const getTopicBreadcrumbs = async (topicSlug) => {
  const breadcrumb = [];
  let currentTopic = await Topic.findOne({ slug: topicSlug }).populate('category').populate('subject');

  if (!currentTopic) return breadcrumb;

  // Push immediate topic
  breadcrumb.unshift({ title: currentTopic.title, link: `/topic/${currentTopic.slug}` });

  // Ascend parentTopic trail
  let parentId = currentTopic.parentTopic;
  while (parentId) {
    const parent = await Topic.findById(parentId);
    if (parent) {
      breadcrumb.unshift({ title: parent.title, link: `/topic/${parent.slug}` });
      parentId = parent.parentTopic;
    } else {
      break;
    }
  }

  // Prepend category and subject
  if (currentTopic.category) {
    breadcrumb.unshift({
      title: currentTopic.category.name,
      link: `/learn/${currentTopic.subject?.slug || 'psychiatry'}/${currentTopic.category.slug}`,
    });
  }
  if (currentTopic.subject) {
    breadcrumb.unshift({
      title: currentTopic.subject.name,
      link: `/learn/${currentTopic.subject.slug}`,
    });
  }
  breadcrumb.unshift({ title: 'Home', link: '/' });

  return breadcrumb;
};

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanOrphanedTopics = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Get all valid category IDs
    const categories = await Category.find({}, '_id');
    const validCategoryIds = categories.map(c => c._id);

    // Find and delete all topics whose category is not in the valid list
    const result = await Topic.deleteMany({
      category: { $nin: validCategoryIds }
    });

    console.log(`Deleted ${result.deletedCount} orphaned topics (subtopics).`);

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning topics:', error);
    process.exit(1);
  }
};

cleanOrphanedTopics();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const data = [
  "1. General Psychiatry",
  "2. Core Psychiatry",
  "3. Psychotherapy",
  "4. Psycho-Pharmacology",
  "5. De-Addiction",
  "6. Child Psychiatry",
  "7. Neuro-Psychiatry & CLIP",
  "8. Geriatric Psychiatry",
  "9. Neurobiology",
  "10. Forensic Psychiatry",
  "11. Community Psychiatry & Rehabilitation",
  "12. Special Topics"
];

const unseedData = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const subject = await Subject.findOne({ name: 'Psychiatry' });
    if (!subject) {
      console.log('Subject Psychiatry not found. Exiting.');
      process.exit(0);
    }

    for (const catName of data) {
      const category = await Category.findOne({ name: catName, subject: subject._id });
      if (category) {
        const deletedTopics = await Topic.deleteMany({ category: category._id });
        console.log(`Deleted ${deletedTopics.deletedCount} topics for category: ${category.name}`);
        
        await Category.deleteOne({ _id: category._id });
        console.log(`Deleted category: ${category.name}`);
      } else {
        console.log(`Category not found: ${catName}`);
      }
    }

    console.log('Unseeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error unseeding data:', error);
    process.exit(1);
  }
};

unseedData();

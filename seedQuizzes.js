import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MCQ from './models/MCQ.js';
import Topic from './models/Topic.js';

dotenv.config();

const neuroQuestions = [
  {
    question: "A 65-year-old male presents with a resting tremor, bradykinesia, and cogwheel rigidity. Which of the following areas of the brain is most likely affected?",
    optionA: "Cerebellum",
    optionB: "Substantia Nigra",
    optionC: "Hippocampus",
    optionD: "Frontal Lobe",
    correctAnswer: "B",
    difficulty: "Medium",
    explanation: "The clinical presentation is classic for Parkinson's disease, which is characterized by the degeneration of dopaminergic neurons in the substantia nigra pars compacta."
  },
  {
    question: "Which cranial nerve is responsible for both the motor control of facial expression and taste sensation from the anterior two-thirds of the tongue?",
    optionA: "Trigeminal Nerve (CN V)",
    optionB: "Facial Nerve (CN VII)",
    optionC: "Glossopharyngeal Nerve (CN IX)",
    optionD: "Vagus Nerve (CN X)",
    correctAnswer: "B",
    difficulty: "Easy",
    explanation: "The Facial Nerve (CN VII) supplies motor innervation to the muscles of facial expression and carries special visceral afferent (taste) fibers from the anterior 2/3 of the tongue via the chorda tympani."
  },
  {
    question: "A patient presents with contralateral hemiparesis and hemisensory loss, predominantly affecting the lower extremity, along with urinary incontinence. Which cerebral artery is most likely occluded?",
    optionA: "Middle Cerebral Artery (MCA)",
    optionB: "Anterior Cerebral Artery (ACA)",
    optionC: "Posterior Cerebral Artery (PCA)",
    optionD: "Basilar Artery",
    correctAnswer: "B",
    difficulty: "Hard",
    explanation: "Anterior Cerebral Artery (ACA) occlusion classically presents with contralateral motor and sensory deficits that are more pronounced in the lower limbs compared to the upper limbs, as well as potential urinary incontinence due to medial frontal lobe involvement."
  },
  {
    question: "In the context of an acute ischemic stroke, tissue plasminogen activator (tPA) is generally indicated if administered within what time frame from symptom onset?",
    optionA: "1 to 2 hours",
    optionB: "3 to 4.5 hours",
    optionC: "6 to 8 hours",
    optionD: "12 to 24 hours",
    correctAnswer: "B",
    difficulty: "Medium",
    explanation: "Intravenous tPA is FDA-approved for acute ischemic stroke within 3 hours of symptom onset, and is recommended up to 4.5 hours in eligible patients based on clinical trial extensions."
  },
  {
    question: "Which of the following neurotransmitters is primarily depleted in Alzheimer's disease, particularly in the nucleus basalis of Meynert?",
    optionA: "Dopamine",
    optionB: "Serotonin",
    optionC: "Acetylcholine",
    optionD: "GABA",
    correctAnswer: "C",
    difficulty: "Medium",
    explanation: "Alzheimer's disease is associated with a significant loss of cholinergic neurons, especially in the nucleus basalis of Meynert, leading to decreased levels of acetylcholine."
  }
];

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    // Find a topic to associate these quizzes with
    let topic = await Topic.findOne({ title: { $regex: /neuro/i } });
    
    // If no neuro topic exists, just use any topic
    if (!topic) {
      topic = await Topic.findOne();
    }

    if (!topic) {
      console.log('No topics found in the database. Cannot create MCQs. Please create a topic first.');
      process.exit(1);
    }

    console.log(`Assigning quizzes to topic: ${topic.title} (${topic._id})`);

    const mcqsToInsert = neuroQuestions.map(q => ({
      ...q,
      topic: topic._id,
      subtopic: 'Neurology Clinical Cases'
    }));

    await MCQ.insertMany(mcqsToInsert);
    console.log('Successfully seeded 5 Neurology quizzes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

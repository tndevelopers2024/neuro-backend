import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';
import StudyMaterial from '../models/StudyMaterial.js';
import MCQ from '../models/MCQ.js';
import Flashcard from '../models/Flashcard.js';
import Bookmark from '../models/Bookmark.js';
import PersonalNote from '../models/PersonalNote.js';
import LearningProgress from '../models/LearningProgress.js';
import RecentActivity from '../models/RecentActivity.js';
import { calculateRadialCoordinates } from '../services/mindMapService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neuromind_scholars';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully. Cleaning old data...');

    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Category.deleteMany({}),
      Topic.deleteMany({}),
      StudyMaterial.deleteMany({}),
      MCQ.deleteMany({}),
      Flashcard.deleteMany({}),
      Bookmark.deleteMany({}),
      PersonalNote.deleteMany({}),
      LearningProgress.deleteMany({}),
      RecentActivity.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo student and admin credentials...');
    const adminUser = await User.create({
      fullName: 'Dr. Alistair Vance (Director)',
      email: 'admin@neuromind.edu',
      password: 'password123',
      role: 'admin',
      specialization: 'Professor of Neuropsychiatry',
      studyStreak: 15,
    });

    const studentUser = await User.create({
      fullName: 'Resident Dr. Sarah Jenkins',
      email: 'resident@neuromind.edu',
      password: 'password123',
      role: 'student',
      course: 'MD Psychiatry Residency',
      year: 'PG Year 2',
      specialization: 'Child & Adolescent Psychiatry',
      studyStreak: 7,
    });

    console.log('[Seed] Creating Core Subject: Psychiatry...');
    const psychiatry = await Subject.create({
      name: 'Psychiatry',
      slug: 'psychiatry',
      description: 'Explore, Connect & Understand Clinical Mental Health Sciences.',
      icon: 'Brain',
      themeColor: '#126BEE',
      displayOrder: 1,
    });

    await Subject.create({
      name: 'Neurology',
      slug: 'neurology',
      description: 'Neural circuits, neurovascular anatomy, and neurodegenerative mechanisms.',
      icon: 'Cpu',
      themeColor: '#7435D5',
      displayOrder: 2,
    });

    console.log('[Seed] Hydrating 12 Category Orbits for Screen 1...');
    const categoryConfigs = [
      { name: 'General Psychiatry', icon: 'Brain', color: '#126BEE', desc: 'Psychopathological evaluation and nosology.' },
      { name: 'Core Psychiatry', icon: 'Stethoscope', color: '#21A447', desc: 'Clinical diagnostic manuals DSM-5 and ICD-11.' },
      { name: 'De-addiction', icon: 'Pill', color: '#F17B18', desc: 'Substance use disorders and neurological withdrawal mechanisms.' },
      { name: 'Neuropsychiatry & CLP', icon: 'Network', color: '#21A447', desc: 'Consultation-Liaison and epilepsy comorbidities.' },
      { name: 'Geriatric Psychiatry', icon: 'UserCheck', color: '#7435D5', desc: 'Alzheimer disease, vascular dementia, and late-life depression.' },
      { name: 'Special Topics', icon: 'Star', color: '#126BEE', desc: 'Suicidology, psychiatric emergencies, and sleep medicine.' },
      { name: 'Community Psychiatry & Rehabilitation', icon: 'Users', color: '#13A7B5', desc: 'Social psychiatry, tele-mental health, and psychosocial rehabilitation.' },
      { name: 'Forensic Psychiatry', icon: 'Scale', color: '#F17B18', desc: 'Criminal responsibility, civil rights, and mental healthcare acts.' },
      { name: 'Neurobiology', icon: 'Share2', color: '#126BEE', desc: 'Synaptic transmission, neuroimaging, and neurotransmitter cascades.' },
      { name: 'Child Psychiatry', icon: 'Baby', color: '#13A7B5', desc: 'Neurodevelopmental and child emotional disorders.' },
      { name: 'Psychopharmacology', icon: 'Capsule', color: '#DB2674', desc: 'Receptor kinetics, SSRIs, antipsychotics, and mood stabilizers.' },
      { name: 'Psychotherapy', icon: 'MessageSquare', color: '#DB2674', desc: 'Cognitive behavioral therapy, psychodynamic systems, and DBT.' },
    ];

    const categories = {};
    for (let i = 0; i < categoryConfigs.length; i++) {
      const c = categoryConfigs[i];
      const cat = await Category.create({
        subject: psychiatry._id,
        name: c.name,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: c.desc,
        icon: c.icon,
        color: c.color,
        displayOrder: i + 1,
      });
      categories[cat.name] = cat;
    }

    const childPsychiatry = categories['Child Psychiatry'];
    console.log('[Seed] Hydrating Child Psychiatry Branches and Subtopics (Screen 2)...');

    const branchConfigs = [
      {
        title: 'Neurodevelopmental Disorders',
        icon: 'Brain',
        color: '#126BEE',
        children: [
          'Intellectual Disability',
          'Autism Spectrum Disorder (ASD)',
          'ADHD',
          'Specific Learning Disorders',
          'Motor Disorders (DCD, Tic Disorders)',
          'Communication Disorders',
        ],
      },
      {
        title: 'Behavioral Disorders',
        icon: 'UserMinus',
        color: '#126BEE',
        children: [
          'Oppositional Defiant Disorder',
          'Conduct Disorder',
          'Disruptive Mood Dysregulation Disorder',
          'Intermittent Explosive Disorder',
          'Temper Tantrums',
        ],
      },
      {
        title: 'Emotional Disorders',
        icon: 'Smile',
        color: '#7435D5',
        children: [
          'Anxiety Disorders',
          'Depressive Disorders',
          'Bipolar Disorder (Early Onset)',
          'Separation Anxiety Disorder',
          'Selective Mutism',
        ],
      },
      {
        title: 'Learning Disorders',
        icon: 'BookOpen',
        color: '#DB2674',
        children: [
          'Dyslexia',
          'Dyscalculia',
          'Dysgraphia',
          'Nonverbal Learning Disorder',
        ],
      },
      {
        title: 'Assessment & Rating Scales',
        icon: 'ClipboardList',
        color: '#F17B18',
        children: [
          'Developmental Assessment Tools',
          'Behavior Rating Scales',
          'Intelligence Scales',
          'Autism Assessment Tools',
          'ADHD Rating Scales',
          'Mood & Anxiety Scales',
        ],
      },
      {
        title: 'Psychotherapies',
        icon: 'Users',
        color: '#21A447',
        children: [
          'Play Therapy',
          'Cognitive Behavioral Therapy (CBT)',
          'Parent Management Training',
          'Family Therapy',
          'Social Skills Training',
          'Behavioral Therapy / ABA',
        ],
      },
      {
        title: 'Psychopharmacology',
        icon: 'Pill',
        color: '#F17B18',
        children: [
          'ADHD Medications',
          'Antidepressants',
          'Mood Stabilizers',
          'Antipsychotics',
          'Anxiolytics',
          'Other Medications in Children',
        ],
      },
      {
        title: 'Family & Parenting Issues',
        icon: 'Home',
        color: '#7435D5',
        children: [
          'Parent-Child Relationship Problems',
          'Parenting Styles & Strategies',
          'Family Conflict',
          'Attachment Issues',
          'Parental Mental Health Impact',
        ],
      },
      {
        title: 'Special Areas',
        icon: 'Star',
        color: '#126BEE',
        children: [
          'Child & Adolescent Suicidality',
          'Trauma & PTSD in Children',
          'Eating Disorders',
          'Sleep Disorders',
          'Gender Dysphoria',
          'Pediatric Consultation Liaison',
        ],
      },
      {
        title: 'Child Psychopharmacology Special Considerations',
        icon: 'ShieldCheck',
        color: '#13A7B5',
        children: [
          'Dosing Principles in Children',
          'Side Effects Monitoring',
          'Drug Interactions',
          'Long-term Safety',
          'Informed Consent & Assent',
        ],
      },
    ];

    let asdTopic = null;
    let historyOfAsdTopic = null;

    for (let i = 0; i < branchConfigs.length; i++) {
      const b = branchConfigs[i];
      const pos = calculateRadialCoordinates(i, branchConfigs.length, 420);
      const branchTopic = await Topic.create({
        title: b.title,
        description: `Comprehensive diagnostic overview and multidisciplinary management protocols for ${b.title}.`,
        subject: psychiatry._id,
        category: childPsychiatry._id,
        parentTopic: null,
        level: 1,
        icon: b.icon,
        color: b.color,
        displayOrder: i + 1,
        mapPosition: pos,
      });

      for (let j = 0; j < b.children.length; j++) {
        const childTitle = b.children[j];
        const isASD = childTitle.includes('Autism Spectrum Disorder');
        const subTopic = await Topic.create({
          title: childTitle,
          slug: isASD ? 'autism-spectrum-disorder' : undefined,
          description: `Clinical diagnosis, neurobiology, and evidence-based therapeutic guidelines for ${childTitle}.`,
          subject: psychiatry._id,
          category: childPsychiatry._id,
          parentTopic: branchTopic._id,
          level: 2,
          icon: isASD ? 'Puzzle' : 'BookOpen',
          color: b.color,
          displayOrder: j + 1,
        });

        if (isASD) {
          asdTopic = subTopic;
        }
      }
    }

    console.log('[Seed] Hydrating 16 Autism Spectrum Disorder (ASD) Topic Nodes (Screen 3)...');
    const asdLessons = [
      { title: 'History of ASD', icon: 'Clock', color: '#7435D5', slug: 'history-of-asd' },
      { title: 'Nosology & Classification', icon: 'BookOpen', color: '#21A447' },
      { title: 'Clinical Features', icon: 'UserCheck', color: '#F17B18' },
      { title: 'Epidemiology', icon: 'Globe', color: '#DB2674' },
      { title: 'Etiology', icon: 'Activity', color: '#21A447' },
      { title: 'Assessment & Diagnosis', icon: 'ClipboardCheck', color: '#13A7B5' },
      { title: 'Differential Diagnosis', icon: 'GitCompare', color: '#F17B18' },
      { title: 'Investigations', icon: 'Search', color: '#21A447' },
      { title: 'Management', icon: 'ClipboardList', color: '#126BEE' },
      { title: 'Pharmacological Management', icon: 'Pill', color: '#F17B18' },
      { title: 'Therapeutic Interventions', icon: 'HeartHandshake', color: '#21A447' },
      { title: 'Prognosis & Outcome', icon: 'TrendingUp', color: '#DB2674' },
      { title: 'Family Support & Counseling', icon: 'Users', color: '#7435D5' },
      { title: 'Comorbidities in Autism', icon: 'Layers', color: '#13A7B5' },
      { title: 'Lifespan Perspective & Adulthood', icon: 'Compass', color: '#126BEE' },
      { title: 'Recent Advances & Future Directions', icon: 'Rocket', color: '#13A7B5' },
    ];

    for (let k = 0; k < asdLessons.length; k++) {
      const l = asdLessons[k];
      const pos = calculateRadialCoordinates(k, asdLessons.length, 330);
      const lesson = await Topic.create({
        title: l.title,
        slug: l.slug || undefined,
        description: `Learn about the clinical guidelines, historical perspectives, and evolution of concepts related to ${l.title}.`,
        subject: psychiatry._id,
        category: childPsychiatry._id,
        parentTopic: asdTopic._id,
        level: 3,
        icon: l.icon,
        color: l.color,
        displayOrder: k + 1,
        mapPosition: pos,
      });

      if (l.title === 'History of ASD') {
        historyOfAsdTopic = lesson;
      }
    }

    console.log('[Seed] Hydrating Study Materials, MCQs, and Flashcards for History of ASD (Screen 4)...');

    await StudyMaterial.create({
      topic: historyOfAsdTopic._id,
      title: 'Watch Video: Evolution of ASD Concepts',
      description: 'Watch high-quality visual video lectures detailing Leo Kanner, Hans Asperger, and DSM revisions over decades.',
      type: 'VIDEO',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
      duration: '24 min',
      displayOrder: 1,
    });

    await StudyMaterial.create({
      topic: historyOfAsdTopic._id,
      title: 'Read Lecture Notes: Comprehensive Synthesis',
      description: 'Read comprehensive lecture notes complete with diagnostic comparison diagrams, timeline tables, and clinical pearls.',
      type: 'NOTES',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      richTextContent: `
        <h2>Historical Foundations of Autism Spectrum Disorder</h2>
        <p>The concept of Autism Spectrum Disorder has undergone dramatic clinical evolution over the past 80 years. Initially misclassified under schizophrenia spectrum symptoms, modern psychiatry now categorizes ASD as a neurodevelopmental disorder characterized by early-onset social-communication deficits and repetitive sensorimotor behaviors.</p>
        
        <h3>Key Historical Milestones</h3>
        <ul>
          <li><strong>1911 (Eugen Bleuler):</strong> First coined the term <em>"autism"</em> (from Greek <em>autos</em> meaning self) to describe the idiosyncratic withdrawal observed in adult schizophrenia patients.</li>
          <li><strong>1943 (Leo Kanner):</strong> Published landmark classic paper <em>"Autistic Disturbances of Affective Contact"</em> detailing 11 children who exhibited profound preference for aloneness and intense obsessive desire for the preservation of sameness.</li>
          <li><strong>1944 (Hans Asperger):</strong> Working independently in Vienna, published a paper on <em>"Autistic Psychopathy"</em> describing older boys with impaired empathy and idiosyncratic special interests but preserved grammar and superior intelligence.</li>
          <li><strong>1980 (DSM-III):</strong> For the very first time, autism was separated entirely from childhood schizophrenia and officially recognized under Pervasive Developmental Disorders (PDD).</li>
          <li><strong>2013 (DSM-5):</strong> Created an overarching diagnostic continuum ("Autism Spectrum Disorder") subsuming Autistic Disorder, Asperger Syndrome, and PDD-NOS into a unified Dyad of Impairments.</li>
        </ul>

        <div style="background-color: #F8FAFF; padding: 18px; border-left: 5px solid #126BEE; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #071A5C; margin-top: 0;">💎 Clinical Pearl for Residents</h4>
          <p style="margin-bottom: 0;">Remember the diagnostic shift: DSM-IV required a classic triad (social, communication, stereotypies), whereas DSM-5 unified social and communicative impairments into a single domain while explicitly adding <strong>hypo- or hyper-reactivity to sensory stimuli</strong> under restricted behaviors.</p>
        </div>
      `,
      displayOrder: 2,
    });

    console.log('[Seed] Hydrating sample MCQs and Flashcards...');
    await MCQ.create([
      {
        topic: historyOfAsdTopic._id,
        question: 'Who originally coined the term "autism" in the psychiatric literature in 1911?',
        optionA: 'Leo Kanner',
        optionB: 'Hans Asperger',
        optionC: 'Eugen Bleuler',
        optionD: 'Sigmund Freud',
        correctAnswer: 'C',
        explanation: 'Eugen Bleuler first introduced the term in 1911 to delineate the profound social withdrawal and isolation from external reality observed in schizophrenic patients.',
        difficulty: 'Easy',
      },
      {
        topic: historyOfAsdTopic._id,
        question: 'Which edition of the Diagnostic and Statistical Manual (DSM) first separated Autism from Childhood Schizophrenia as an independent clinical diagnosis?',
        optionA: 'DSM-I (1952)',
        optionB: 'DSM-II (1968)',
        optionC: 'DSM-III (1980)',
        optionD: 'DSM-IV (1994)',
        correctAnswer: 'C',
        explanation: 'DSM-III (1980) was a major paradigm shift that formally distinguished autism from schizophrenia spectra by placing it under Pervasive Developmental Disorders (PDD).',
        difficulty: 'Medium',
      },
      {
        topic: historyOfAsdTopic._id,
        question: 'A resident comparing Leo Kanner’s original 1943 cohort with Hans Asperger’s 1944 cohort notes a significant clinical divergence. Which feature best differentiates Asperger’s original description from Kanner’s?',
        optionA: 'Complete absence of repetitive behaviors',
        optionB: 'Preserved cognitive function and verbal articulation',
        optionC: 'Onset in late adulthood after age 30',
        optionD: 'Exclusive association with temporal lobe epilepsy',
        correctAnswer: 'B',
        explanation: 'Hans Asperger described children with remarkably sophisticated grammatical vocabulary and normal-to-superior intellectual ability, in contrast to many of Kanner’s cases who demonstrated significant cognitive and language delays.',
        difficulty: 'Clinical Case',
      },
    ]);

    await Flashcard.create([
      {
        topic: historyOfAsdTopic._id,
        frontTerm: 'Leo Kanner (1943) Classic Paper Title',
        backDefinition: '"Autistic Disturbances of Affective Contact" – documented 11 children exhibiting profound preference for aloneness and obsessive preservation of sameness.',
        categoryTag: 'Historical Pioneers',
        displayOrder: 1,
      },
      {
        topic: historyOfAsdTopic._id,
        frontTerm: 'DSM-5 Diagnostic Criteria Dyad',
        backDefinition: '(1) Persistent deficits in social communication & social interaction across multiple contexts.\n(2) Restricted, repetitive patterns of behavior, interests, or activities (now including sensory hyper/hypo reactivity).',
        categoryTag: 'Diagnostic Nosology',
        displayOrder: 2,
      },
    ]);

    console.log('[Seed] Hydrating user bookmarks, personal notes, and study timeline for Resident Demo Account...');
    await Bookmark.create({
      user: studentUser._id,
      targetType: 'Topic',
      targetId: historyOfAsdTopic._id,
      title: 'History of ASD',
      subtitle: 'Child Psychiatry → Autism Spectrum Disorder',
      link: `/topic/${historyOfAsdTopic.slug}`,
      icon: 'Bookmark',
    });

    await PersonalNote.create({
      user: studentUser._id,
      title: 'Resident Rounds: Autism Screening Tools',
      content: 'Key clinical differentiator: M-CHAT-R/F is performed between 16-30 months during pediatric visits. ADOS-2 remains the gold standard semi-structured evaluation tool across lifespan.',
      relatedTopic: historyOfAsdTopic._id,
      topicTitle: 'History of ASD & Assessment',
    });

    await RecentActivity.create([
      {
        user: studentUser._id,
        title: 'History of ASD',
        subtitle: 'Viewed 10 minutes ago • Child Psychiatry',
        link: `/topic/${historyOfAsdTopic.slug}`,
        type: 'Topic',
        icon: 'Clock',
      },
      {
        user: studentUser._id,
        title: 'Autism Spectrum Disorder (ASD) Branch Map',
        subtitle: 'Viewed 1 hour ago • Neurodevelopmental Disorders',
        link: `/topic/${asdTopic.slug}`,
        type: 'Topic',
        icon: 'Puzzle',
      },
      {
        user: studentUser._id,
        title: 'Child Psychiatry Knowledge Domain',
        subtitle: 'Viewed yesterday • Psychiatry Core',
        link: `/learn/psychiatry/child-psychiatry`,
        type: 'Topic',
        icon: 'Activity',
      },
    ]);

    console.log('\n==================================================');
    console.log('✅ NEUROMIND SCHOLARS DATABASE SEEDING COMPLETED');
    console.log('Admin Account    : admin@neuromind.edu / password123');
    console.log('Resident Account : resident@neuromind.edu / password123');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();

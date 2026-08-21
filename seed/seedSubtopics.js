import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import Subject from '../models/Subject.js';
import Category from '../models/Category.js';
import Topic from '../models/Topic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the root of server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const data = [
  {
    "category": "1. General Psychiatry",
    "topics": [
      {
        "title": "Introduction to Psychiatry",
        "subtopics": ["History of Psychiatry", "Scope of Psychiatry", "Mental Health & Mental Illness", "Psychiatric Services"]
      },
      {
        "title": "Mental Status Examination",
        "subtopics": ["Appearance & Behavior", "Speech & Thought", "Mood & Affect", "Perception & Cognition", "Insight & Judgment"]
      },
      {
        "title": "Psychiatric History Taking",
        "subtopics": ["Presenting Complaints", "History of Present Illness", "Past Psychiatric History", "Personal & Family History", "Substance Use History"]
      },
      {
        "title": "Classification of Mental Disorders",
        "subtopics": ["ICD Classification", "DSM Classification", "Diagnostic Criteria", "Differential Diagnosis"]
      },
      {
        "title": "Psychopathology",
        "subtopics": ["Disorders of Thought", "Disorders of Perception", "Disorders of Mood", "Disorders of Cognition", "Disorders of Behavior"]
      },
      {
        "title": "Diagnostic Assessment",
        "subtopics": ["Clinical Interview", "Psychological Assessment", "Laboratory Investigations", "Neuroimaging", "Differential Diagnosis"]
      },
      {
        "title": "Psychiatric Emergencies",
        "subtopics": ["Suicidal Behavior", "Acute Psychosis", "Violent & Agitated Behavior", "Delirium", "Catatonia"]
      },
      {
        "title": "Treatment Principles",
        "subtopics": ["Pharmacotherapy", "Psychotherapy", "Behavioral Therapy", "ECT", "Rehabilitation"]
      }
    ]
  },
  {
    "category": "2. Core Psychiatry",
    "topics": [
      {
        "title": "Schizophrenia & Psychotic Disorders",
        "subtopics": ["Positive Symptoms", "Negative Symptoms", "Schizophrenia", "Schizoaffective Disorder", "Acute Psychosis"]
      },
      {
        "title": "Mood Disorders",
        "subtopics": ["Major Depressive Disorder", "Bipolar Disorder", "Mania & Hypomania", "Persistent Depressive Disorder", "Treatment of Mood Disorders"]
      },
      {
        "title": "Anxiety Disorders",
        "subtopics": ["Generalized Anxiety Disorder", "Panic Disorder", "Social Anxiety Disorder", "Specific Phobias", "Anxiety Management"]
      },
      {
        "title": "Obsessive-Compulsive Disorder",
        "subtopics": ["Obsessions", "Compulsions", "OCD Diagnosis", "Related Disorders", "OCD Treatment"]
      },
      {
        "title": "Trauma & Stressor-Related Disorders",
        "subtopics": ["Acute Stress Disorder", "Post-Traumatic Stress Disorder", "Adjustment Disorder", "Trauma Assessment", "Trauma-Focused Therapy"]
      },
      {
        "title": "Personality Disorders",
        "subtopics": ["Cluster A Disorders", "Cluster B Disorders", "Cluster C Disorders", "Borderline Personality Disorder", "Personality Assessment"]
      },
      {
        "title": "Somatic Symptom Disorders",
        "subtopics": ["Somatic Symptom Disorder", "Illness Anxiety Disorder", "Conversion Disorder", "Factitious Disorder", "Management Principles"]
      },
      {
        "title": "Dissociative Disorders",
        "subtopics": ["Dissociative Amnesia", "Dissociative Identity Disorder", "Depersonalization", "Derealization", "Treatment Approaches"]
      },
      {
        "title": "Sleep Disorders",
        "subtopics": ["Insomnia", "Hypersomnolence", "Narcolepsy", "Parasomnias", "Circadian Rhythm Disorders"]
      }
    ]
  },
  {
    "category": "3. Psychotherapy",
    "topics": [
      {
        "title": "Cognitive Behavioral Therapy (CBT)",
        "subtopics": ["Cognitive Restructuring", "Behavioral Activation", "Exposure Techniques", "Thought Records"]
      },
      {
        "title": "Supportive Psychotherapy",
        "subtopics": ["Therapeutic Relationship", "Emotional Support", "Problem Solving", "Coping Skills"]
      },
      {
        "title": "Psychodynamic Therapy",
        "subtopics": ["Unconscious Processes", "Defense Mechanisms", "Transference", "Insight-Oriented Therapy"]
      },
      {
        "title": "Behavioral Therapy",
        "subtopics": ["Classical Conditioning", "Operant Conditioning", "Systematic Desensitization", "Exposure Therapy"]
      },
      {
        "title": "Family Therapy",
        "subtopics": ["Family Assessment", "Communication Patterns", "Family Dynamics", "Conflict Resolution"]
      },
      {
        "title": "Group Therapy",
        "subtopics": ["Group Formation", "Group Dynamics", "Therapeutic Factors", "Group Facilitation"]
      },
      {
        "title": "Interpersonal Therapy",
        "subtopics": ["Interpersonal Conflicts", "Role Transitions", "Grief & Loss", "Relationship Difficulties"]
      },
      {
        "title": "Motivational Interviewing",
        "subtopics": ["Motivation for Change", "Exploring Ambivalence", "Change Talk", "Relapse Prevention"]
      }
    ]
  },
  {
    "category": "4. Psycho-Pharmacology",
    "topics": [
      {
        "title": "Antidepressants",
        "subtopics": ["SSRIs", "SNRIs", "Tricyclic Antidepressants", "MAO Inhibitors", "Adverse Effects"]
      },
      {
        "title": "Antipsychotics",
        "subtopics": ["Typical Antipsychotics", "Atypical Antipsychotics", "Clozapine", "Extrapyramidal Symptoms", "Metabolic Effects"]
      },
      {
        "title": "Mood Stabilizers",
        "subtopics": ["Lithium", "Valproate", "Carbamazepine", "Lamotrigine", "Therapeutic Monitoring"]
      },
      {
        "title": "Anxiolytics",
        "subtopics": ["Benzodiazepines", "Buspirone", "Beta Blockers", "Indications", "Adverse Effects"]
      },
      {
        "title": "Sedative-Hypnotics",
        "subtopics": ["Benzodiazepine Hypnotics", "Z-Drugs", "Melatonin", "Sleep Medication Safety"]
      },
      {
        "title": "Stimulants",
        "subtopics": ["Methylphenidate", "Amphetamines", "ADHD Treatment", "Stimulant Side Effects"]
      },
      {
        "title": "Drug Interactions",
        "subtopics": ["Pharmacokinetic Interactions", "Pharmacodynamic Interactions", "CYP450 Interactions", "Food & Drug Interactions"]
      },
      {
        "title": "Adverse Effects & Monitoring",
        "subtopics": ["Metabolic Monitoring", "Neurological Effects", "Cardiac Effects", "Laboratory Monitoring", "Drug Toxicity"]
      }
    ]
  },
  {
    "category": "5. De-Addiction",
    "topics": [
      {
        "title": "Substance Use Disorders",
        "subtopics": ["Diagnosis", "Dependence", "Craving", "Intoxication", "Relapse"]
      },
      {
        "title": "Alcohol Dependence",
        "subtopics": ["Alcohol Intoxication", "Alcohol Withdrawal", "Delirium Tremens", "Alcohol-Related Disorders", "Treatment"]
      },
      {
        "title": "Opioid Dependence",
        "subtopics": ["Opioid Intoxication", "Opioid Withdrawal", "Methadone Treatment", "Buprenorphine Treatment", "Overdose Management"]
      },
      {
        "title": "Cannabis Use",
        "subtopics": ["Cannabis Intoxication", "Cannabis Withdrawal", "Cannabis Use Disorder", "Psychiatric Effects"]
      },
      {
        "title": "Tobacco & Nicotine Dependence",
        "subtopics": ["Nicotine Dependence", "Withdrawal Symptoms", "Nicotine Replacement", "Smoking Cessation"]
      },
      {
        "title": "Stimulant Use",
        "subtopics": ["Cocaine Use", "Amphetamine Use", "Stimulant Intoxication", "Stimulant Withdrawal"]
      },
      {
        "title": "Withdrawal Syndromes",
        "subtopics": ["Alcohol Withdrawal", "Opioid Withdrawal", "Benzodiazepine Withdrawal", "Stimulant Withdrawal"]
      },
      {
        "title": "Detoxification",
        "subtopics": ["Medical Assessment", "Withdrawal Management", "Medication-Assisted Treatment", "Monitoring"]
      },
      {
        "title": "Relapse Prevention",
        "subtopics": ["Trigger Identification", "Coping Strategies", "Craving Management", "Relapse Prevention Planning"]
      },
      {
        "title": "Rehabilitation",
        "subtopics": ["Residential Rehabilitation", "Psychosocial Rehabilitation", "Family Support", "Vocational Rehabilitation"]
      }
    ]
  },
  {
    "category": "6. Child Psychiatry",
    "topics": [
      {
        "title": "Child Development",
        "subtopics": ["Physical Development", "Cognitive Development", "Language Development", "Social Development"]
      },
      {
        "title": "Autism Spectrum Disorder",
        "subtopics": ["Social Communication", "Restricted Behaviors", "Early Identification", "Behavioral Intervention", "Family Support"]
      },
      {
        "title": "ADHD",
        "subtopics": ["Inattention", "Hyperactivity", "Impulsivity", "Diagnosis", "Treatment"]
      },
      {
        "title": "Intellectual Disability",
        "subtopics": ["Intellectual Functioning", "Adaptive Functioning", "Severity Classification", "Early Intervention"]
      },
      {
        "title": "Learning Disorders",
        "subtopics": ["Dyslexia", "Dysgraphia", "Dyscalculia", "Educational Assessment"]
      },
      {
        "title": "Communication Disorders",
        "subtopics": ["Language Disorder", "Speech Sound Disorder", "Fluency Disorder", "Social Communication Disorder"]
      },
      {
        "title": "Conduct Disorder",
        "subtopics": ["Aggressive Behavior", "Destructive Behavior", "Deceitfulness", "Rule Violations"]
      },
      {
        "title": "Oppositional Defiant Disorder",
        "subtopics": ["Defiant Behavior", "Irritability", "Argumentative Behavior", "Behavioral Management"]
      },
      {
        "title": "Childhood Anxiety & Depression",
        "subtopics": ["Separation Anxiety", "Social Anxiety", "Childhood Depression", "School Refusal"]
      },
      {
        "title": "Childhood Psychosis",
        "subtopics": ["Early-Onset Psychosis", "Hallucinations", "Delusions", "Differential Diagnosis"]
      }
    ]
  },
  {
    "category": "7. Neuro-Psychiatry & CLIP",
    "topics": [
      {
        "title": "Neurocognitive Disorders",
        "subtopics": ["Mild Neurocognitive Disorder", "Major Neurocognitive Disorder", "Cognitive Assessment", "Behavioral Symptoms"]
      },
      {
        "title": "Delirium",
        "subtopics": ["Acute Confusional State", "Causes", "Clinical Features", "Assessment & Management"]
      },
      {
        "title": "Dementia",
        "subtopics": ["Alzheimer’s Disease", "Vascular Dementia", "Lewy Body Dementia", "Frontotemporal Dementia"]
      },
      {
        "title": "Epilepsy & Psychiatric Manifestations",
        "subtopics": ["Peri-Ictal Symptoms", "Post-Ictal Psychosis", "Mood Disorders", "Antiepileptic Drugs"]
      },
      {
        "title": "Movement Disorders",
        "subtopics": ["Parkinson’s Disease", "Huntington’s Disease", "Tremor Disorders", "Psychiatric Manifestations"]
      },
      {
        "title": "Traumatic Brain Injury",
        "subtopics": ["Mild TBI", "Moderate & Severe TBI", "Post-Concussion Syndrome", "Behavioral Changes"]
      },
      {
        "title": "Neuropsychiatric Symptoms",
        "subtopics": ["Cognitive Dysfunction", "Behavioral Changes", "Mood Symptoms", "Psychosis"]
      },
      {
        "title": "Psychosomatic & Neurological Conditions",
        "subtopics": ["Functional Neurological Symptoms", "Psychogenic Seizures", "Somatic Symptoms", "Mind-Body Interaction"]
      }
    ]
  },
  {
    "category": "8. Geriatric Psychiatry",
    "topics": [
      {
        "title": "Depression in Older Adults",
        "subtopics": ["Late-Life Depression", "Risk Factors", "Clinical Features", "Treatment"]
      },
      {
        "title": "Anxiety in Elderly",
        "subtopics": ["Generalized Anxiety", "Panic Symptoms", "Phobias", "Treatment"]
      },
      {
        "title": "Dementia",
        "subtopics": ["Alzheimer’s Disease", "Vascular Dementia", "Lewy Body Dementia", "Frontotemporal Dementia", "Early Symptoms", "Disease Progression", "Cognitive Decline", "Treatment"]
      },
      {
        "title": "Delirium",
        "subtopics": ["Risk Factors", "Clinical Features", "Causes", "Management"]
      },
      {
        "title": "Late-Life Psychosis",
        "subtopics": ["Late-Onset Psychosis", "Delusions", "Hallucinations", "Differential Diagnosis"]
      },
      {
        "title": "Behavioral & Psychological Symptoms",
        "subtopics": ["Agitation", "Aggression", "Wandering", "Sleep Disturbances"]
      },
      {
        "title": "Suicide Risk in Elderly",
        "subtopics": ["Risk Factors", "Warning Signs", "Risk Assessment", "Prevention"]
      },
      {
        "title": "Elder Abuse & Neglect",
        "subtopics": ["Physical Abuse", "Emotional Abuse", "Financial Abuse", "Neglect"]
      }
    ]
  },
  {
    "category": "9. Neurobiology",
    "topics": [
      {
        "title": "Brain Structure & Function",
        "subtopics": ["Cerebral Cortex", "Limbic System", "Basal Ganglia", "Prefrontal Cortex"]
      },
      {
        "title": "Neurotransmitters",
        "subtopics": ["Dopamine", "Serotonin", "GABA", "Glutamate"]
      },
      {
        "title": "Dopamine Pathways",
        "subtopics": ["Mesolimbic Pathway", "Mesocortical Pathway", "Nigrostriatal Pathway", "Tuberoinfundibular Pathway"]
      },
      {
        "title": "Serotonin System",
        "subtopics": ["Serotonin Receptors", "Serotonin Pathways", "Mood Regulation", "Serotonin-Related Disorders"]
      },
      {
        "title": "GABA & Glutamate",
        "subtopics": ["GABA Function", "Glutamate Function", "Excitatory-Inhibitory Balance", "Psychiatric Disorders"]
      },
      {
        "title": "Neuroendocrinology",
        "subtopics": ["HPA Axis", "Thyroid Function", "Cortisol", "Reproductive Hormones"]
      },
      {
        "title": "Genetics of Mental Disorders",
        "subtopics": ["Genetic Risk", "Heritability", "Gene-Environment Interaction", "Epigenetics"]
      },
      {
        "title": "Brain Imaging",
        "subtopics": ["CT Scan", "MRI", "PET", "Functional MRI"]
      },
      {
        "title": "Biological Basis of Psychiatric Disorders",
        "subtopics": ["Biological Models", "Genetic Factors", "Neurochemical Factors", "Environmental Factors"]
      }
    ]
  },
  {
    "category": "10. Forensic Psychiatry",
    "topics": [
      {
        "title": "Mental Illness & Law",
        "subtopics": ["Mental Health Legislation", "Patient Rights", "Consent", "Confidentiality"]
      },
      {
        "title": "Criminal Responsibility",
        "subtopics": ["Legal Insanity", "Mental State Examination", "Criminal Intent", "Psychiatric Evaluation"]
      },
      {
        "title": "Fitness to Stand Trial",
        "subtopics": ["Competency Assessment", "Understanding Court Proceedings", "Ability to Communicate", "Fitness Evaluation"]
      },
      {
        "title": "Risk Assessment",
        "subtopics": ["Violence Risk", "Suicide Risk", "Recidivism Risk", "Risk Management"]
      },
      {
        "title": "Violence & Aggression",
        "subtopics": ["Causes of Aggression", "Risk Factors", "Behavioral Assessment", "Management"]
      },
      {
        "title": "Sexual Offences & Psychiatry",
        "subtopics": ["Sexual Disorders", "Offender Assessment", "Risk Assessment", "Treatment"]
      },
      {
        "title": "Civil Capacity",
        "subtopics": ["Decision-Making Capacity", "Testamentary Capacity", "Financial Capacity", "Guardianship"]
      },
      {
        "title": "Psychiatric Evaluation in Courts",
        "subtopics": ["Forensic Interview", "Mental Status Examination", "Documentation", "Expert Testimony"]
      },
      {
        "title": "Ethics & Confidentiality",
        "subtopics": ["Professional Ethics", "Patient Confidentiality", "Informed Consent", "Ethical Dilemmas"]
      }
    ]
  },
  {
    "category": "11. Community Psychiatry & Rehabilitation",
    "topics": [
      {
        "title": "Community Mental Health",
        "subtopics": ["Community Mental Health Services", "Early Intervention", "Mental Health Awareness", "Outreach Programs"]
      },
      {
        "title": "Mental Health Services",
        "subtopics": ["Primary Mental Healthcare", "Secondary Care", "Tertiary Care", "Referral Systems"]
      },
      {
        "title": "Psychiatric Rehabilitation",
        "subtopics": ["Functional Assessment", "Skill Development", "Social Rehabilitation", "Independent Living"]
      },
      {
        "title": "Recovery Model",
        "subtopics": ["Recovery Principles", "Patient Empowerment", "Self-Management", "Community Integration"]
      },
      {
        "title": "Community-Based Treatment",
        "subtopics": ["Home-Based Care", "Community Clinics", "Outreach Services", "Case Management"]
      },
      {
        "title": "Social Skills Training",
        "subtopics": ["Communication Skills", "Interpersonal Skills", "Problem Solving", "Social Interaction"]
      },
      {
        "title": "Vocational Rehabilitation",
        "subtopics": ["Work Assessment", "Job Skills", "Supported Employment", "Workplace Reintegration"]
      },
      {
        "title": "Family & Caregiver Support",
        "subtopics": ["Psychoeducation", "Caregiver Burden", "Family Counseling", "Support Groups"]
      },
      {
        "title": "Mental Health Promotion",
        "subtopics": ["Mental Health Education", "Prevention Programs", "Stress Management", "Healthy Lifestyle"]
      },
      {
        "title": "Suicide Prevention",
        "subtopics": ["Risk Identification", "Crisis Intervention", "Safety Planning", "Community Awareness"]
      }
    ]
  },
  {
    "category": "12. Special Topics",
    "topics": [
      {
        "title": "Suicide & Self-Harm",
        "subtopics": ["Suicide Risk Factors", "Suicide Assessment", "Self-Harm", "Prevention"]
      },
      {
        "title": "Psychiatric Emergencies",
        "subtopics": ["Acute Psychosis", "Severe Agitation", "Suicidal Crisis", "Delirium"]
      },
      {
        "title": "Crisis Intervention",
        "subtopics": ["Crisis Assessment", "Psychological First Aid", "Stabilization", "Follow-Up"]
      },
      {
        "title": "Sleep & Circadian Disorders",
        "subtopics": ["Insomnia", "Sleep Apnea", "Narcolepsy", "Circadian Rhythm Disorders"]
      },
      {
        "title": "Eating Disorders",
        "subtopics": ["Anorexia Nervosa", "Bulimia Nervosa", "Binge Eating Disorder", "Eating Disorder Management"]
      },
      {
        "title": "Sexual Disorders",
        "subtopics": ["Sexual Dysfunction", "Paraphilic Disorders", "Sexual Desire Disorders", "Sexual Health Assessment"]
      },
      {
        "title": "Gender-Related Conditions",
        "subtopics": ["Gender Dysphoria", "Gender Identity", "Psychological Support", "Mental Health Assessment"]
      },
      {
        "title": "Psychosomatic Medicine",
        "subtopics": ["Mind-Body Interaction", "Psychophysiological Disorders", "Stress-Related Illness", "Behavioral Medicine"]
      },
      {
        "title": "Disaster Psychiatry",
        "subtopics": ["Psychological First Aid", "Trauma Response", "Acute Stress", "Disaster Mental Health"]
      },
      {
        "title": "Consultation-Liaison Psychiatry",
        "subtopics": ["Psychiatric Consultation", "Medical-Psychiatric Conditions", "Delirium", "Psychosomatic Disorders"]
      },
      {
        "title": "Ethics in Psychiatry",
        "subtopics": ["Informed Consent", "Confidentiality", "Patient Autonomy", "Professional Boundaries"]
      }
    ]
  }
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // 1. Get or Create Subject "Psychiatry"
    let subject = await Subject.findOne({ name: 'Psychiatry' });
    if (!subject) {
      subject = await Subject.create({
        name: 'Psychiatry',
        description: 'Comprehensive clinical knowledge architecture and learning pathways.',
        icon: 'Brain',
      });
      console.log('Created Subject: Psychiatry');
    } else {
      console.log('Found Subject: Psychiatry');
    }

    // 2. Iterate and Seed
    for (const catData of data) {
      const rawCategoryName = catData.category.replace(/^\d+\.\s*/, '').trim(); // Strips "1. " from "1. General Psychiatry"
      let category = await Category.findOne({ name: rawCategoryName, subject: subject._id });
      if (!category) {
        category = await Category.create({
          name: rawCategoryName,
          subject: subject._id,
        });
        console.log(`Created Category: ${category.name}`);
      } else {
        console.log(`Found Category: ${category.name}`);
      }

      for (const [topicIndex, topicData] of catData.topics.entries()) {
        // Topic (Level 1)
        let topic = await Topic.findOne({
          title: topicData.title,
          category: category._id,
          subject: subject._id,
          parentTopic: null,
          level: 1
        });

        if (!topic) {
          const topicSlug = slugify(`${rawCategoryName}-${topicData.title}`, { lower: true, strict: true });
          topic = await Topic.create({
            title: topicData.title,
            slug: topicSlug,
            category: category._id,
            subject: subject._id,
            parentTopic: null,
            level: 1,
            displayOrder: topicIndex + 1
          });
          console.log(`  Created Topic (Level 1): ${topic.title}`);
        }

        // Subtopics (Level 2)
        for (const [subIndex, subTitle] of topicData.subtopics.entries()) {
          let subtopic = await Topic.findOne({
            title: subTitle,
            category: category._id,
            subject: subject._id,
            parentTopic: topic._id,
            level: 2
          });

          if (!subtopic) {
            const subSlug = slugify(`${rawCategoryName}-${topicData.title}-${subTitle}`, { lower: true, strict: true });
            subtopic = await Topic.create({
              title: subTitle,
              slug: subSlug,
              category: category._id,
              subject: subject._id,
              parentTopic: topic._id,
              level: 2,
              displayOrder: subIndex + 1
            });
            console.log(`    Created Subtopic (Level 2): ${subtopic.title}`);
          }
        }
      }
    }

    console.log('Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

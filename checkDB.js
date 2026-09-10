import mongoose from 'mongoose';

async function check() {
  await mongoose.connect('mongodb+srv://tndevelopmentworks_db_user:4n3uOWI9ciK5G4DC@neuro.8zgovmf.mongodb.net/neuromind?retryWrites=true&w=majority&appName=neuro');
  const flashcards = await mongoose.connection.db.collection('flashcards').find({}).toArray();
  console.log(JSON.stringify(flashcards, null, 2));
  process.exit(0);
}

check();

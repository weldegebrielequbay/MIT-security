import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/laptop_registration';
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    try {
      const db = mongoose.connection.db;
      const collections = await db.collections();
      console.log('Collections:', collections.map(c => c.collectionName));
      console.log('Finished');
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Connection Error:', err);
    process.exit(1);
  });

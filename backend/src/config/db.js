import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MONGODB CONNECTED SUCCESSFULLY!');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error connecting to MONGODB', error);
    }
    // exit with failure
    process.exit(1);
  }
};

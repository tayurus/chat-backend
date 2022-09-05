import mongoose from 'mongoose';

export let dbConnection: mongoose.Connection;

export const connectToDB = () => {
  const { MONGO_URI } = process.env;
  // Подключаемся к базе
  return (
    mongoose
      // @ts-ignore
      .connect(MONGO_URI, {
        // @ts-ignore
        useNewUrlParser: true,
        useUnifiedTopology: true,
        replicaSet: 'rs',
      })
      .then(() => {
        dbConnection = mongoose.connection;
      })
      .catch(error => {
        console.log('Подключение к базе добанулось');
        console.log('error = ', error);
        process.exit(1);
      })
  );
};

export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export async function disconnectFromDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

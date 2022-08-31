import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

export async function connectToDB() {
  const uri = await mongod.getUri();
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
  };

  // @ts-ignore
  await mongoose.connect(uri, mongooseOptions);
}

export async function disconnectFromDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

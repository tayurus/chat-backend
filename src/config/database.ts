import mongoose from 'mongoose';

const { MONGO_URI } = process.env;

export let dbConnection: mongoose.Connection;

export const connectToDB = () => {
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
        console.log('К базе подключился, получается');
        dbConnection = mongoose.connection;
      })
      .catch(error => {
        console.log('Подключение к базе добанулось');
        console.log('error = ', error);
        process.exit(1);
      })
  );
};

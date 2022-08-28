import mongoose from 'mongoose';

const { MONGO_URI } = process.env;

export const connectToDB = () => {
  // Подключаемся к базе
  mongoose
    // @ts-ignore
    .connect(MONGO_URI, {
      // @ts-ignore
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('К базе подключился, получается');
    })
    .catch(error => {
      console.log('Подключение к базе добанулось');
      console.log('error = ', error);
      process.exit(1);
    });
};

import { app } from 'src/app';

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

app.listen(port, () => {
  console.log(`Сервер ВНИМАТЕЛЬНО слушает порт: ${port}`);
});

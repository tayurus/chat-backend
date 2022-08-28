import http from 'http';
import { app } from '@/app';

const server = http.createServer(app);

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

server.listen(port, () => {
  console.log(`Сервер ВНИМАТЕЛЬНО слушает порт: ${port}`);
});

import express from 'express';
import cors from 'cors';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());

app.get('/messages/unread', (req, res) => {
  // Генерируем случайное количество сообщений от 1 до 3
  const count = Math.floor(Math.random() * 3) + 1;
  const messages = [];

  for (let i = 0; i < count; i++) {
    messages.push({
      id: uuidv4(),
      from: faker.internet.email(),
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      received: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10000)
    });
  }

  res.json({
    status: 'ok',
    timestamp: Math.floor(Date.now() / 1000),
    messages: messages
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
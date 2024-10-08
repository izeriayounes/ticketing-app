import mongoose from 'mongoose';
import { app } from './app';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { rabbitMQ } from './rabbitmq';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined.');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined.');
  }
  if (!process.env.RABBITMQ_URI) {
    throw new Error('RABBITMQ_URI must be defined.');
  }
  try {
    console.log('Starting up...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongodb');

    await rabbitMQ.connect(process.env.RABBITMQ_URI);
    console.log('Connected to RabbitMQ');

    new OrderCreatedListener(rabbitMQ.channel).listen();
    new OrderCancelledListener(rabbitMQ.channel).listen();

    process.on('SIGINT', async () => {
      await rabbitMQ.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await rabbitMQ.close();
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!');
  });
};

start();

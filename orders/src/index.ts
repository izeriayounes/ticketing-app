import mongoose from 'mongoose';
import { app } from './app';
import { rabbitMQ } from '@eztickets/common';
import { ticketCreatedListener } from './events/listeners/ticket-created-listener';
import { ticketUpdatedListener } from './events/listeners/ticket-updated-listener';

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
    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongodb');

    await rabbitMQ.connect(process.env.RABBITMQ_URI);
    console.log('Connected to RabbitMQ');

    ticketCreatedListener.listen();
    ticketUpdatedListener.listen();
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!');
  });
};

start();

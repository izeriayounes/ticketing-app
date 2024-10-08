import mongoose from 'mongoose';
import { app } from './app';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { rabbitMQ } from './rabbitmq';
import { PaymentCreatedListner } from './events/listeners/payment-created-listener';
import { ExpirationCompletelistener } from './events/listeners/expiration-complete-listener';

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

    new TicketCreatedListener(rabbitMQ.channel).listen();
    new TicketUpdatedListener(rabbitMQ.channel).listen();
    new PaymentCreatedListner(rabbitMQ.channel).listen();
    new ExpirationCompletelistener(rabbitMQ.channel).listen();
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!');
  });
};

start();

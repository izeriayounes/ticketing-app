import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { rabbitMQ } from './rabbitmq';

const start = async () => {
  if (!process.env.RABBITMQ_URI) {
    throw new Error('RABBITMQ_URI must be defined.');
  }
  try {
    await rabbitMQ.connect(process.env.RABBITMQ_URI);
    console.log('Connected to RabbitMQ');

    new OrderCreatedListener(rabbitMQ.channel).listen();
  } catch (err) {
    console.error(err);
  }
};

start();

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: () => string[];
}

jest.mock('../rabbitmq', () => ({
  rabbitMQ: {
    connect: jest.fn().mockResolvedValue(undefined),
    channel: {
      bindQueue: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      assertExchange: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn((queue, callback) => {
        const msg = { content: Buffer.from(JSON.stringify({})) };
        callback(msg);
        return Promise.resolve();
      }),
      publish: jest.fn().mockResolvedValue(true),
      ack: jest.fn().mockResolvedValue(true),
    },
  },
}));

jest.mock('../events/publishers/order-cancelled-publisher');
jest.mock('../events/publishers/order-created-publisher');

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db!.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const email = 'test@test.com';

  const token = jwt.sign({ id, email }, process.env.JWT_KEY!);
  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
};

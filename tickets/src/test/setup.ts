import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: () => string[];
}

jest.mock('../events/publishers/ticket-created-publisher', () => ({
  ticketCreatedPublisher: {
    publish: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../events/publishers/ticket-updated-publisher', () => ({
  ticketUpdatedPublisher: {
    publish: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@eztickets/common', () => {
  const actualModule = jest.requireActual('@eztickets/common');

  return {
    ...actualModule,
    rabbitMQ: {
      getChannel: jest.fn().mockReturnValue({
        ack: jest.fn(),
      }),
    },
  };
});

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
  const email = 'test@test.com';
  const id = 'userid';

  const token = jwt.sign({ id, email }, process.env.JWT_KEY!);
  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
};

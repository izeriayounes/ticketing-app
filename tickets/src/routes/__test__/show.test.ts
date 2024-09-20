import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns a 404 error if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'new title',
    price: 32,
    userId: 'asdsad',
  });

  await ticket.save();
  const tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  const ticketId = tickets[0].id;

  await request(app).get(`/api/tickets/${ticketId}`).send({}).expect(200);
});

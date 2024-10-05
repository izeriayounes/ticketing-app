import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { query } from 'express';
import { Payment } from '../../models/payment';

it('returns a 404 when purchasing a not existing order', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'asldjk',
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 34,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'asldjkasd',
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'userid',
    version: 0,
    status: OrderStatus.Cancelled,
    price: 34,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'asldjkasd',
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'userid',
    version: 0,
    status: OrderStatus.Created,
    price,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(201);

  const charges = await stripe.charges.list();

  const charge = charges.data.find((charge) => charge.amount === price * 100);

  expect(charge).toBeDefined();
  expect(charge!.currency).toEqual('usd');

  const payment = Payment.find({ orderId: order.id, stripeId: charge!.id });

  expect(payment).not.toBeNull();
});
